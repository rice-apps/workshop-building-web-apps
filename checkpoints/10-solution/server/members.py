from typing import Literal
from fastapi import APIRouter
from models import MemberCreate, MemberRow
from data.members import list_members, insert_member
router = APIRouter()

@router.get("/api/members", response_model=list[MemberRow])
def get_members(role: Literal["developer", "designer"] | None = None):
    return list_members(role)

@router.post("/api/members", status_code=201, response_model=MemberRow)
def create_member(member: MemberCreate):
    return insert_member(member)
