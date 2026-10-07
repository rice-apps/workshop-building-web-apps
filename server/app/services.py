"""Application operations. Keep storage details behind the database boundary.

There are no extra business rules yet, so these functions simply delegate.
"""
from . import database


def list_members(role=None):
    return database.list_members(role)


def add_member(name, class_year, role):
    # TODO 3: pass these values to database.add_member and return its result.
    # Use add_project below as the reference. Keep SQL in database.py.
    raise NotImplementedError("Add Member service is not implemented yet.")


def list_projects():
    return database.list_projects()


def add_project(name):
    return database.add_project(name)
