// These functions send HTTP requests; this file handles the page itself.
import { listProjects, addProject } from "../api/projects-api";

// Find the HTML elements we need. "as" tells TypeScript what kind each is.
const nameInput = document.getElementById("name") as HTMLInputElement;
const submitButton = document.getElementById("add-project") as HTMLButtonElement;
const reloadButton = document.getElementById("reload") as HTMLButtonElement;
const status = document.getElementById("status") as HTMLParagraphElement;
let saving = false;

const list = document.getElementById("list") as HTMLUListElement;

// "async" lets us await the server response without blocking the page.
async function loadProjects() {
  if (saving) {
    return;
  }
  submitButton.disabled = true;
  reloadButton.disabled = true;
  try {
    const projects = await listProjects();

    // Replace the old list with the records returned by the server.
    list.replaceChildren();
    for (const project of projects) {
      const item = document.createElement("li");
      // textContent displays names as text, never as HTML.
      item.textContent = project.name;
      list.append(item);
    }
  } catch {
    status.textContent = "Could not load projects. Check the server and reload.";
  } finally {
    submitButton.disabled = false;
    reloadButton.disabled = false;
  }
}

async function handleSubmit() {
  if (saving) {
    return;
  }

  const name = nameInput.value.trim();
  if (name.length === 0 || Array.from(name).length > 80) {
    status.textContent = "Enter a name between 1 and 80 characters.";
    return;
  }

  saving = true;
  submitButton.disabled = true;
  reloadButton.disabled = true;

  // Optimistic rendering: show the entry before waiting for the server.
  const item = document.createElement("li");
  item.textContent = name;
  list.append(item);
  status.textContent = "Saving…";

  try {
    await addProject(name);
    nameInput.value = "";
    status.textContent = "Project saved.";
  } catch (error) {
    // Undo the optimistic entry if the request fails. Keep the inputs for retry.
    item.remove();
    if (error instanceof Error) {
      status.textContent = error.message;
    } else {
      status.textContent = "Could not save. Check the server.";
    }
  } finally {
    saving = false;
    submitButton.disabled = false;
    reloadButton.disabled = false;
  }
}

// Connect the HTML controls to our functions.
submitButton.onclick = handleSubmit;
reloadButton.onclick = loadProjects;

// Load existing records as soon as this page opens.
loadProjects();
