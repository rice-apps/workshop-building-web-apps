import importlib
import shutil
import sys
from pathlib import Path
import httpx
import pytest
from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
STAGES = [p.name for p in sorted((ROOT / "checkpoints").iterdir()) if p.is_dir()]

@pytest.fixture(params=STAGES)
def app_stage(request, tmp_path, monkeypatch):
    work = tmp_path / "server"
    shutil.copytree(ROOT / "server", work, ignore=shutil.ignore_patterns(".venv*", "__pycache__", ".env", "*.sqlite3*"))
    shutil.copytree(ROOT / "checkpoints" / request.param / "server", work, dirs_exist_ok=True)
    monkeypatch.setenv("STORAGE_MODE", "local")
    monkeypatch.syspath_prepend(str(work))
    for name in list(sys.modules):
        if name in ("main", "members", "projects", "models", "database", "data") or name.startswith("data."):
            del sys.modules[name]
    main = importlib.import_module("main")
    yield TestClient(main.app), request.param, main.store


def test_reference_and_validation(app_stage):
    client, stage, store = app_stage
    assert client.get("/api/projects").json() == []
    for body in ({"name": " "}, {"name": "x"*81}, {"name": 3}, {}, {"name":"x", "extra":True}):
        assert client.post("/api/projects", json=body).status_code == 422
        assert client.post("/api/members", json=body).status_code == 422
    assert client.post("/api/members", json={"name":"A", "role":"admin"}).status_code == 422
    for year in (1999, 2101, "2028", 2028.5):
        assert client.post("/api/members", json={"name":"A", "class_year":year}).status_code == 422
    for name in (" Demo Project A ", "Demo Project B"):
        response = client.post("/api/projects", json={"name":name})
        assert response.status_code == 201
        assert response.json()["name"] == name.strip()
    assert len(client.get("/api/projects?limit=1").json()) == 1
    assert client.get("/api/projects?limit=0").status_code == 422
    assert client.get("/api/projects?limit=101").status_code == 422
    assert client.get("/api/health").json()["storage"] == "local"


def test_member_contract(app_stage):
    client, stage, store = app_stage
    response = client.post("/api/members", json={"name":" Demo Test ", "role":"designer"})
    if stage < "09":
        assert response.status_code == 200 and response.json() == {"received":True}
        assert store.list("members") == []
        if stage == "08-hardcoded":
            assert client.get("/api/members").json()[0]["name"] == "Demo Member A"
            assert client.get("/api/members?role=designer").json() == []
        else:
            assert client.get("/api/members").status_code == 405
    else:
        assert response.status_code == 201
        row = response.json()
        assert row["name"] == "Demo Test" and row["id"] and row["created_at"]
        assert client.get("/api/members?role=developer").json() == []
        assert client.get("/api/members?role=designer").json() == [row]
        assert client.get("/api/members?role=admin").status_code == 422
        # Independent client, same app/store; re-open SQLite to simulate process storage lifetime.
        assert TestClient(client.app).get("/api/members").json() == [row]
        assert type(store)(mode="local", path=store.path).list("members") == [row]


def test_storage_error_is_safe(app_stage, monkeypatch):
    client, stage, store = app_stage
    from database import StorageError
    def broken(*args, **kwargs):
        raise StorageError("Storage unavailable. Check host configuration.")
    monkeypatch.setattr(store, "insert", broken)
    response = client.post("/api/projects", json={"name":"Demo Failure"})
    assert response.status_code == 503
    assert "Storage unavailable" in response.json()["detail"]
    if stage >= "09":
        assert client.post("/api/members", json={"name":"Demo Failure"}).status_code == 503


def test_supabase_adapter_mock_only(app_stage, monkeypatch):
    _, _, local = app_stage
    from database import Store, StorageError
    monkeypatch.setenv("SUPABASE_URL", "https://demo.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_KEY", "fake-test-key")
    row = {"id":"test-id", "name":"Demo Remote", "role":"designer", "class_year":2028, "created_at":"2026-10-07T00:00:00Z"}
    def handler(request):
        assert request.headers["apikey"] == "fake-test-key"
        assert request.url.path == "/rest/v1/members"
        if request.method == "GET":
            assert request.url.params["role"] == "eq.designer"
        else:
            assert request.headers["prefer"] == "return=representation"
            assert b'Demo Remote' in request.content
        return httpx.Response(200 if request.method == "GET" else 201, json=[row])
    remote = Store(mode="supabase", transport=httpx.MockTransport(handler))
    assert remote.list("members", role="designer") == [row]
    assert remote.insert("members", {"name":"Demo Remote", "role":"designer"}) == row
    for status in (401, 403, 500):
        remote.transport = httpx.MockTransport(lambda request: httpx.Response(status, text="DO-NOT-EXPOSE"))
        with pytest.raises(StorageError) as error:
            remote.list("members")
        assert "DO-NOT-EXPOSE" not in str(error.value)
    remote.transport = httpx.MockTransport(lambda request: httpx.Response(201, json=[]))
    with pytest.raises(StorageError):
        remote.insert("members", {"name":"Demo Remote", "role":"designer"})
