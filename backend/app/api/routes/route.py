"""Route calculation endpoints."""

import random
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_guest_user
from app.core.response import success_response
from app.models.route import RouteRequest, RouteResult
from app.schemas.route import RouteCalculateRequest, RouteCalculateResponse, RouteOption

router = APIRouter(prefix="/routes", tags=["Routes"])


def generate_route_options(origin_lat: float, origin_lng: float, dest_lat: float, dest_lng: float) -> list[RouteOption]:
    """Generate 4 ranked route options. Replace with OSRM + scoring."""
    base_time = random.uniform(15, 45)
    dist = ((dest_lat - origin_lat) ** 2 + (dest_lng - origin_lng) ** 2) ** 0.5 * 111

    routes = [
        RouteOption(
            rank="fast",
            travel_time=round(base_time, 1),
            delay=round(random.uniform(0, 5), 1),
            emissions=round(dist * 0.12, 2),
            accessibility_score=round(random.uniform(4, 8), 1),
            distance_km=round(dist, 2),
            geometry='{"type":"LineString","coordinates":[[%.4f,%.4f],[%.4f,%.4f]]}' % (origin_lng, origin_lat, dest_lng, dest_lat),
        ),
        RouteOption(
            rank="green",
            travel_time=round(base_time * random.uniform(1.1, 1.4), 1),
            delay=round(random.uniform(0, 3), 1),
            emissions=round(dist * 0.06, 2),
            accessibility_score=round(random.uniform(5, 9), 1),
            distance_km=round(dist * 1.1, 2),
            geometry='{"type":"LineString","coordinates":[[%.4f,%.4f],[%.4f,%.4f]]}' % (origin_lng, origin_lat, dest_lng, dest_lat),
        ),
        RouteOption(
            rank="reliable",
            travel_time=round(base_time * random.uniform(1.05, 1.2), 1),
            delay=round(random.uniform(0, 1), 1),
            emissions=round(dist * 0.10, 2),
            accessibility_score=round(random.uniform(5, 8), 1),
            distance_km=round(dist * 1.05, 2),
            geometry='{"type":"LineString","coordinates":[[%.4f,%.4f],[%.4f,%.4f]]}' % (origin_lng, origin_lat, dest_lng, dest_lat),
        ),
        RouteOption(
            rank="accessible",
            travel_time=round(base_time * random.uniform(1.2, 1.6), 1),
            delay=round(random.uniform(0, 2), 1),
            emissions=round(dist * 0.11, 2),
            accessibility_score=round(random.uniform(8, 10), 1),
            distance_km=round(dist * 1.2, 2),
            geometry='{"type":"LineString","coordinates":[[%.4f,%.4f],[%.4f,%.4f]]}' % (origin_lng, origin_lat, dest_lng, dest_lat),
        ),
    ]
    return routes


@router.post("/calculate")
async def calculate_routes(
    body: RouteCalculateRequest,
    db: AsyncSession = Depends(get_db),
):
    guest = await get_guest_user(db)
    request = RouteRequest(
        user_id=guest.id,
        origin=f"SRID=4326;POINT({body.origin_lng} {body.origin_lat})",
        destination=f"SRID=4326;POINT({body.dest_lng} {body.dest_lat})",
        priority=body.priority,
    )
    db.add(request)
    await db.flush()

    routes = generate_route_options(body.origin_lat, body.origin_lng, body.dest_lat, body.dest_lng)
    for r in routes:
        db.add(RouteResult(
            request_id=request.id,
            route_geom=r.geometry,
            travel_time=r.travel_time,
            delay=r.delay,
            emissions=r.emissions,
            accessibility_score=r.accessibility_score,
            rank=r.rank,
        ))

    return success_response(data=RouteCalculateResponse(
        request_id=request.id,
        routes=routes,
    ).model_dump())


@router.get("/history")
async def get_history(
    db: AsyncSession = Depends(get_db),
):
    guest = await get_guest_user(db)
    result = await db.execute(
        select(RouteRequest).where(RouteRequest.user_id == guest.id).order_by(RouteRequest.created_at.desc()).limit(20)
    )
    requests = result.scalars().all()
    return success_response(data=[{
        "id": r.id,
        "priority": r.priority,
        "created_at": r.created_at.isoformat(),
    } for r in requests])
