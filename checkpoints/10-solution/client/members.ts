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
  "Integrated · submit → insert → reload. Both clients must use this same backend.";
onSubmit(form, async () => {
  await createMember(readName(form), readRole(), readYear());
  form.reset();
  try {
    await loadMembers();
    message("Member saved.");
  } catch {
    message(
      "Member saved, but list reload failed. Use Reload list; do not resubmit.",
      true,
    );
  }
});
document
  .querySelector("#reload")!
  .addEventListener("click", () => void reload(loadMembers));
void storageLabel();
void reload(loadMembers);
