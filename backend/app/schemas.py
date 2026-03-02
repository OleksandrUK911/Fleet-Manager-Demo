# schemas.py — Pydantic schemas for request/response validation and serialization

from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


# ─────────────────────────────────────────────
# Position Schemas
# ─────────────────────────────────────────────

class PositionBase(BaseModel):
    """Shared fields between position request/response models."""
    latitude: float
    longitude: float
    speed: Optional[float] = 0.0
    timestamp: Optional[datetime] = None


class PositionOut(PositionBase):
    """Response schema for a position record."""
    id: int
    vehicle_id: int
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


# ─────────────────────────────────────────────
# Vehicle Schemas
# ─────────────────────────────────────────────

class VehicleBase(BaseModel):
    """Shared vehicle fields used in create/update."""
    name: str
    license_plate: str
    model: Optional[str] = None
    status: Optional[str] = "active"
    notes: Optional[str] = None


class VehicleCreate(VehicleBase):
    """
    Request body for POST /vehicles — create a new vehicle.
    All VehicleBase fields are required except model.
    """
    pass


class VehicleUpdate(BaseModel):
    """
    Request body for PATCH /vehicles/{id} — partial update.
    All fields are optional; only provided fields will be updated.
    """
    name: Optional[str] = None
    license_plate: Optional[str] = None
    model: Optional[str] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class VehicleOut(VehicleBase):
    """
    Full vehicle response schema — includes current GPS position
    and last activity timestamp returned to the frontend.
    """
    id: int
    is_active: bool
    current_lat:   Optional[float] = None
    current_lng:   Optional[float] = None
    current_speed: Optional[float] = 0.0
    last_seen:     Optional[datetime] = None
    notes:         Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class VehicleDetail(VehicleOut):
    """
    Extended vehicle details, optionally includes recent position history.
    Used for the detail endpoint GET /vehicles/{vehicle_id}.
    """
    positions: Optional[List[PositionOut]] = []

    model_config = ConfigDict(from_attributes=True)


# ─────────────────────────────────────────────
# Geofence Zone Schemas
# ─────────────────────────────────────────────

class GeofenceZoneCreate(BaseModel):
    """Request body for POST /geofence — create a new zone."""
    name:        str
    latitude:    float
    longitude:   float
    radius_m:    float = 500.0
    color:       str = "#1976d2"
    description: Optional[str] = None


class GeofenceZoneUpdate(BaseModel):
    """Request body for PATCH /geofence/{id} — partial update."""
    name:        Optional[str]   = None
    latitude:    Optional[float] = None
    longitude:   Optional[float] = None
    radius_m:    Optional[float] = None
    color:       Optional[str]   = None
    description: Optional[str]  = None


class GeofenceZoneOut(BaseModel):
    """Full geofence zone response schema."""
    id:          int
    name:        str
    latitude:    float
    longitude:   float
    radius_m:    float
    color:       str
    description: Optional[str] = None
    created_at:  datetime

    model_config = ConfigDict(from_attributes=True)
