"""Route models."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry
from app.core.database import Base


class RouteRequest(Base):
    __tablename__ = "route_requests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    origin = mapped_column(Geometry("POINT", srid=4326), nullable=False)
    destination = mapped_column(Geometry("POINT", srid=4326), nullable=False)
    priority: Mapped[str] = mapped_column(String(20))  # fast, green, reliable, accessible
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    results: Mapped[list["RouteResult"]] = relationship(back_populates="request")


class RouteResult(Base):
    __tablename__ = "route_results"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    request_id: Mapped[str] = mapped_column(String(36), ForeignKey("route_requests.id"), index=True)
    route_geom = mapped_column(Geometry("LINESTRING", srid=4326))
    travel_time: Mapped[float] = mapped_column(Float)  # minutes
    delay: Mapped[float] = mapped_column(Float, default=0.0)  # predicted delay in minutes
    emissions: Mapped[float] = mapped_column(Float, default=0.0)  # kg CO2
    accessibility_score: Mapped[float] = mapped_column(Float, default=0.0)  # 0-10
    rank: Mapped[str] = mapped_column(String(20))  # fast, green, reliable, accessible
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    request: Mapped["RouteRequest"] = relationship(back_populates="results")
