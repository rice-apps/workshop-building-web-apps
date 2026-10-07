// These functions send HTTP requests; this file handles the page itself.
import { listMembers, addMember } from "../api/members-api";
// NewMember describes the fields we send when creating a member.
import type { NewMember, Role } from "../types";

// Find the HTML elements we need. "as" tells TypeScript what kind each is.
const nameInput = document.getElementById("name") as HTMLInputElement;
const yearInput = document.getElementById("class-year") as HTMLInputElement;
const roleInput = document.getElementById("role") as HTMLSelectElement;
const submitButton = document.getElementById("add-member") as HTMLButtonElement;
const reloadButton = document.getElementById("reload") as HTMLButtonElement;
const status = document.getElementById("status") as HTMLParagraphElement;
let saving = false;

const list = document.getElementById("list") as HTMLUListElement;

// "async" lets us await the server response without blocking the page.
async function loadMembers() {
  if (saving) {
    return;
  }
  submitButton.disabled = true;
  reloadButton.disabled = true;
  try {
    const members = await listMembers();

    // Replace the old list with the records returned by the server.
    list.replaceChildren();
    for (const member of members) {
      const item = document.createElement("li");
      // textContent displays names as text, never as HTML.
      item.textContent = member.name + " · " + member.class_year + " · " + member.role;
      list.append(item);
    }
  } catch {
    status.textContent = "Could not load members. Check the server and reload.";
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
  const newMember: NewMember = {
    name: name,
    class_year: Number(yearInput.value),
    role: roleInput.value as Role,
  };

  saving = true;
  submitButton.disabled = true;
  reloadButton.disabled = true;

  // Optimistic rendering: show the entry before waiting for the server.
  const item = document.createElement("li");
  item.textContent = newMember.name + " · " + newMember.class_year + " · " + newMember.role;
  list.append(item);
  status.textContent = "Saving…";

  try {
    // TODO 1: await addMember(newMember), then clear the input fields.
    // Use projects.ts as the reference. Do not fetch the list again here.
    status.textContent = "Member added locally. Complete TODO 1 to send it.";
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
reloadButton.onclick = loadMembers;

// Load existing records as soon as this page opens.
loadMembers();
