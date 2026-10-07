-- Fictional examples only. Optional; stable IDs make this safe to repeat.
insert into public.projects (id, name) values
('00000000-0000-4000-8000-000000000001', 'Demo Campus Garden'),
('00000000-0000-4000-8000-000000000002', 'Demo Study Buddy') on conflict (id) do nothing;
insert into public.members (id, name, role) values
('00000000-0000-4000-8000-000000000003', 'Demo Member A', 'developer'),
('00000000-0000-4000-8000-000000000004', 'Demo Member B', 'designer') on conflict (id) do nothing;
