"""Optional fictional local seed; intentionally refuses a Supabase configuration."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "server"))
from database import store
if store.mode != "local":
    raise SystemExit("This seed command only supports local fallback mode.")
for table, payload in [("projects", {"name": "Demo Campus Garden"}), ("members", {"name": "Demo Member A", "role": "developer", "class_year": 2028})]:
    if not any(row["name"] == payload["name"] for row in store.list(table)):
        store.insert(table, payload)
print("Local fictional sample data ready.")
