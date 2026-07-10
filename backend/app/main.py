import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.app.config import settings
from backend.app.database import engine, Base

# Import routers
from backend.app.routers.auth import router as auth_router
from backend.app.routers.profile import router as profile_router
from backend.app.routers.assessment import router as assessment_router
from backend.app.routers.screening import router as screening_router
from backend.app.routers.progress import router as progress_router
from backend.app.routers.chat import router as chat_router
from backend.app.routers.report import router as report_router

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware configuration
origins = [
    "http://localhost:5173", "http://127.0.0.1:5173",
    "http://localhost:5174", "http://127.0.0.1:5174",
    "http://localhost:5175", "http://127.0.0.1:5175",
]

# Allow dynamic frontend URL from environment
if settings.FRONTEND_URL and settings.FRONTEND_URL != "*":
    origins.append(settings.FRONTEND_URL)

# In production with FRONTEND_URL="*", allow_credentials must be False
# when allow_origins is ["*"] (CORS spec requirement)
is_wildcard = settings.FRONTEND_URL == "*"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if is_wildcard else origins,
    allow_credentials=not is_wildcard,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files and Grad-CAM results statically
# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include routers under versioned prefix
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(profile_router, prefix=settings.API_V1_STR)
app.include_router(assessment_router, prefix=settings.API_V1_STR)
app.include_router(screening_router, prefix=settings.API_V1_STR)
app.include_router(progress_router, prefix=settings.API_V1_STR)
app.include_router(chat_router, prefix=settings.API_V1_STR)
app.include_router(report_router)


@app.get("/")
def read_root():
    """Health check endpoint — returns JSON when no frontend is bundled."""
    frontend_index = os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'dist', 'index.html')
    if os.path.isfile(frontend_index):
        from fastapi.responses import FileResponse
        return FileResponse(frontend_index)
    return {
        "status": "online",
        "message": f"Welcome to the {settings.PROJECT_NAME} API. Access docs at /docs",
        "version": "1.0.0"
    }


# ---------------------------------------------------------------------------
# Serve bundled React frontend (used in HF Spaces single-container mode)
# ---------------------------------------------------------------------------
_frontend_dist = os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'dist')

if os.path.exists(_frontend_dist):
    # Serve Vite-generated assets (JS, CSS, images, etc.)
    _assets_dir = os.path.join(_frontend_dist, 'assets')
    if os.path.exists(_assets_dir):
        app.mount("/assets", StaticFiles(directory=_assets_dir), name="frontend-assets")

    # SPA catch-all: any non-API path serves index.html for React Router
    from fastapi.responses import FileResponse

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(_frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(_frontend_dist, "index.html"))