# Instructor runbook

The objective is explaining the path and responsibilities, not framework fluency. Omar: 1–6. Mac: 7–10. The other host assists blocked pairs. Rehearse the ten-step guide within 60 minutes. If setup is still blocked at 6:05, pair; don't turn the session into package installation.

## Before doors open

- Run setup and `python scripts/verify.py`; verify Projects list/add through the actual browser.
- Keep main as the starter. All six snapshots are on main, so a normal fork contains every answer. No branch dance during class.
- A snapshot changes five teaching files, backing them up first. Show the backup directory once; normal progress is tiny manual edits.
- Decide whether the finale uses local SQLite or a host's existing Supabase demo configuration. Label the mode out loud and in the UI. Local is a complete zero-credential fallback, but does not prove a Supabase connection.
- Use only fictional names. Local database starts empty; optional `scripts/seed_local.py` supplies demo rows.
- Have two browsers ready on the same machine/backend. A private window is fine for the shared-list demonstration. Remote LAN exposure is not needed.
- `/docs` UI fetches Swagger assets from a CDN. If offline, use the curl worksheet instead. npm/pip installation needs connectivity beforehand; installed app runtime in local mode does not need it.

## Swappable data access

Routes depend on `data/projects.py` and `data/members.py`, which expose small list/insert functions. All SQLite SQL, Supabase HTTP headers, URLs, and response checking live in `database.py`. The same `STORAGE_MODE` setting chooses the backend once; routes and browser contracts do not change. To add another backend later, implement the adapter's list/insert behavior and run the contract tests. Keep that maintenance separate from the learner's one-line member insert exercise.

## Existing Supabase configuration (host only)

This repository does not provision a project, credentials, grants, policies, or security settings. Use an existing, authorized dedicated demo project whose access settings have already been reviewed. Do not use production data. Inspect `database/schema.sql` and `database/seed.sql` and apply them via the existing project's SQL Editor only when authorized. Table names must be unused: the schema intentionally fails rather than overwrite existing tables.

Copy `server/.env.example` to `server/.env`. On the host only, set:

```dotenv
STORAGE_MODE=supabase
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_KEY=REPLACE_ON_HOST_ONLY
```

Use an existing server secret key or legacy service_role key. Keep it out of the browser, VITE variables, terminal screenshots, Git, and learner forks. The Python adapter uses Supabase's REST Data API via HTTPX, avoiding a large SDK for two operations. Modern secret keys are sent in `apikey`; legacy JWT service-role keys also use Authorization. Client → FastAPI URLs remain unchanged.

Restart FastAPI. Health shows configured mode only, **not connectivity verification**. Use Projects POST/GET and then solution Members POST/GET to verify the actual connection. In Supabase inspect the row, restart the backend, and verify it again. If it fails, check the prepared project's table exposure/access with its owner; do not add grants or weaken policies during this workshop. Switch to local mode and say explicitly what was and wasn't demonstrated.

Attendees can implement Python against their local fallback. For the Supabase finale, pair on the host-controlled machine; do not copy the privileged key to attendees. A live shared remote backend would need a separately reviewed access plan and is not configured here.

## Teaching tradeoffs to flag

- `server/database.py` is supplied plumbing with one small storage API. It supports two backends; reading it line by line would derail the lesson. Learners read the one-line `store.insert` call and trace its responsibility instead.
- Class year/role are prebuilt fields; learners do not build form/model boilerplate or filtering UI. Role query filtering is a ready HTTP example.
- SQL/NoSQL comparison is one minute. The schema and insert boundary are the useful concepts today.
- Checkpoints are copy-in rescue points; do not require Git branch switching, rebasing, or stashing in class. Backups preserve edits but are not a merge tool.
- The UI blocks simultaneous submissions, not duplicate names or uncertain network retries. Reload before retrying an ambiguous result; idempotency is beyond the hour.

## Reference contracts

| Stage | GET members | POST members |
| --- | --- | --- |
| Starter/local/fetch | 405 (GET not implemented) | 200 diagnostic, no insertion |
| Hardcoded | 200 fixed list, role query works | 200 diagnostic, no insertion |
| Database/solution | 200 stored rows, role query works | 201 only after insert |

Projects always supports GET `?limit=1..100` and POST 201. Names trim whitespace and enforce 1–80 characters. Members accept class_year 2000–2100 (default 2028) and developer/designer (default developer). Invalid JSON/input yields 422; storage failures yield sanitized 503. Lists return at most 100 rows; pagination is outside workshop scope. There is no authentication or internet deployment configuration.

Upstream references: [FastAPI request bodies](https://fastapi.tiangolo.com/tutorial/body/), [Supabase REST API](https://supabase.com/docs/guides/api), [Supabase API keys](https://supabase.com/docs/guides/api/api-keys), [MDN fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).
