# RiceApps · Building basic web apps

**October 7, 2026 · 6–7 PM Central · Omar (1–6), Mac (7–10)**

Build **Add Member** by tracing where data goes. This is an architecture workshop, not an HTML or FastAPI course. We supply the markup, styling, validation, request helpers, and storage wiring. Your small edits connect the boundaries.

```text
Browser (client/)          Python (server/)            Storage
form → TypeScript → HTTP → FastAPI → data helper → Supabase PostgreSQL
     ← render list ← JSON ← response ← saved row ←
                                             ↳ local SQLite fallback
```

Only Python accesses Supabase. Members have a fictional name, class year, and role. The completed **Projects** page lists and adds projects throughout every checkpoint. No login, edit, delete, or real roster data.

## Get your own copy

1. Open [rice-apps/workshop-building-web-apps](https://github.com/rice-apps/workshop-building-web-apps) on GitHub and choose **Fork**. Keeping “Copy the main branch only” checked is fine: **every checkpoint and the instructor solution are ordinary files on main**.
2. In **your fork**, choose Code → HTTPS → copy the URL. Clone that URL:

   ```sh
   git clone YOUR_FORK_HTTPS_URL
   cd workshop-building-web-apps
   ```

   If your local folder has another name, `cd` into that folder instead. No push, pull request, token, or SSH setup is needed for this workshop. Alternatively download Code → Download ZIP and open the extracted folder.
3. Open this directory in your editor. Keep two terminals open.

## Setup before the session

Tested locally on macOS with **Python 3.13.12, Node 25.3.0, npm 11.7.0**. CI uses those same versions. Python 3.13 is the suggested workshop interpreter; Node 22.12+ meets Vite's engine requirement but other versions were not locally verified. Exact frontend dependencies are in `client/package-lock.json`; exact Python runtime/test dependencies are in `server/requirements.txt`. The application uses FastAPI, Uvicorn, HTTPX and python-dotenv; frontend runtime has no framework dependencies. jsdom/tsx are test tools only.

macOS/Linux, from the repository root:

```sh
python3.13 -m venv server/.venv
source server/.venv/bin/activate
python -m pip install -r server/requirements.txt
cd client
npm ci
cd ..
```

Windows PowerShell:

```powershell
py -3.13 -m venv server/.venv
.\server\.venv\Scripts\python.exe -m pip install -r server/requirements.txt
cd client
npm ci
cd ..
```

No `.env` is needed for the default local fallback. Do not create Supabase accounts during the workshop.

**Terminal 1**, macOS/Linux (activate the venv if using a new terminal):

```sh
source server/.venv/bin/activate
cd server
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Windows equivalent, from root:

```powershell
cd server
.\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2**, from root:

```sh
cd client
npm run dev
```

Open **http://127.0.0.1:5173**. API docs: **http://127.0.0.1:8000/docs**. Try the Projects tab: an empty list is expected; adding a fictional project should work. Members starts without a submit button. That's exercise 2, not a setup failure.

Optional fictional seed, from root with the virtual environment active:

```sh
python scripts/seed_local.py
```

## Learn and move between stages

Follow [the ten-step exercise guide](docs/exercises.md). Start with `client/index.html`, `client/members.ts`, and the Projects reference. Framework wiring is supplied; do not spend the hour retyping it.

| Checkpoint | What you can observe |
| --- | --- |
| `00-starter` | Prepared member form; Projects fully works |
| `03-local` | Member array exists only in this page; refresh loses it |
| `07-fetch` | POST reaches server, returns diagnostic 200; nothing saved |
| `08-hardcoded` | Reload gets a fixed list; POST still does not save |
| `09-database` | POST inserts, returns 201; use Reload list |
| `10-solution` | POST → insert → GET → render automatically |

Prefer small manual edits while learning. To catch up, run from root (venv active):

```sh
python scripts/checkpoint.py 03-local
# Instructor completed app:
python scripts/checkpoint.py 10-solution
```

The script backs up the five current teaching files under `.checkpoint-backups/TIMESTAMP/` **before** replacing them. All other files and database contents are untouched. To recover a learner edit, compare/copy the desired file from that backup to the same relative path. These backups are local and ignored by Git; keep a copy elsewhere if needed. Restart/reload the backend and refresh the page after switching. Do not use `git reset --hard`. Switching stages does not clear already-saved database records.

A fork of main already includes all checkpoints; no branch fetching is required. The instructor solution is [checkpoints/10-solution](checkpoints/10-solution). There are no separate solution branches to lose in a fork.

## Storage modes and honest persistence checks

**Local fallback (default):** Python uses `server/workshop.sqlite3`. It is a real local SQLite database, survives backend restarts, and is shared by browsers using that backend. It is **not Supabase**, not cloud sharing, and not a simulation of verified Supabase access. Two separate laptops running separate backends have separate files. No credentials needed; the UI labels this mode.

**Supabase (host prepared):** see [host setup](docs/instructor.md). Only the host configures an existing dedicated demo project in ignored `server/.env`. Attendees should not receive the privileged key. No live Supabase connection has been verified in this repository's local checks; adapter tests use mocks.

To verify persistence at the solution: add a uniquely named fictional member, reload the page, open another browser at the **same URL**, reload there, then stop/restart FastAPI and reload again. Browser refresh alone does not prove storage survives a server restart. No live push updates: click Reload list to see another client's changes.

## Troubleshooting

- “Backend offline” / request failure: start FastAPI on 8000, inspect its terminal, try `/api/health`. Local member stage still works without the server; Projects needs it.
- Port occupied: stop your earlier server; Vite intentionally refuses to silently change port. Do not kill unrelated processes.
- 405 on member GET in starter/fetch stage: expected until step 8; the POST exists but GET is not implemented.
- 422: use a nonblank name ≤80 characters, a year 2000–2100, and developer/designer role. Python checks independently of the browser.
- 503: storage operation failed. Check `.env` and schema on the host. No success is reported; keep the form values and retry after fixing the cause.
- “Saved, but list reload failed”: the insert succeeded. Click Reload list; don't resubmit.
- Repeated clicks/Enter while a request is pending are ignored. Deliberately submitting again after completion creates another row; names are not unique. Network loss after an insert can leave an uncertain outcome: reload before retrying. This workshop does not implement idempotency keys.
- On the development Mac, Python 3.14's venv bootstrap failed; Python 3.13 worked. Use 3.13 if you see an `ensurepip` error. Platform-specific setup still deserves a rehearsal on attendee laptops.

## Verify and host safely

With the venv active, from root:

```sh
python scripts/verify.py
```

This tests the API contracts, mocked Supabase adapter, validation/failure cases, all six frontend checkpoint builds and DOM tests, and real HTTP requests through Vite with a backend restart. It restores your five teaching files in a `finally` block; run with dev servers stopped so temporary stages do not appear mid-demo. [Verification details](docs/verification.md).

This unauthenticated teaching app binds to loopback. **Do not deploy it to the internet as-is.** Anyone who can reach its API can read/write the demo dataset. Before any public deployment, design authentication/authorization, access policies, rate limiting, migration/backup practices, and secret management. Do not loosen database grants or disable security to make the workshop work. The provided SQL only defines tables and fictional data; it does not grant access or change security settings.
