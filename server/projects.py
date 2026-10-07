from typing import Annotated
from fastapi import APIRouter, Query
from models import ProjectCreate, ProjectRow
from data.projects import list_projects, insert_project
router = APIRouter()

@router.get("/api/projects", response_model=list[ProjectRow])
def get_projects(limit: Annotated[int, Query(ge=1, le=100)] = 100):
    return list_projects(limit)

@router.post("/api/projects", status_code=201, response_model=ProjectRow)
def create_project(project: ProjectCreate):
    return insert_project(project)
