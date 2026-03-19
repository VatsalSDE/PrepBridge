from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from admin_routes import router as admin_router
from user_routes import router as user_router

app = FastAPI(title="PrepBridge ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Health Check ──────────────────────────────
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "PrepBridge ML Service"}

# ── Routers ───────────────────────────────────
app.include_router(admin_router)
app.include_router(user_router)