from database import store

def list_members(role=None):
    return store.list("members", role=role)

def insert_member(member):
    # STEP 9: adapt data/projects.py; replace this line with store.insert(...).
    raise NotImplementedError("Step 9: insert the member into the members table.")
