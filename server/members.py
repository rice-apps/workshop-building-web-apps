import logging
from typing import Literal
from fastapi import APIRouter
from models import MemberCreate, MemberRow
from data.members import list_members, insert_member
router = APIRouter()

# STEP 8: add a GET /api/members route returning a hardcoded list here.

@router.post("/api/members")
def create_member(member: MemberCreate):
    # Diagnostic receipt only. Log field metadata, never raw user content or secrets.
    logging.getLogger("uvicorn.error").info("Member diagnostic received: name length=%s, role=%s", len(member.name), member.role)
    return {"received": True}
