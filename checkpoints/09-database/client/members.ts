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
  "Database stage · use Reload list after submitting. Step 10 adds automatic reload.";
onSubmit(form, async () => {
  await createMember(readName(form), readRole(), readYear());
  form.reset();
  message("Member saved. Use Reload list to fetch the updated roster.");
});
// STEP 8: this reload starts working after you add the GET route.
document
  .querySelector("#reload")!
  .addEventListener("click", () => void reload(loadMembers));
render([]);
void storageLabel();
