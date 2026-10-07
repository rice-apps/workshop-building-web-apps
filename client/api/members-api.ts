// These types describe the member data exchanged with the Python server.
import type { Member, NewMember, Role } from "../types";

// "export" lets the page handler call this function.
// "async" lets us use "await" to wait for a request to finish.
// Promise<Member[]> means the result will eventually be a list of members.
// The ? in role?: Role means the caller can leave the role filter out.
export async function listMembers(role?: Role): Promise<Member[]> {
  let url = "/api/members";

  // A query parameter asks the server to filter the list by role.
  if (role !== undefined) {
    const encodedRole = encodeURIComponent(role);
    url = url + "?role=" + encodedRole;
  }

  // fetch uses GET by default. GET asks the server to read data.
  const response = await fetch(url);

  // fetch does not throw just because the server returns an HTTP error.
  if (!response.ok) {
    throw new Error("Could not load members (" + response.status + ").");
  }

  // Convert the JSON response into JavaScript data for the page handler.
  const members: Member[] = await response.json();
  return members;
}

// NewMember contains the fields to save. The result is one saved Member.
export async function addMember(member: NewMember) {
  console.log(member);

  // TODO 2: POST member as JSON to /api/members.
  // Use addProject in projects-api.ts as the reference.
}
