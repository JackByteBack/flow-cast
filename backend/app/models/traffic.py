"""Traffic models."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Float, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry
from app.core.database import Base


class TrafficSegment(Base):
    __tablename__ = "traffic_segments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    geom = mapped_column(Geometry("LINESTRING", srid=4326), nullable=False)
    road_name: Mapped[str] = mapped_column(String(255))
    speed_limit: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    observations: Mapped[list["TrafficObservation"]] = relationship(back_populates="segment")
    predictions: Mapped[list["TrafficPrediction"]] = relationship(back_populates="segment")


class TrafficObservation(Base):
    __tablename__ = "traffic_observations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    segment_id: Mapped[str] = mapped_column(String(36), ForeignKey("traffic_segments.id"), index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    speed: Mapped[float] = mapped_column(Float)
    volume: Mapped[int] = mapped_column(Integer)
    source: Mapped[str] = mapped_column(String(50), default="simulated")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    segment: Mapped["TrafficSegment"] = relationship(back_populates="observations")


class TrafficPrediction(Base):
    __tablename__ = "traffic_predictions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    segment_id: Mapped[str] = mapped_column(String(36), ForeignKey("traffic_segments.id"), index=True)
    predicted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    target_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    predicted_speed: Mapped[float] = mapped_column(Float)
    confidence: Mapped[float] = mapped_column(Float)
    model_version: Mapped[str] = mapped_column(String(50), default="v0.1")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    segment: Mapped["TrafficSegment"] = relationship(back_populates="predictions")
