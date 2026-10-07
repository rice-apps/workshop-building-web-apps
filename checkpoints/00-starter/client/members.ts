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
  "Starter · steps 2–3: add a button, then update a local array.";
onSubmit(form, async () => {
  // STEP 3: readName(form), push { name, role: readRole(), class_year: readYear() }, render, reset.
  message("Button connected. Next: implement the local member handler.");
});
document
  .querySelector("#reload")!
  .addEventListener("click", () => render(localMembers));
render(localMembers);
void storageLabel();
