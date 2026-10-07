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


def test_add_list_and_persistence(client):
    assert client.get("/api/members").json() == []
    payload = {"name": " Demo Member ", "class_year": 2028, "role": "designer"}
    response = client.post("/api/members", json=payload)
    assert response.status_code == 201
    row = response.json()
    assert row["name"] == "Demo Member" and row["id"] and row["created_at"]
    assert client.get("/api/members?role=designer").json() == [row]
    assert client.get("/api/members?role=developer").json() == []
    with TestClient(app) as second_client:
        assert second_client.get("/api/members").json() == [row]
    database.initialize()
    assert database.list_members() == [row]
    project = client.post("/api/projects", json={"name": " Demo Project "})
    assert project.status_code == 201
    assert project.json() in client.get("/api/projects").json()
    assert len([p for p in database.list_projects() if p["id"] == "demo-project"]) == 1


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
    monkeypatch.setattr(database, "add_member", fail)
    response = client.post("/api/members", json={"name":"Demo", "class_year":2028, "role":"developer"})
    assert response.status_code == 503
    assert "private database details" not in response.text
