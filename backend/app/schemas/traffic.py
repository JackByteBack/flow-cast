"""Traffic schemas."""

from pydantic import BaseModel
from datetime import datetime


class TrafficPredictionResponse(BaseModel):
    segment_id: str
    target_time: datetime
    predicted_speed: float
    confidence: float
    road_name: str | None = None

    class Config:
        from_attributes = True


class CongestionHotspot(BaseModel):
    segment_id: str
    road_name: str
    congestion_level: str  # low, medium, high, severe
    avg_speed: float
    predicted_delay: float
    latitude: float
    longitude: float
