"""Verify every checkpoint and restore the caller's teaching files even after failures."""
import os
from pathlib import Path
import subprocess
import sys
root = Path(__file__).resolve().parents[1]
paths = [p.relative_to(root / "checkpoints/00-starter") for p in (root / "checkpoints/00-starter").rglob("*") if p.is_file()]
original = {p: (root / p).read_bytes() for p in paths}
def run(args, **kwargs): subprocess.run(args, check=True, **kwargs)
try:
    run([sys.executable, "-m", "pytest", "-q", "tests"], cwd=root)
    for stage in sorted((root / "checkpoints").iterdir()):
        if not stage.is_dir(): continue
        print(f"Verifying {stage.name}", flush=True)
        for p in paths: (root / p).write_bytes((stage / p).read_bytes())
        run(["npm", "run", "build"], cwd=root / "client")
        run(["npm", "test"], cwd=root / "client", env={**os.environ,"STAGE":stage.name})
    run([sys.executable, "scripts/smoke.py"], cwd=root)
finally:
    for p, content in original.items(): (root / p).write_bytes(content)
