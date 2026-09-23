"""FlowCast + BarrierLens — FastAPI Application Entry Point."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import get_settings
from app.api.routes import api_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create upload dir
    from pathlib import Path
    Path(settings.UPLOAD_DIR).mkdir(exist_ok=True)
    yield
    # Shutdown


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
app.include_router(api_router)


@app.get("/health")
async def health():
    return {"status": "ok", "version": settings.APP_VERSION}
