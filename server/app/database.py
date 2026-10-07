"""SQLite owns schema, SQL, and storage. No HTTP or browser code belongs here."""
from contextlib import contextmanager
import os
import sqlite3
from pathlib import Path
from uuid import uuid4

DATABASE_PATH = Path(os.getenv("WORKSHOP_DATABASE", Path(__file__).resolve().parents[1] / "workshop.sqlite3"))


@contextmanager
def connect():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    try:
        with connection:
            yield connection
    finally:
        connection.close()


def initialize():
    with connect() as connection:
        connection.executescript("""
            CREATE TABLE IF NOT EXISTS members (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 80),
                class_year INTEGER NOT NULL CHECK(class_year BETWEEN 2000 AND 2100),
                role TEXT NOT NULL CHECK(role IN ('developer', 'designer')),
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 80),
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        """)
        # Fixed IDs make the fictional seed safe to repeat on startup.
        connection.execute(
            "INSERT OR IGNORE INTO projects (id, name) VALUES (?, ?)",
            ("demo-project", "Demo Campus Garden"),
        )


def list_members(role=None):
    with connect() as connection:
        if role is None:
            rows = connection.execute("SELECT * FROM members ORDER BY created_at, id")
        else:
            rows = connection.execute(
                "SELECT * FROM members WHERE role = ? ORDER BY created_at, id", (role,)
            )
        return [dict(row) for row in rows]


def add_member(name, class_year, role):
    # TODO 4: create an ID, INSERT name/class_year/role, and return the saved row.
    # Use add_project below as the reference. Use ? placeholders for values.
    # The members table and connection helper are already supplied.
    raise NotImplementedError("Add Member database insert is not implemented yet.")


def list_projects():
    with connect() as connection:
        rows = connection.execute("SELECT * FROM projects ORDER BY created_at, id")
        return [dict(row) for row in rows]


def add_project(name):
    project_id = str(uuid4())
    with connect() as connection:
        connection.execute("INSERT INTO projects (id, name) VALUES (?, ?)", (project_id, name))
        row = connection.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()
        return dict(row)
