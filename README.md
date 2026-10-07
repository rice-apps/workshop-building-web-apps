# RiceApps web app

A small Members/Projects workshop app. Fork this repository and clone your fork. Projects and member listing work; Add Member is the exercise.

## Implement Add Member

The form, input validation, list rendering, HTTP route, and SQLite schema are supplied. Complete the four small TODOs, using Projects as the reference:

| Layer | File | Your task |
| --- | --- | --- |
| Page | `client/event-handlers/members.ts` | Submit the member, then refresh the list |
| HTTP client | `client/api/members-api.ts` | POST JSON and read the response |
| Service | `server/app/services.py` | Delegate to the database function |
| Storage | `server/app/database.py` | Insert a member and return the row |

Trace the flow from top to bottom; implement from the database upward if you want to test one boundary at a time. Replace each placeholder error. The unfinished form keeps its values and says nothing was saved. Calling the unfinished endpoint directly returns **501**, never a false 201. Invalid input still returns 422. Member GET/role filtering and Projects list/add are complete.

After implementation, add a fictional member, reload in another browser using the same backend, and restart Python to verify persistence. The annotated full solution is available in Git history at [`f826468`](https://github.com/rice-apps/workshop-building-web-apps/tree/f826468); no checkpoint scripts or branch switching required.

## Run locally

Tested with Python 3.13.12 and Node 25.3.0 (npm 11.7.0).

```sh
python3.13 -m venv server/.venv
source server/.venv/bin/activate
python -m pip install -r server/requirements.txt
npm ci
```

Start the backend from the repository root in one terminal:

```sh
source server/.venv/bin/activate
python -m uvicorn app.main:app --app-dir server --reload --host 127.0.0.1 --port 8000
```

In another terminal:

```sh
npm run dev
```

Open **http://127.0.0.1:5173/ui/members.html** or **http://127.0.0.1:5173/ui/projects.html**. API docs: http://127.0.0.1:8000/docs.

On Windows, create the environment with `py -3.13 -m venv server/.venv` and use `server\.venv\Scripts\python.exe` instead of activating it. Run the same pip/uvicorn commands with that interpreter. Windows setup has not been verified locally.

## Folder layout

```text
client/
  ui/                HTML pages and CSS
  event-handlers/            Event handling and rendering
  api/               Backend fetch calls
  types.ts           Shared types
server/
  app/               main.py, services.py, database.py
  requirements.txt
tests/
  client/            TypeScript page tests
  server/            Python API tests
  smoke.py           Full-app HTTP and persistence check
```

Run npm commands from the repository root. All tests live together; the client and server subfolders use different languages/runners. Frontend tool configuration stays in `client/`.

## Follow a request

```text
ui/members.html → event-handlers/members.ts → api/members-api.ts → HTTP
  → server/app/main.py → services.py → database.py → SQLite
  ← JSON response ← saved row
```

Projects follows the same path. HTML defines the form; TypeScript handles events and rendering; `*-api.ts` sends requests. `main.py` validates HTTP input, `services.py` defines application operations, and `database.py` owns SQL. Services simply delegate for now: there are no extra business rules.

GET lists records; the completed Projects POST creates one and returns 201. Member POST returns 501 until implemented. Try `/api/members?role=designer` for a query-parameter example. Invalid input returns 422; database failure returns 503. Browser checks help usability; server validation remains authoritative.

SQLite is the only database. It creates `server/workshop.sqlite3` and one fictional sample project on first startup. No account, key, or environment file is needed. The database file is ignored by Git. Two browser windows using this same backend share data; reload to see changes. Stop/restart the backend to verify persistence. Separate laptops running separate backends have separate databases.

Pending submissions are blocked from double-clicking. Names are not unique; deliberate repeated submissions create separate records. If a network failure leaves an uncertain result, reload before retrying.

This unauthenticated app is for local teaching with fictional data. Keep it on loopback; public deployment needs authentication, authorization, and operational safeguards first.

## Checks

From root with the Python environment active and dev servers stopped:

```sh
python -m pytest -q tests
npm test
npm run build
python tests/smoke.py
```

Tests cover the unfinished member contract (501 and no insert), member listing/filtering, validation, working Projects add/list, errors, and real HTTP through Vite with a backend restart. When you finish Add Member, replace the stub assertions with 201/saved-row checks. Smoke tests use a temporary SQLite file, not your data. The earlier workshop/checkpoints remain available in Git history at `9971311`.
