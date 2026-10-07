export type Role = "developer" | "designer";
export type NewMember = { name: string; class_year: number; role: Role };
export type Member = NewMember & { id: string; created_at: string };
export type Project = { id: string; name: string; created_at: string };
