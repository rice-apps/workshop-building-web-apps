import type { Project } from "../types";

export async function listProjects(): Promise<Project[]> {
  const response = await fetch("/api/projects");
  if (!response.ok) throw new Error(`Could not load projects (${response.status}).`);
  return response.json();
}

export async function addProject(name: string): Promise<Project> {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    throw new Error(response.status === 422
      ? "Check the form values and try again."
      : `Could not save project (${response.status}).`);
  }
  return response.json();
}
