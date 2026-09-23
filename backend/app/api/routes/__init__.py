"""Central API router aggregation."""

from fastapi import APIRouter
from app.api.auth.router import router as auth_router
from app.api.routes.traffic import router as traffic_router
from app.api.routes.barrierlens import router as barrierlens_router
from app.api.routes.route import router as route_router
from app.api.routes.dashboard import router as dashboard_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router)
api_router.include_router(traffic_router)
api_router.include_router(barrierlens_router)
api_router.include_router(route_router)
api_router.include_router(dashboard_router)
