"""Accessibility (BarrierLens) models."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Float, Boolean, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry
from app.core.database import Base


class AccessibilityLocation(Base):
    __tablename__ = "accessibility_locations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    geom = mapped_column(Geometry("POINT", srid=4326), nullable=False)
    address: Mapped[str] = mapped_column(String(500))
    overall_score: Mapped[float] = mapped_column(Float, default=0.0)
    last_updated: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    photos: Mapped[list["AccessibilityPhoto"]] = relationship(back_populates="location")


class AccessibilityPhoto(Base):
    __tablename__ = "accessibility_photos"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    location_id: Mapped[str] = mapped_column(String(36), ForeignKey("accessibility_locations.id"), index=True)
    contributor_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    image_url: Mapped[str] = mapped_column(String(500))
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    location: Mapped["AccessibilityLocation"] = relationship(back_populates="photos")
    detections: Mapped[list["AccessibilityDetection"]] = relationship(back_populates="photo")


class AccessibilityDetection(Base):
    __tablename__ = "accessibility_detections"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    photo_id: Mapped[str] = mapped_column(String(36), ForeignKey("accessibility_photos.id"), index=True)
    feature_type: Mapped[str] = mapped_column(String(50))  # ramp, stairs, elevator, handrail, obstacle, narrow_pathway
    confidence: Mapped[float] = mapped_column(Float)
    bbox: Mapped[str] = mapped_column(Text)  # JSON string: [x1, y1, x2, y2]
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    photo: Mapped["AccessibilityPhoto"] = relationship(back_populates="detections")
