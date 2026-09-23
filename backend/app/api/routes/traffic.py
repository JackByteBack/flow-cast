"""Traffic prediction endpoints."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta, timezone

from app.core.database import get_db
from app.core.response import success_response
from app.models.traffic import TrafficPrediction, TrafficSegment
from app.schemas.traffic import TrafficPredictionResponse, CongestionHotspot

router = APIRouter(prefix="/traffic", tags=["Traffic"])


@router.get("/predictions")
async def get_predictions(
    lat: float = Query(..., description="Center latitude"),
    lng: float = Query(..., description="Center longitude"),
    radius_km: float = Query(5.0, description="Search radius in km"),
    db: AsyncSession = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(TrafficPrediction)
        .where(TrafficPrediction.target_time > now)
        .where(TrafficPrediction.target_time < now + timedelta(hours=1))
        .order_by(TrafficPrediction.target_time)
        .limit(50)
    )
    predictions = result.scalars().all()
    return success_response(data=[TrafficPredictionResponse.model_validate(p).model_dump() for p in predictions])


@router.get("/hotspots")
async def get_hotspots(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(TrafficPrediction, TrafficSegment)
        .join(TrafficSegment, TrafficPrediction.segment_id == TrafficSegment.id)
        .order_by(TrafficPrediction.predicted_speed.asc())
        .limit(20)
    )
    rows = result.all()
    hotspots = []
    for pred, seg in rows:
        level = "low"
        if pred.predicted_speed < 10:
            level = "severe"
        elif pred.predicted_speed < 20:
            level = "high"
        elif pred.predicted_speed < 35:
            level = "medium"
        hotspots.append(CongestionHotspot(
            segment_id=seg.id,
            road_name=seg.road_name,
            congestion_level=level,
            avg_speed=pred.predicted_speed,
            predicted_delay=max(0, (seg.speed_limit - pred.predicted_speed) * 0.5),
            latitude=0.0,
            longitude=0.0,
        ).model_dump())
    return success_response(data=hotspots)
