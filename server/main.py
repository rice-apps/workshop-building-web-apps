from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from database import StorageError, store
from projects import router as projects_router
from members import router as members_router

app = FastAPI(title="RiceApps workshop", description="Fictional data only. Local teaching app, no authentication.")
app.include_router(projects_router)
app.include_router(members_router)

@app.exception_handler(StorageError)
def storage_error(request: Request, error: StorageError):
    return JSONResponse(status_code=503, content={"detail": str(error)})

@app.get("/api/health")
def health():
    return {"status": "ok", "storage": store.mode, "note": "Local SQLite fallback — not Supabase" if store.mode == "local" else "Supabase configured (health does not verify access)"}
