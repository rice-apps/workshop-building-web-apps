import type { Member, NewMember, Role } from "./types";

export async function listMembers(role?: Role): Promise<Member[]> {
  const response = await fetch(role ? `/api/members?role=${encodeURIComponent(role)}` : "/api/members");
  if (!response.ok) throw new Error(`Could not load members (${response.status}).`);
  return response.json();
}

export async function addMember(member: NewMember): Promise<Member> {
  const response = await fetch("/api/members", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(member),
  });
  if (!response.ok) {
    throw new Error(response.status === 422
      ? "Check the form values and try again."
      : `Could not save member (${response.status}).`);
  }
  return response.json();
}
