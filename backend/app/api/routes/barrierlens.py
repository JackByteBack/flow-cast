"""BarrierLens accessibility detection endpoints."""

import json
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.config import get_settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.response import success_response
from app.models.user import User
from app.models.accessibility import AccessibilityLocation, AccessibilityPhoto, AccessibilityDetection
from app.schemas.accessibility import DetectionResult, LocationResponse, PhotoResponse, UploadResponse

settings = get_settings()
router = APIRouter(prefix="/barrierlens", tags=["BarrierLens"])

DETECTION_CLASSES = ["ramp", "stairs", "elevator", "handrail", "obstacle", "narrow_pathway"]


async def run_detection_stub(image_path: str) -> list[DetectionResult]:
    """Placeholder detection — replace with YOLO inference."""
    import random
    detections = []
    for cls in random.sample(DETECTION_CLASSES, k=random.randint(1, 3)):
        detections.append(DetectionResult(
            feature_type=cls,
            confidence=round(random.uniform(0.6, 0.98), 2),
            bbox=[random.randint(0, 200) for _ in range(4)],
        ))
    return detections


def calculate_overall_score(detections: list[DetectionResult]) -> float:
    positive = {"ramp", "elevator", "handrail"}
    negative = {"stairs", "obstacle", "narrow_pathway"}
    score = 5.0
    for d in detections:
        if d.feature_type in positive:
            score += d.confidence * 1.5
        elif d.feature_type in negative:
            score -= d.confidence * 1.0
    return round(max(0, min(10, score)), 1)


@router.post("/upload", response_model=None)
async def upload_photo(
    file: UploadFile = File(...),
    lat: float = 0.0,
    lng: float = 0.0,
    address: str = "",
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid file type: {file.content_type}")

    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(exist_ok=True)
    ext = file.filename.split(".")[-1] if file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = upload_dir / filename

    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")
    filepath.write_bytes(content)

    location = AccessibilityLocation(
        geom=f"SRID=4326;POINT({lng} {lat})",
        address=address,
    )
    db.add(location)
    await db.flush()

    photo = AccessibilityPhoto(
        location_id=location.id,
        contributor_id=user.id,
        image_url=f"/uploads/{filename}",
    )
    db.add(photo)
    await db.flush()

    detections = await run_detection_stub(str(filepath))
    for det in detections:
        db.add(AccessibilityDetection(
            photo_id=photo.id,
            feature_type=det.feature_type,
            confidence=det.confidence,
            bbox=json.dumps(det.bbox),
        ))

    score = calculate_overall_score(detections)
    location.overall_score = score
    location.last_updated = datetime.now(timezone.utc)

    return success_response(data=UploadResponse(
        photo_id=photo.id,
        location_id=location.id,
        detections=detections,
        overall_score=score,
    ).model_dump())


@router.get("/locations")
async def get_locations(
    lat: float = 0.0,
    lng: float = 0.0,
    radius_km: float = 5.0,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AccessibilityLocation).order_by(AccessibilityLocation.last_updated.desc()).limit(50)
    )
    locations = result.scalars().all()
    data = []
    for loc in locations:
        photo_count = await db.execute(select(func.count()).where(AccessibilityPhoto.location_id == loc.id))
        det_count = await db.execute(
            select(func.count())
            .join(AccessibilityPhoto, AccessibilityDetection.photo_id == AccessibilityPhoto.id)
            .where(AccessibilityPhoto.location_id == loc.id)
        )
        data.append(LocationResponse(
            id=loc.id,
            address=loc.address,
            overall_score=loc.overall_score,
            latitude=0.0,
            longitude=0.0,
            photo_count=photo_count.scalar() or 0,
            detection_count=det_count.scalar() or 0,
            last_updated=loc.last_updated,
        ).model_dump())
    return success_response(data=data)


@router.get("/locations/{location_id}")
async def get_location_detail(location_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AccessibilityLocation).where(AccessibilityLocation.id == location_id))
    loc = result.scalar_one_or_none()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")

    photos_result = await db.execute(
        select(AccessibilityPhoto).where(AccessibilityPhoto.location_id == location_id)
    )
    photos = photos_result.scalars().all()

    photos_data = []
    for photo in photos:
        det_result = await db.execute(
            select(AccessibilityDetection).where(AccessibilityDetection.photo_id == photo.id)
        )
        detections = det_result.scalars().all()
        photos_data.append(PhotoResponse(
            id=photo.id,
            location_id=photo.location_id,
            image_url=photo.image_url,
            uploaded_at=photo.uploaded_at,
            detections=[DetectionResult(
                feature_type=d.feature_type,
                confidence=d.confidence,
                bbox=json.loads(d.bbox),
            ) for d in detections],
        ).model_dump())

    return success_response(data={
        "location": LocationResponse(
            id=loc.id,
            address=loc.address,
            overall_score=loc.overall_score,
            latitude=0.0,
            longitude=0.0,
            photo_count=len(photos),
            detection_count=sum(len(p["detections"]) for p in photos_data),
            last_updated=loc.last_updated,
        ).model_dump(),
        "photos": photos_data,
    })
