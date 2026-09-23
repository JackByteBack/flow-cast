"""City dashboard endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.core.response import success_response
from app.models.user import User
from app.models.traffic import TrafficPrediction
from app.models.accessibility import AccessibilityLocation, AccessibilityDetection

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/congestion-summary")
async def congestion_summary(db: AsyncSession = Depends(get_db)):
    total = await db.execute(select(func.count()).select_from(TrafficPrediction))
    severe = await db.execute(
        select(func.count()).select_from(TrafficPrediction).where(TrafficPrediction.predicted_speed < 10)
    )
    return success_response(data={
        "total_predictions": total.scalar() or 0,
        "severe_congestion_count": severe.scalar() or 0,
        "congestion_level": "moderate",
    })


@router.get("/accessibility-gaps")
async def accessibility_gaps(db: AsyncSession = Depends(get_db)):
    total_locations = await db.execute(select(func.count()).select_from(AccessibilityLocation))
    low_score = await db.execute(
        select(func.count()).select_from(AccessibilityLocation).where(AccessibilityLocation.overall_score < 5.0)
    )
    return success_response(data={
        "total_locations": total_locations.scalar() or 0,
        "low_accessibility_count": low_score.scalar() or 0,
        "coverage_gaps": [],
    })


@router.get("/stats")
async def platform_stats(db: AsyncSession = Depends(get_db)):
    users = await db.execute(select(func.count()).select_from(User))
    locations = await db.execute(select(func.count()).select_from(AccessibilityLocation))
    detections = await db.execute(select(func.count()).select_from(AccessibilityDetection))
    return success_response(data={
        "active_users": users.scalar() or 0,
        "locations_scanned": locations.scalar() or 0,
        "total_detections": detections.scalar() or 0,
        "predictions_made": 0,
    })
