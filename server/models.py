from typing import Annotated, Literal
from pydantic import BaseModel, ConfigDict, StringConstraints, Field

Name = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=80, strict=True)]

class ProjectCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: Name

class MemberCreate(ProjectCreate):
    class_year: Annotated[int, Field(ge=2000, le=2100, strict=True)] = 2028
    role: Literal["developer", "designer"] = "developer"

class ProjectRow(ProjectCreate):
    id: str
    created_at: str

class MemberRow(MemberCreate):
    id: str
    created_at: str
