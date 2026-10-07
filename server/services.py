"""Application operations. Keep storage details behind the database boundary.

There are no extra business rules yet, so these functions simply delegate.
"""
import database


def list_members(role=None):
    return database.list_members(role)


def add_member(name, class_year, role):
    # This layer is supplied. The database layer owns the SQL.
    return database.add_member(name, class_year, role)


def list_projects():
    return database.list_projects()


def add_project(name):
    return database.add_project(name)
