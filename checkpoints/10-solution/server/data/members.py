from database import store

def list_members(role=None):
    return store.list("members", role=role)

def insert_member(member):
    return store.insert("members", {"name": member.name, "role": member.role, "class_year": member.class_year})
