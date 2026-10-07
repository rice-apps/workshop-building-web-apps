import { request, type Row } from "./api";
export const status = document.querySelector<HTMLParagraphElement>("#status")!;
export function message(text: string, error = false) {
  status.textContent = text;
  status.dataset.error = String(error);
}
export function render(rows: Row[]) {
  const list = document.querySelector<HTMLUListElement>("#list")!;
  list.replaceChildren();
  if (!rows.length) {
    const li = document.createElement("li");
    li.textContent = "No entries yet. Add a fictional name to start.";
    list.append(li);
  }
  for (const row of rows) {
    const li = document.createElement("li");
    li.textContent =
      row.name +
      (row.role ? ` · ${row.role}` : "") +
      (row.class_year ? ` · Class of ${row.class_year}` : "");
    list.append(li);
  }
}
export function readName(form: HTMLFormElement) {
  const name = String(new FormData(form).get("name") ?? "").trim();
  if (!name || [...name].length > 80)
    throw new Error("Enter a name between 1 and 80 characters.");
  return name;
}
// One listener, one in-flight submission. Retain entered values if saving fails.
export function onSubmit(form: HTMLFormElement, action: () => Promise<void>) {
  let pending = false;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (pending) return;
    pending = true;
    const buttons = form.querySelectorAll<HTMLButtonElement>("button");
    buttons.forEach((button) => (button.disabled = true));
    message("Working…");
    try {
      await action();
    } catch (error) {
      message(
        error instanceof Error ? error.message : "Something went wrong.",
        true,
      );
    } finally {
      pending = false;
      buttons.forEach((button) => (button.disabled = false));
    }
  });
}
export async function storageLabel() {
  const label = document.querySelector("#storage")!;
  try {
    const health = await request<{ note: string }>("/api/health");
    label.textContent = health.note;
  } catch {
    label.textContent =
      "Backend offline. Local member exercise still works; Projects needs FastAPI.";
  }
}
export async function reload(load: () => Promise<void>) {
  try {
    await load();
    message("List reloaded.");
  } catch (error) {
    message(
      error instanceof Error ? error.message : "Could not load list.",
      true,
    );
  }
}
