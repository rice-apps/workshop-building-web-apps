"""Test real HTTP, proxy, sharing, and restart using an isolated local database."""
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import time
import httpx

ROOT = Path(__file__).resolve().parents[1]

def ready(url, process):
    for _ in range(100):
        if process.poll() is not None:
            raise RuntimeError("Test server exited. Check ports 8000 and 5173 are free.")
        try:
            if httpx.get(url).is_success:
                return
        except httpx.HTTPError:
            pass
        time.sleep(0.1)
    raise RuntimeError("Test server did not become ready.")

def stop(process):
    process.terminate()
    try:
        process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        process.kill()
        process.wait()

with tempfile.TemporaryDirectory() as temporary:
    server = Path(temporary) / "server"
    shutil.copytree(ROOT / "server", server, ignore=shutil.ignore_patterns(".venv*", "__pycache__", ".env", "*.sqlite3*"))
    def start_api():
        return subprocess.Popen([sys.executable, "-m", "uvicorn", "main:app", "--app-dir", str(server), "--host", "127.0.0.1", "--port", "8000"], env={**os.environ, "STORAGE_MODE":"local"}, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    api = start_api()
    vite = None
    try:
        ready("http://127.0.0.1:8000/api/health", api)
        vite = subprocess.Popen(["node", "node_modules/vite/bin/vite.js", "--host", "127.0.0.1"], cwd=ROOT / "client", stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        ready("http://127.0.0.1:5173", vite)
        base = "http://127.0.0.1:5173"
        module = httpx.get(base + "/api.ts")
        assert module.status_code == 200 and "export" in module.text, "Proxy must not intercept api.ts"
        assert "Local SQLite" in httpx.get(base + "/api/health").text
        assert httpx.post(base + "/api/projects", json={"name":"Demo Smoke Project"}).status_code == 201
        row = httpx.post(base + "/api/members", json={"name":"Demo Smoke Member", "role":"designer", "class_year":2029})
        assert row.status_code == 201
        with httpx.Client() as second_client:
            assert second_client.get(base + "/api/members?role=designer").json() == [row.json()]
        stop(api)
        api = start_api()
        ready("http://127.0.0.1:8000/api/health", api)
        assert httpx.get(base + "/api/members").json() == [row.json()]
        print("Live HTTP passed: JS module, proxy, Projects, member insert, second client, backend restart.")
    finally:
        stop(api)
        if vite is not None:
            stop(vite)
