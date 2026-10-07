# Verification record

Local verification on October 7, 2026, macOS, Python 3.13.12, Node 25.3.0, npm 11.7.0:

- 24 API tests passed across six checkpoints: reference CRUD subset (list/create), name/year/role validation, diagnostic versus creation status, role/limit queries, safe storage errors, local persistence, and mocked Supabase request/response behavior.
- 18 frontend tests passed (three per checkpoint): empty lists, local updates, pending-submit guard, escaped text rendering, successful insertion/reload, failed POST, failed reload after successful POST, and network/JSON errors.
- All six TypeScript checks and Vite builds passed.
- Live HTTP smoke passed: JavaScript module served correctly, Vite proxy, Projects creation, Members creation, a second client reading the same backend, and data retained after stopping/restarting FastAPI. Uses an isolated temporary SQLite file.
- Live browser inspection confirmed starter and solution rendering; Projects creation worked. Browser automation disconnected during the member-submit interaction; completed member behavior is covered by DOM tests and the real HTTP smoke, not a completed end-to-end browser run.
- npm audit reported zero vulnerabilities after updating Vite/tsx. This is a point-in-time check, not a future guarantee.

Run from root with the Python virtual environment active and development servers stopped:

```sh
python scripts/verify.py
```

The suite temporarily applies each checkpoint and restores the original five teaching files in a finally block. The HTTP smoke uses ports 8000/5173 and stops its own processes. It never uses learner database contents or Supabase credentials.

The FastAPI test-client dependency emits an upstream HTTPX deprecation warning; all assertions pass. Live Supabase integration, Windows setup, and another physical laptop have not been verified. GitHub Actions repeats the complete suite on Linux; see the repository Actions tab for the result tied to your commit.

The starter intentionally has no member submit button and no GET member route. Those are the small exercises, not failed checks. There are no credentials or real roster entries in the repository. Environment files, local databases, virtual environments, node_modules, build outputs, and checkpoint backups are excluded from Git.
