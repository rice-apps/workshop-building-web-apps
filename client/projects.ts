import { listProjects, addProject } from "./projects-api";


const form = document.querySelector<HTMLFormElement>("#project-form")!;
const button = form.querySelector<HTMLButtonElement>("button")!;
const list = document.querySelector<HTMLUListElement>("#list")!;
const status = document.querySelector<HTMLParagraphElement>("#status")!;
let saving = false;

async function loadProjects() {
  const rows = await listProjects();
  list.replaceChildren();
  for (const row of rows) {
    const item = document.createElement("li");
    item.textContent = row.name;
    list.append(item);
  }
  if (rows.length === 0) {
    const item = document.createElement("li");
    item.textContent = "No projects yet.";
    list.append(item);
  }
}

async function reload() {
  try {
    await loadProjects();
    status.textContent = "List loaded.";
  } catch {
    status.textContent = "Could not load projects. Check the server, then reload.";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (saving) return;
  saving = true;
  button.disabled = true;
  status.textContent = "Saving…";
  try {
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    if (!name || [...name].length > 80) throw new Error("Enter a name between 1 and 80 characters.");
    await addProject(name);
    form.reset();
    // The insert succeeded even if this subsequent list request fails.
    try {
      await loadProjects();
      status.textContent = "Project saved.";
    } catch {
      status.textContent = "Saved, but list reload failed. Reload the list; do not resubmit.";
    }
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : "Could not save. Check the server.";
  } finally {
    saving = false;
    button.disabled = false;
  }
});

document.querySelector("#reload")!.addEventListener("click", () => void reload());
void reload();
