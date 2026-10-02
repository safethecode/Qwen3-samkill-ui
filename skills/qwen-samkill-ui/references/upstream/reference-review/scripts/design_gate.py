import argparse
from contextlib import contextmanager
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import sys

if os.name == "nt":
    import msvcrt
else:
    import fcntl


@contextmanager
def ledger_lock(ledger):
    with ledger.with_suffix(ledger.suffix + ".lock").open("a+b") as lock:
        if os.name == "nt":
            lock.seek(0, 2)
            if lock.tell() == 0:
                lock.write(b"0")
                lock.flush()
            lock.seek(0)
            msvcrt.locking(lock.fileno(), msvcrt.LK_LOCK, 1)
        else:
            fcntl.flock(lock.fileno(), fcntl.LOCK_EX)
        try:
            yield
        finally:
            if os.name == "nt":
                lock.seek(0)
                msvcrt.locking(lock.fileno(), msvcrt.LK_UNLCK, 1)
            else:
                fcntl.flock(lock.fileno(), fcntl.LOCK_UN)


class GateInputError(ValueError):
    pass


KINDS = {"spec", "code", "visual", "interaction"}
IGNORED = {".git", "node_modules", "__pycache__", ".DS_Store"}
DEFAULT_CATALOG = Path(__file__).resolve().parents[1] / "references/failure-catalog.json"


def digest(data):
    return hashlib.sha256(data).hexdigest()


def read_object(path):
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise GateInputError(f"Expected JSON object: {path}")
    return value


def nonempty(value):
    return isinstance(value, str) and bool(value.strip())


def index_records(value, label):
    if not isinstance(value, list):
        raise GateInputError(f"{label} must be an array")
    result = {}
    for item in value:
        if not isinstance(item, dict) or not nonempty(item.get("id")):
            raise GateInputError(f"{label} entries need an id")
        if item["id"] in result:
            raise GateInputError(f"Duplicate {label} id: {item['id']}")
        result[item["id"]] = item
    return result


def inside(root, name):
    if not nonempty(name) or Path(name).is_absolute():
        raise GateInputError("Evidence/target paths must be relative to --root")
    path = (root / name).resolve()
    if not path.is_relative_to(root):
        raise GateInputError(f"Path outside project: {name}")
    return path


def target_digest(root, targets):
    if not isinstance(targets, list) or not targets:
        raise GateInputError("contract.targets must name the complete review scope")
    records = {}
    for name in targets:
        target = inside(root, name)
        if not target.exists():
            raise GateInputError(f"Missing target: {name}")
        files = target.rglob("*") if target.is_dir() else [target]
        for path in files:
            if any(part in IGNORED for part in path.relative_to(root).parts):
                continue
            if not path.resolve().is_relative_to(root):
                raise GateInputError(f"Target link outside project: {path}")
            if path.is_symlink():
                raise GateInputError(f"Use real target paths, not symlinks: {path}")
            if path.is_file():
                records[str(path.relative_to(root))] = digest(path.read_bytes())
    if not records:
        raise GateInputError("No target files to review")
    return digest(json.dumps(records, sort_keys=True).encode())


def fingerprints(root, catalog_path, contract_path, contract):
    return {
        "catalog_sha256": digest(catalog_path.read_bytes()),
        "contract_sha256": digest(contract_path.read_bytes()),
        "target_sha256": target_digest(root, contract.get("targets")),
    }


def check_kinds(value, label):
    if not isinstance(value, list) or not value or any(k not in KINDS for k in value):
        raise GateInputError(f"{label} needs spec/code/visual/interaction checks")
    return set(value)


def evidence_kinds(root, items):
    if not isinstance(items, list):
        raise GateInputError("evidence must be an array")
    kinds = set()
    for item in items:
        if not isinstance(item, dict) or item.get("kind") not in KINDS:
            raise GateInputError("Invalid evidence kind")
        path = inside(root, item.get("path"))
        if not path.is_file():
            raise GateInputError(f"Missing evidence: {item.get('path')}")
        if item.get("sha256") != digest(path.read_bytes()):
            raise GateInputError(f"Changed evidence: {item.get('path')}")
        kinds.add(item["kind"])
    return kinds


