"""Server-only storage boundary. SQLite fallback and Supabase REST share a tiny API."""
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4
import httpx
from dotenv import load_dotenv
from models import MemberRow, ProjectRow

ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT / ".env")

class StorageError(Exception):
    pass

class Store:
    def __init__(self, mode=None, path=None, transport=None):
        self.mode = mode or os.getenv("STORAGE_MODE", "local")
        self.path = path or ROOT / "workshop.sqlite3"
        self.transport = transport
        if self.mode not in ("local", "supabase"):
            raise StorageError("STORAGE_MODE must be local or supabase.")
        self.url = os.getenv("SUPABASE_URL", "").rstrip("/")
        self.key = os.getenv("SUPABASE_SERVICE_KEY", "")
        if self.mode == "supabase":
            if not self.url.startswith("https://") or not self.key or "REPLACE" in self.key:
                raise StorageError("Configure server/.env with the host's demo Supabase settings, or use STORAGE_MODE=local.")
        else:
            with sqlite3.connect(self.path) as db:
                for table in ("projects", "members"):
                    db.execute(f"CREATE TABLE IF NOT EXISTS {table} (id TEXT PRIMARY KEY, name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 80), created_at TEXT NOT NULL" + (", class_year INTEGER NOT NULL CHECK(class_year BETWEEN 2000 AND 2100), role TEXT NOT NULL CHECK(role IN ('developer','designer'))" if table == "members" else "") + ")")

    def _table(self, table):
        if table not in ("projects", "members"):
            raise StorageError("Unknown workshop table.")

    def _request(self, method, table, **kwargs):
        # Never log upstream exceptions, request headers, credentials, or response bodies.
        headers = {"apikey": self.key, "Prefer": "return=representation"}
        # Legacy service_role JWTs need Authorization; new secret keys use apikey only.
        if self.key.startswith("eyJ"):
            headers["Authorization"] = f"Bearer {self.key}"
        try:
            with httpx.Client(timeout=8, transport=self.transport) as client:
                response = client.request(method, f"{self.url}/rest/v1/{table}", headers=headers, **kwargs)
                response.raise_for_status()
                return response.json()
        except (httpx.HTTPError, ValueError):
            raise StorageError("Storage unavailable. Host: check server configuration, demo tables, and network.") from None

    def _rows(self, table, rows):
        try:
            model = MemberRow if table == "members" else ProjectRow
            return [model.model_validate(row).model_dump() for row in rows]
        except Exception:
            raise StorageError("Storage returned an unexpected row. Check the demo schema.") from None

    def list(self, table, limit=100, role=None):
        self._table(table)
        try:
            if self.mode == "supabase":
                params = {"select": "*", "order": "created_at.asc,id.asc", "limit": str(limit)}
                if role is not None:
                    params["role"] = "eq." + role
                rows = self._request("GET", table, params=params)
            else:
                with sqlite3.connect(self.path) as db:
                    db.row_factory = sqlite3.Row
                    where = " WHERE role = ?" if role is not None else ""
                    args = (role, limit) if role is not None else (limit,)
                    rows = [dict(row) for row in db.execute(f"SELECT * FROM {table}{where} ORDER BY created_at, id LIMIT ?", args)]
            return self._rows(table, rows)
        except sqlite3.Error:
            raise StorageError("Local storage unavailable. Check the server folder is writable.") from None

    def insert(self, table, payload):
        self._table(table)
        try:
            if self.mode == "supabase":
                rows = self._request("POST", table, json=payload)
            else:
                row = {"id": str(uuid4()), **payload, "created_at": datetime.now(timezone.utc).isoformat()}
                columns = ["id", "name", "created_at"] + (["role", "class_year"] if table == "members" else [])
                with sqlite3.connect(self.path) as db:
                    db.execute(f"INSERT INTO {table} ({','.join(columns)}) VALUES ({','.join('?' for _ in columns)})", [row[k] for k in columns])
                rows = [row]
            result = self._rows(table, rows)
            if len(result) != 1:
                raise StorageError("Storage did not confirm one inserted row.")
            return result[0]
        except sqlite3.Error:
            raise StorageError("Local insert failed. Check the demo data and server folder.") from None

store = Store()
