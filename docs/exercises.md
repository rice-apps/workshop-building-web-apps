# Ten small steps, one architectural story

For every step: **predict → inspect the Projects reference → make a tiny change → observe → explain the boundary**. You are not expected to memorize HTML tags, decorators, async syntax, or database APIs. Use checkpoints as answers, not a second Git lesson.

## Omar · steps 1–6 · 6:00–6:29

**1 · 6:00–6:04 · Map the system.** Open Projects and add “Demo Project A.” Locate `client/projects.ts` (interaction), `client/api.ts` (HTTP), `server/projects.py` (request handling), `server/data/projects.py` (store call). Say which computer each runs on. Prediction: does the browser need a database key? No: only Python does. The adapter in `server/database.py` is supplied infrastructure; skip its internals.

**2 · 6:04–6:09 · Give the form an action.** In `client/index.html`, replace the STEP 2 comment with the Projects form's button, changing the label to Add member:

```html
<button type="submit" class="primary-button">Add member</button>
```

Click it. A message confirms the supplied submit listener intercepted navigation. Does a visible button imply saved data? No. Reuse CSS; no markup/style tutorial needed.

**3 · 6:09–6:16 · Behavior lives in the browser.** Replace only the body of the supplied `onSubmit` callback in `client/members.ts`:

```ts
const name = readName(form);
localMembers.push({ name, role: readRole(), class_year: readYear() });
render(localMembers);
form.reset();
message("Added locally — not saved to a server.");
```

Add one fictional member by click and another by Enter. Helpers supply input reading, validation, rendering, and duplicate-click protection. TypeScript checks types during development; the browser executes built JavaScript. One listener handles both click and Enter. Answer: where is the array?

**4 · 6:16–6:19 · Predict the loss.** Refresh. Open another browser. The local array disappears on refresh and was never shared. Don't fix this with localStorage: the next goal is agreement between clients. Compare Projects, whose list is loaded from the server.

**5 · 6:19–6:23 · Shared access vs persistence.** Trace the four Projects files from step 1. Draw browser → server → storage. Two browsers using one backend can share records; two separate localhost backends cannot. A shared server-memory array could still disappear on restart. Predict which restart a database helps survive.

**6 · 6:23–6:29 · Read an HTTP exchange.** DevTools → Network: inspect `GET /api/projects?limit=100`, then a POST. Annotate method, URL, query, JSON request body, Content-Type, response status/body. Change `limit=1` in `/docs` and observe a shorter list. GET reads; POST creates; PATCH/DELETE exist but aren't implemented here. 200 means success, 201 means created, 422 means invalid input, 503 means storage unavailable. Use [the request worksheet](request-walkthrough.md).

## Mac · steps 7–10 · 6:29–7:00

**7 · 6:29–6:35 · Cross the network boundary.** In `client/api.ts`, replace `createMember`'s placeholder body with the Projects request adapted to members:

```ts
return request("/api/members", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name, role, class_year }),
});
```

The supplied `request` wrapper calls fetch, checks `response.ok`, then parses JSON. HTTP errors do not automatically reject fetch. In the existing member submit callback, replace the local array update with:

```ts
await createMember(readName(form), readRole(), readYear());
message("Request received; not saved yet.");
```

Inspect JSON/status in Network and the diagnostic receipt in the server terminal (field metadata only). The stub returns 200 `{ "received": true }`. Predict: will it be there after refresh? No insertion happened. Compare with `07-fetch` if stuck; replace the handler, don't add a second listener.

**8 · 6:35–6:43 · The server owns the response.** Copy this supplied route into the marked position in `server/members.py`; focus on the returned data, not decorator syntax:

```python
@router.get("/api/members")
def get_members(role: Literal["developer", "designer"] | None = None):
    rows = [{"id": "demo-1", "name": "Demo Member A", "role": "developer", "class_year": 2028}]
    return [row for row in rows if role is None or row["role"] == role]
```

Visit `/docs`: GET members; try `role=designer` versus `developer`. The working role filter is a query-parameter reference, not a required filtering UI exercise. POST a blank name and observe 422. Why validate again in Python? Clients can bypass the form. Does the hardcoded list reflect a POST? No. Use Reload list with `08-hardcoded`; if editing manually, change the reload listener to `() => void reload(loadMembers)` as in that checkpoint.

**9 · 6:43–6:54 · Replace constants with storage.** A database retains organized records. SQL here means related tables with declared columns/constraints; NoSQL includes document/key-value families and still has structure. Keep this comparison to one minute. Inspect `database/schema.sql`: id, name, role, class_year, created_at; the database owns id/timestamp generation.

In `server/data/members.py`, replace the placeholder with the analogous Projects call:

```python
return store.insert("members", {
    "name": member.name, "role": member.role, "class_year": member.class_year,
})
```

In `server/members.py`, replace the existing GET body with `return list_members(role)`, and replace the diagnostic POST body with `return insert_member(member)`. Use the supplied POST decorator `@router.post("/api/members", status_code=201, response_model=MemberRow)` and GET response model `list[MemberRow]` from `09-database`; do not register duplicate routes.

POST through `/docs`, expect 201, then GET the saved row. Client success text should now say saved (see `09-database`), not diagnostic. **Name the active mode:** local SQLite demonstrates the same boundary but is not Supabase. A host with authorized prepared configuration can demonstrate the real Supabase table; don't distribute their key or create accounts live.

**10 · 6:54–7:00 · Close the loop.** After the member POST, reset the form and reload the roster, following Projects:

```ts
await createMember(readName(form), readRole(), readYear());
form.reset();
try { await loadMembers(); message("Member saved."); }
catch { message("Member saved, but list reload failed. Use Reload list; do not resubmit.", true); }
```

Resetting after a successful insert keeps a failed GET from inviting a duplicate POST. Copy the initial `void reload(loadMembers)` and reload-button wiring from `10-solution`. Add a unique fictional member. Observe POST 201 → GET 200 → rendered row. Refresh, open a second browser at the same backend, restart FastAPI, reload again. Explain each boundary aloud. A re-fetch is required; there is no real-time push.

If behind at 6:41, use `08-hardcoded`; at 6:54, use `10-solution` and preserve the final request/persistence demonstration. Instructor copies/checkpoint tool preserve previous teaching files. Optional later: class-year query filter, comparison of SQL constraints and API validation, a Git commit. None belongs in the core hour.
