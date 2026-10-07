"""HTTP boundary: validate requests, call application operations, return JSON."""
from contextlib import asynccontextmanager
import sqlite3
from typing import Annotated, Literal
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field, StringConstraints
import database
import services

Name = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=80, strict=True)]
Role = Literal["developer", "designer"]


class ProjectInput(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: Name


class MemberInput(ProjectInput):
    class_year: Annotated[int, Field(ge=2000, le=2100, strict=True)]
    role: Role


@asynccontextmanager
async def lifespan(app):
    # Before serving requests: ensure the tables and sample project exist.
    database.initialize()
    yield
    # After yield would be shutdown cleanup; none is needed here.


app = FastAPI(title="RiceApps", lifespan=lifespan)


@app.exception_handler(sqlite3.Error)
def storage_error(request: Request, error: sqlite3.Error):
    # Keep database internals out of responses and logs.
    return JSONResponse(status_code=503, content={"detail": "Database unavailable. Check the server's database file and permissions."})


# Keep unfinished exercises honest: 501 means this feature is not implemented.
@app.exception_handler(NotImplementedError)
def unfinished_feature(request: Request, error: NotImplementedError):
    return JSONResponse(status_code=501, content={"detail": str(error)})


@app.get("/api/members")
def list_members(role: Role | None = None):
    return services.list_members(role)


@app.post("/api/members", status_code=201)
def add_member(member: MemberInput):
    # HTTP wiring and validation are supplied; implement the service below this boundary.
    return services.add_member(member.name, member.class_year, member.role)


@app.get("/api/projects")
def list_projects():
    return services.list_projects()


@app.post("/api/projects", status_code=201)
def add_project(project: ProjectInput):
    return services.add_project(project.name)
