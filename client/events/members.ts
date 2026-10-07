import { listMembers, addMember } from "../api/members-api";
import type { Role } from "../types";

const form = document.querySelector<HTMLFormElement>("#member-form")!;
const button = form.querySelector<HTMLButtonElement>("button")!;
const list = document.querySelector<HTMLUListElement>("#list")!;
const status = document.querySelector<HTMLParagraphElement>("#status")!;
let saving = false;

async function loadMembers() {
  const rows = await listMembers();
  list.replaceChildren();
  for (const row of rows) {
    const item = document.createElement("li");
    item.textContent = `${row.name} · ${row.class_year} · ${row.role}`;
    list.append(item);
  }
  if (rows.length === 0) {
    const item = document.createElement("li");
    item.textContent = "No members yet.";
    list.append(item);
  }
}

async function reload() {
  try {
    await loadMembers();
    status.textContent = "List loaded.";
  } catch {
    status.textContent = "Could not load members. Check the server, then reload.";
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
    const classYear = Number(data.get("class_year"));
    const role = data.get("role") as Role;
    await addMember({ name, class_year: classYear, role });
    form.reset();
    // The insert succeeded even if this subsequent list request fails.
    try {
      await loadMembers();
      status.textContent = "Member saved.";
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
