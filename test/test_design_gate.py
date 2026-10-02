import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

module_path = Path(__file__).resolve().parents[1] / "skills/qwen-samkill-ui/references/upstream/reference-review/scripts/design_gate.py"
spec = importlib.util.spec_from_file_location("design_gate", module_path)
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)


class LedgerTests(unittest.TestCase):
    def test_repeated_events_are_not_duplicated(self):
        with tempfile.TemporaryDirectory() as folder:
            ledger = Path(folder) / "events.jsonl"
            gate.record_run(ledger, {"status": "FAIL"}, "abc")
            gate.record_run(ledger, {"status": "FAIL"}, "abc")
            self.assertEqual(len(ledger.read_text().splitlines()), 1)
            self.assertEqual(json.loads(ledger.read_text())["status"], "FAIL")

    def test_broken_ledger_is_preserved_and_lock_released(self):
        with tempfile.TemporaryDirectory() as folder:
            ledger = Path(folder) / "events.jsonl"
            ledger.write_text('{"broken":')
            with self.assertRaises(gate.GateInputError):
                gate.record_run(ledger, {"status": "PASS"}, "abc")
            self.assertEqual(ledger.read_text(), '{"broken":')
            ledger.write_text('')
            gate.record_run(ledger, {"status": "FAIL"}, "def")
            self.assertEqual(len(ledger.read_text().splitlines()), 1)


if __name__ == "__main__":
    unittest.main()
