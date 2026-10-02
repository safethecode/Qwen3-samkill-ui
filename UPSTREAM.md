# Upstream reference snapshot

Source: https://github.com/safethecode/samkill-ui

Commit: `c4ddc53f18519d8e95eebb29c7d261b34d691398`

The eight source skill directories are retained under `skills/qwen-samkill-ui/references/upstream`. Their entry files and links were renamed from `SKILL.md` to `guide.md` to prevent duplicate skill discovery. They are reference material, not eight additional installed skills. The new entry point adds a local-model execution contract without replacing upstream design guidance.

The resume evaluation is a reduced, independently written task contract inspired by Round 09. Passing it does not certify equivalence to the full Round 09 design. No upstream application implementation or screenshots are included.

The copied Python design gate uses a sidecar file lock with Windows `msvcrt` or Unix `fcntl`; its evidence validation rules are retained. Run all writers through this version rather than mixing it with the upstream ledger-lock protocol. Existing malformed ledgers remain errors. Source comments/docstrings were removed from that script for this repository's style requirement.
