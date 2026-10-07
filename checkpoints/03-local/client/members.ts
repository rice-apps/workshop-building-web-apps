import { createMember, listMembers, type Row, type Role } from "./api";
import {
  onSubmit,
  render,
  readName,
  message,
  storageLabel,
  reload,
} from "./ui";
const form = document.querySelector<HTMLFormElement>("#member-form")!;
const localMembers: Row[] = [];
async function loadMembers() {
  render(await listMembers());
}
function readYear(): number {
  const year = Number(new FormData(form).get("class_year"));
  if (!Number.isInteger(year) || year < 2000 || year > 2100)
    throw new Error("Class year must be between 2000 and 2100.");
  return year;
}
function readRole(): Role {
  return new FormData(form).get("role") as Role;
}

document.querySelector("#stage")!.textContent =
  "Local array · refresh loses these members; another browser cannot see them.";
onSubmit(form, async () => {
  const name = readName(form);
  localMembers.push({ name, role: readRole(), class_year: readYear() });
  render(localMembers);
  form.reset();
  message("Added locally — not saved to a server.");
});
document
  .querySelector("#reload")!
  .addEventListener("click", () => render(localMembers));
render(localMembers);
void storageLabel();
