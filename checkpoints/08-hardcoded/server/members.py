import logging
from typing import Literal
from fastapi import APIRouter
from models import MemberCreate, MemberRow
from data.members import list_members, insert_member
router = APIRouter()

@router.get("/api/members")
def get_members(role: Literal["developer", "designer"] | None = None):
    rows = [{"id": "demo-1", "name": "Demo Member A", "role": "developer", "class_year": 2028}]
    return [row for row in rows if role is None or row["role"] == role]

@router.post("/api/members")
def create_member(member: MemberCreate):
    # Diagnostic receipt only. Log field metadata, never raw user content or secrets.
    logging.getLogger("uvicorn.error").info("Member diagnostic received: name length=%s, role=%s", len(member.name), member.role)
    return {"received": True}