def judge(root, catalog, contract, report, current):
    errors, failures = [], []
    for label, obj in [("catalog", catalog), ("contract", contract), ("report", report)]:
        if obj.get("schema_version") != 1:
            errors.append(f"Unsupported {label} schema_version")
    if contract.get("catalog_version") != catalog.get("version"):
        errors.append("Catalog version changed")
    for key, value in current.items():
        if report.get(key) != value:
            errors.append(f"Stale or missing {key}; repeat affected inspection")
    library = index_records(catalog.get("rules"), "catalog rules")
    planned = index_records(contract.get("rules"), "contract rules")
    results = index_records(report.get("results"), "results")
    active = {key for key, value in library.items() if value.get("status") == "active"}
    for missing in sorted(active - planned.keys()):
        errors.append(f"Catalog rule missing from contract: {missing}")
    for missing in sorted(planned.keys() - results.keys()):
        errors.append(f"Missing result: {missing}")
    for extra in sorted(results.keys() - planned.keys()):
        errors.append(f"Unplanned result: {extra}")
    for key, rule in planned.items():
        try:
            if not nonempty(rule.get("scope")) or not nonempty(rule.get("reason")):
                raise GateInputError("scope and applicability reason are required")
            if type(rule.get("applicable")) is not bool:
                raise GateInputError("applicable must be boolean")
            required = check_kinds(rule.get("checks"), "rule")
            if key in active and not check_kinds(library[key].get("checks"), "catalog").issubset(required):
                raise GateInputError("Contract weakens catalog evidence requirements")
            exceptions = index_records(rule.get("exceptions", []), "exceptions")
            if any(not nonempty(e.get("reason")) for e in exceptions.values()):
                raise GateInputError("Each exception needs a reason")
            result = results.get(key)
            if result is None:
                continue
            if not nonempty(result.get("reason")):
                raise GateInputError("Result needs a concrete finding/reason")
            status = result.get("status")
            if not rule["applicable"]:
                if status != "not-applicable":
                    raise GateInputError("Out-of-scope rule must be explicitly not-applicable")
                continue
            if status == "unknown":
                raise GateInputError("Inspection incomplete")
            if status not in {"pass", "fail", "exception"}:
                raise GateInputError("Applicable rule needs pass/fail/unknown/exception")
            if status == "exception" and result.get("exception_id") not in exceptions:
                raise GateInputError("Undeclared exception")
            kinds = evidence_kinds(root, result.get("evidence"))
            if not required.issubset(kinds):
                raise GateInputError(f"Missing evidence kinds: {sorted(required - kinds)}")
            if status == "fail":
                failures.append(key)
        except (GateInputError, OSError) as exc:
            errors.append(f"{key}: {exc}")
    status = "UNVERIFIED" if errors else "FAIL" if failures else "PASS"
    return {"status": status, "errors": errors, "failures": failures,
            "catalog_version": catalog.get("version"), **current,
            "results": report.get("results", [])}


def record_run(ledger, outcome, report_hash):
    event = {**outcome, "report_sha256": report_hash}
    event_id = digest(json.dumps(event, sort_keys=True, ensure_ascii=False).encode())
    event.update(event_id=event_id, recorded_at=datetime.now(timezone.utc).isoformat())
    ledger.parent.mkdir(parents=True, exist_ok=True)
    with ledger_lock(ledger), ledger.open("a+", encoding="utf-8") as stream:
        stream.seek(0)
        existing = stream.read()
        if existing and not existing.endswith("\n"):
            raise GateInputError("Incomplete ledger line; preserve and investigate before appending")
        prior = [json.loads(line) for line in existing.splitlines()]
        if any(not isinstance(row, dict) for row in prior):
            raise GateInputError("Malformed ledger event")
        if not any(row.get("event_id") == event_id for row in prior):
            stream.seek(0, 2)
            stream.write(json.dumps(event, ensure_ascii=False) + "\n")
            stream.flush()


def main():
    parser = argparse.ArgumentParser(description="Validate evidence-backed design decisions, not image aesthetics.")
    parser.add_argument("command", choices=["fingerprint", "check"])
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--catalog", type=Path, default=DEFAULT_CATALOG)
    parser.add_argument("--contract", type=Path, required=True)
    parser.add_argument("--report", type=Path)
    parser.add_argument("--ledger", type=Path)
    args = parser.parse_args()
    try:
        root = args.root.resolve(strict=True)
        contract = read_object(args.contract)
        current = fingerprints(root, args.catalog, args.contract, contract)
        if args.command == "fingerprint":
            print(json.dumps(current))
            return 0
        if args.report is None:
            raise GateInputError("check requires --report")
        catalog, report = read_object(args.catalog), read_object(args.report)
        outcome = judge(root, catalog, contract, report, current)
        if args.ledger:
            record_run(args.ledger, outcome, digest(args.report.read_bytes()))
    except (OSError, ValueError, TypeError) as exc:
        outcome = {"status": "UNVERIFIED", "errors": [str(exc)], "failures": []}
    print(json.dumps(outcome, ensure_ascii=False))
    return {"PASS": 0, "FAIL": 1, "UNVERIFIED": 2}[outcome["status"]]


if __name__ == "__main__":
    sys.exit(main())
