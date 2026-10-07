// These functions send HTTP requests; this file handles the page itself.
import { listProjects, addProject } from "../api/projects-api";

// Find the HTML elements we need. "as" tells TypeScript what kind each is.
const form = document.getElementById("project-form") as HTMLFormElement;
const nameInput = document.getElementById("name") as HTMLInputElement;
const submitButton = form.querySelector("button") as HTMLButtonElement;
const reloadButton = document.getElementById("reload") as HTMLButtonElement;
const list = document.getElementById("list") as HTMLUListElement;
const status = document.getElementById("status") as HTMLParagraphElement;

// Remember whether a save is running so repeated clicks don't send it twice.
let saving = false;

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

  if (projects.length === 0) {
    const item = document.createElement("li");
    item.textContent = "No projects yet.";
    list.append(item);
  }
}

// Used both when the page opens and when someone clicks Reload list.
async function reload() {
  try {
    await loadProjects();
    status.textContent = "List loaded.";
  } catch {
    status.textContent = "Could not load projects. Check the server, then reload.";
  }
}

// SubmitEvent is TypeScript's name for the event sent by an HTML form.
async function handleSubmit(event: SubmitEvent) {
  // Handle the form here instead of letting the browser navigate away.
  event.preventDefault();
  if (saving) {
    return;
  }

  saving = true;
  submitButton.disabled = true;
  status.textContent = "Saving…";

  try {
    // Read the name and remove spaces at the beginning and end.
    const name = nameInput.value.trim();
    // Count the characters before checking the name's length.
    const characters = Array.from(name);
    if (characters.length === 0 || characters.length > 80) {
      throw new Error("Enter a name between 1 and 80 characters.");
    }

    // Wait for the server to save before clearing the form.
    await addProject(name);
    form.reset();

    // Fetch the saved list rather than assuming what the database contains.
    try {
      await loadProjects();
      status.textContent = "Project saved.";
    } catch {
      // Saving already succeeded. Retrying the submit could create a duplicate.
      status.textContent = "Saved, but list reload failed. Reload the list; do not resubmit.";
    }
  } catch (error) {
    // Keep the form's values so the user can fix a failed submission.
    if (error instanceof Error) {
      status.textContent = error.message;
    } else {
      status.textContent = "Could not save. Check the server.";
    }
  } finally {
    // This runs after success or failure, enabling the next submission.
    saving = false;
    submitButton.disabled = false;
  }
}

// Connect the HTML controls to our functions. Submit handles clicks and Enter.
form.addEventListener("submit", handleSubmit);
reloadButton.addEventListener("click", reload);

// Load existing records as soon as this page opens.
reload();
