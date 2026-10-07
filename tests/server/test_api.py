import sqlite3
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "server"))
from app import database
from app.main import app


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(database, "DATABASE_PATH", tmp_path / "test.sqlite3")
    with TestClient(app) as client:
        yield client


def test_stub_and_working_reference(client):
    assert client.get("/api/members").json() == []
    payload = {"name": "Demo Member", "class_year": 2028, "role": "designer"}
    response = client.post("/api/members", json=payload)
    assert response.status_code == 501
    assert "not implemented" in response.json()["detail"]
    assert database.list_members() == []
    # Seed a fixture directly to test the completed list/filter independently.
    with database.connect() as connection:
        connection.execute("INSERT INTO members (id, name, class_year, role) VALUES (?, ?, ?, ?)",
                           ("fixture-member", "Demo Existing", 2028, "designer"))
    assert client.get("/api/members?role=designer").json()[0]["name"] == "Demo Existing"
    assert client.get("/api/members?role=developer").json() == []
    project = client.post("/api/projects", json={"name": " Demo Project "})
    assert project.status_code == 201
    assert project.json()["name"] == "Demo Project"
    database.initialize()
    assert project.json() in client.get("/api/projects").json()
    assert len([p for p in database.list_projects() if p["id"] == "demo-project"]) == 1


def test_unfinished_lower_layers(client):
    from app import services
    with pytest.raises(NotImplementedError):
        services.add_member("Demo", 2028, "designer")
    with pytest.raises(NotImplementedError):
        database.add_member("Demo", 2028, "designer")
    assert database.list_members() == []


@pytest.mark.parametrize("name", ["", "   ", "x" * 81, 7, None])
def test_invalid_name(client, name):
    assert client.post("/api/projects", json={"name": name}).status_code == 422
    assert client.post("/api/members", json={"name": name, "class_year":2028, "role":"designer"}).status_code == 422


@pytest.mark.parametrize("year", [1999, 2101, "2028", 2028.5, None])
def test_invalid_year(client, year):
    assert client.post("/api/members", json={"name":"Demo", "class_year":year, "role":"developer"}).status_code == 422


def test_invalid_role_and_body(client):
    assert client.get("/api/members?role=admin").status_code == 422
    assert client.post("/api/members", json={"name":"Demo", "class_year":2028, "role":"admin"}).status_code == 422
    assert client.post("/api/members", json={"name":"Demo"}).status_code == 422
    assert client.post("/api/projects", json={"name":"Demo", "extra":True}).status_code == 422


def test_database_error(client, monkeypatch):
    def fail(*args):
        raise sqlite3.OperationalError("private database details")
    monkeypatch.setattr(database, "add_project", fail)
    response = client.post("/api/projects", json={"name":"Demo"})
    assert response.status_code == 503
    assert "private database details" not in response.text
