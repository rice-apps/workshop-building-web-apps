export type Role = "developer" | "designer";
export type Row = {
  id?: string;
  name: string;
  role?: Role;
  class_year?: number;
  created_at?: string;
};
export async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new Error(
      "Cannot reach the server. Start FastAPI on port 8000, then retry.",
    );
  }
  if (!response.ok) {
    // Do not echo arbitrary server bodies into the UI.
    throw new Error(
      response.status === 422
        ? "Check your input: name is required (1–80 characters), class year must be 2000–2100, and role must be developer or designer."
        : `Request failed (${response.status}). Check the server and storage setup.`,
    );
  }
  try {
    return (await response.json()) as T;
  } catch {
    throw new Error("Server returned invalid JSON. Check the API route.");
  }
}
export const listProjects = () => request<Row[]>("/api/projects?limit=100");
export const createProject = (name: string) =>
  request<Row>("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
export const listMembers = (role = "") =>
  request<Row[]>(
    `/api/members${role ? `?role=${encodeURIComponent(role)}` : ""}`,
  );
export async function createMember(
  name: string,
  role: Role,
  class_year: number,
): Promise<unknown> {
  // STEP 7: adapt createProject's request, URL, and JSON body.
  void name;
  void role;
  void class_year;
  throw new Error("Step 7: implement the member POST request.");
}
