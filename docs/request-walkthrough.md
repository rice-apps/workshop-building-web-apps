# Request worksheet / offline reference

With FastAPI running, these use only localhost; curl does not need the Swagger CDN.

```sh
curl -i 'http://127.0.0.1:8000/api/projects?limit=1'
curl -i -X POST 'http://127.0.0.1:8000/api/projects' -H 'Content-Type: application/json' -d '{"name":"Demo Project A"}'
curl -i -X POST 'http://127.0.0.1:8000/api/members' -H 'Content-Type: application/json' -d '{"name":"Demo Member A","role":"designer","class_year":2028}'
curl -i 'http://127.0.0.1:8000/api/members?role=designer'
```

PowerShell: use `curl.exe` and, if JSON quoting differs on your version, send the body from a saved file via `--data-binary @request.json`.

Annotate: method ___, scheme/host/port ___, path ___, query ___, body ___, Content-Type ___, response status ___, JSON response ___, who owns the data now? ___.

Predict before running: blank name → 422. Projects POST → 201 and row. Member POST before step 9 → 200 `{ "received": true }` only. Step 8 GET returns a constant; it is not proof the POST saved anything. Solution POST → 201 row with id/timestamp; subsequent GET includes that row. Supabase mode storage failure → 503, not a fake success.

Without a working laptop, draw the request arrows and compare these example responses (illustrative, not a live capture):

```json
{"received":true}
```

```json
{"id":"generated-id","name":"Demo Member A","role":"designer","class_year":2028,"created_at":"generated-time"}
```

Which response establishes only receipt? Which claims creation? What extra checks distinguish a shared server from a persistent database? Answer: another client fetching the same server, then a backend restart and re-fetch.
