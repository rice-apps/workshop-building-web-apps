"""Copy a teaching snapshot; always back up the five current files first."""
import argparse
import shutil
from datetime import datetime
from pathlib import Path
root = Path(__file__).resolve().parents[1]
p = argparse.ArgumentParser(description=__doc__)
p.add_argument("stage", choices=sorted(x.name for x in (root / "checkpoints").iterdir() if x.is_dir()))
args = p.parse_args()
source = root / "checkpoints" / args.stage
backup = root / ".checkpoint-backups" / datetime.now().strftime("%Y%m%d-%H%M%S-%f")
files = [f for f in source.rglob("*") if f.is_file() and "__pycache__" not in f.parts]
for file in files:
    target = root / file.relative_to(source)
    if target.exists():
        saved = backup / file.relative_to(source)
        saved.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(target, saved)
for file in files:
    shutil.copy2(file, root / file.relative_to(source))
print(f"Applied {args.stage}. Previous teaching files preserved at {backup}")
print("Restart FastAPI (or let --reload restart it), then refresh the browser.")
