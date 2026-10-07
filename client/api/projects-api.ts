// Project describes the project data exchanged with the Python server.
import type { Project } from "../types";

// "export" lets the page handler call this function.
// "async" lets us use "await" to wait for a request to finish.
// Promise<Project[]> means the result will eventually be a list of projects.
export async function listProjects(): Promise<Project[]> {
  // fetch uses GET by default. GET asks the server to read data.
  const response = await fetch("/api/projects");

  // fetch does not throw just because the server returns an HTTP error.
  if (!response.ok) {
    throw new Error("Could not load projects (" + response.status + ").");
  }

  // Convert the JSON response into JavaScript data for the page handler.
  const projects: Project[] = await response.json();
  return projects;
}

// name: string means the input is text. The result is one saved Project.
export async function addProject(name: string): Promise<Project> {
  // Build the object the server expects, then convert it to JSON text.
  const newProject = {
    name: name,
  };
  const requestBody = JSON.stringify(newProject);

  // POST asks the server to create a record. The header identifies JSON.
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: requestBody,
  });

  // The server returns the saved project, including its generated ID.
  const savedProject: Project = await response.json();
  return savedProject;
}
