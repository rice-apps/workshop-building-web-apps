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
const list = document.getElementById("list") as HTMLUListElement;

// "async" lets us await the server response without blocking the page.
async function loadMembers() {
  const members = await listMembers();

  // Replace the old list with the records returned by the server.
  list.replaceChildren();
  for (const member of members) {
    const item = document.createElement("li");
    // textContent displays names as text, never as HTML.
    item.textContent = member.name + " · " + member.class_year + " · " + member.role;
    list.append(item);
  }
}

async function handleSubmit() {
  console.log("Saving…");

  // Construct our NewMember object to send to the server.
  // These property names match the JSON fields expected by the Python API.
  const newMember: NewMember = {
    name: nameInput.value,
    class_year: Number(yearInput.value),
    role: roleInput.value as Role,
  };

  // Show the member immediately, before waiting for the server.
  const item = document.createElement("li");
  item.textContent = newMember.name + " · " + newMember.class_year + " · " + newMember.role;
  list.append(item);

  // Save it on the server. The response has no data to read.
  await addMember(newMember);

  // Clear the input fields afterwards.
  nameInput.value = "";

  console.log("Member saved.");
}

// Connect the HTML controls to our functions.
submitButton.onclick = handleSubmit;
reloadButton.onclick = loadMembers;

// Load existing records as soon as this page opens.
loadMembers();
