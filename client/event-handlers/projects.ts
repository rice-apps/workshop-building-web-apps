// These functions send HTTP requests; this file handles the page itself.
import { listProjects, addProject } from "../api/projects-api";

// Find the HTML elements we need. "as" tells TypeScript what kind each is.
const nameInput = document.getElementById("name") as HTMLInputElement;
const submitButton = document.getElementById("add-project") as HTMLButtonElement;
const reloadButton = document.getElementById("reload") as HTMLButtonElement;
const list = document.getElementById("list") as HTMLUListElement;

// "async" allows us to use "await" to wait for an HTTP request to finish.
async function loadProjects() {
  const projects = await listProjects();

  // Replace the old list with the records returned by the server.
  list.replaceChildren();
  for (const project of projects) {
    const item = document.createElement("li");
    // textContent displays names as text, never as HTML.
    item.textContent = project.name;
    list.append(item);
  }
}

async function handleSubmit() {
  console.log("Saving…");

  const name = nameInput.value;

  // Wait for the server to save. It returns the saved project.
  const savedProject = await addProject(name);

  // Add this returned project to the UI!
  const item = document.createElement("li");
  item.textContent = savedProject.name;
  list.append(item);

  // Clear the input fields afterwards.
  nameInput.value = "";
  console.log("Project saved.");
}

// Connect the HTML controls to our functions.
submitButton.onclick = handleSubmit;
reloadButton.onclick = loadProjects;

// Load existing records as soon as this page opens.
loadProjects();
