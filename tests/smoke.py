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
        return subprocess.Popen([sys.executable, "-m", "uvicorn", "main:app", "--app-dir", str(server), "--host", "127.0.0.1", "--port", "8000"], env={**os.environ, "WORKSHOP_DATABASE":str(Path(temporary) / "smoke.sqlite3")}, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    api = start_api()
    vite = None
    try:
        ready("http://127.0.0.1:8000/api/projects", api)
        vite = subprocess.Popen(["node", "node_modules/vite/bin/vite.js", "--config", "client/vite.config.ts", "--host", "127.0.0.1"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        ready("http://127.0.0.1:5173/ui/members.html", vite)
        base = "http://127.0.0.1:5173"
        # Follow both pages' navigation and asset URLs through the live server.
        for page in ("members", "projects"):
            html = httpx.get(base + f"/ui/{page}.html")
            assert html.status_code == 200
            for link in ("/ui/members.html", "/ui/projects.html", "/ui/styles.css"):
                assert f'href="{link}"' in html.text
                assert httpx.get(base + link).status_code == 200
            script = f"/event-handlers/{page}.ts"
            assert f'src="{script}"' in html.text
            assert httpx.get(base + script).status_code == 200
            assert httpx.get(base + f"/api/{page}-api.ts").status_code == 200
        module = httpx.get(base + "/api/members-api.ts")
        assert module.status_code == 200 and "export" in module.text, "Proxy must not intercept TypeScript modules"
        project = httpx.post(base + "/api/projects", json={"name":"Demo Smoke Project"})
        assert project.status_code == 201
        row = httpx.post(base + "/api/members", json={"name":"Demo Smoke Member", "role":"designer", "class_year":2029})
        assert row.status_code == 501
        with httpx.Client() as second_client:
            assert second_client.get(base + "/api/members?role=designer").json() == []
            assert project.json() in second_client.get(base + "/api/projects").json()
        stop(api)
        api = start_api()
        ready("http://127.0.0.1:8000/api/projects", api)
        assert httpx.get(base + "/api/members").json() == []
        assert project.json() in httpx.get(base + "/api/projects").json()
        print("Live HTTP passed: JS module, proxy, Projects, unfinished member 501/no insert, second client, backend restart.")
    finally:
        stop(api)
        if vite is not None:
            stop(vite)
