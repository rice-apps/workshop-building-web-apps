import { listProjects, createProject } from "./api";
import {
  onSubmit,
  render,
  readName,
  message,
  storageLabel,
  reload,
} from "./ui";
const form = document.querySelector<HTMLFormElement>("#project-form")!;
document.querySelector("#stage")!.textContent =
  "Completed reference: POST, then GET the saved list.";
async function loadProjects() {
  render(await listProjects());
}
onSubmit(form, async () => {
  await createProject(readName(form));
  form.reset(); // Insert succeeded. Do not invite a duplicate if the next GET fails.
  try {
    await loadProjects();
    message("Project saved.");
  } catch {
    message(
      "Project saved, but list reload failed. Use Reload list; do not resubmit.",
      true,
    );
  }
});
document
  .querySelector("#reload")!
  .addEventListener("click", () => void reload(loadProjects));
void storageLabel();
void reload(loadProjects);
