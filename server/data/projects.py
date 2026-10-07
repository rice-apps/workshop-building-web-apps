from database import store

def list_projects(limit=100):
    return store.list("projects", limit=limit)

def insert_project(project):
    return store.insert("projects", {"name": project.name})
