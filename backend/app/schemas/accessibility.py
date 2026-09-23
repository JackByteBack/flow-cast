"""Accessibility (BarrierLens) schemas."""

from pydantic import BaseModel
from datetime import datetime


class DetectionResult(BaseModel):
    feature_type: str
    confidence: float
    bbox: list[float]


class LocationResponse(BaseModel):
    id: str
    address: str
    overall_score: float
    latitude: float
    longitude: float
    photo_count: int
    detection_count: int
    last_updated: datetime

    class Config:
        from_attributes = True


class PhotoResponse(BaseModel):
    id: str
    location_id: str
    image_url: str
    uploaded_at: datetime
    detections: list[DetectionResult] = []

    class Config:
        from_attributes = True


class UploadResponse(BaseModel):
    photo_id: str
    location_id: str
    detections: list[DetectionResult]
    overall_score: float
