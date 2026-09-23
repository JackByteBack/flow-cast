"""Route schemas."""

from pydantic import BaseModel
from datetime import datetime


class RouteCalculateRequest(BaseModel):
    origin_lat: float
    origin_lng: float
    dest_lat: float
    dest_lng: float
    priority: str = "fast"  # fast, green, reliable, accessible


class RouteOption(BaseModel):
    rank: str  # fast, green, reliable, accessible
    travel_time: float  # minutes
    delay: float  # predicted delay minutes
    emissions: float  # kg CO2
    accessibility_score: float  # 0-10
    distance_km: float
    geometry: str  # GeoJSON LineString


class RouteCalculateResponse(BaseModel):
    request_id: str
    routes: list[RouteOption]
