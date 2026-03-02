# models.py — SQLAlchemy ORM models for Vehicles and Positions (MySQL/SQLite compatible)

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship, DeclarativeBase
from datetime import datetime, timezone


def _now():
    return datetime.now(timezone.utc)


# SQLAlchemy 2.x recommended base class
class Base(DeclarativeBase):
    pass


class Vehicle(Base):
    """
    Represents a fleet vehicle.
    Stores metadata like name, license plate, model, and status.
    """
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)              # Human-readable label (e.g. "Truck-01")
    license_plate = Column(String(20), unique=True, nullable=False, index=True)   # Unique plate number
    model = Column(String(100), nullable=True)              # Vehicle model (e.g. "MAN TGX")
    status = Column(String(50), default="active")           # active | inactive | maintenance
    is_active = Column(Boolean, default=True)               # Quick active/inactive toggle

    # Current GPS coordinates (updated by the data generator)
    current_lat   = Column(Float, nullable=True)
    current_lng   = Column(Float, nullable=True)
    current_speed = Column(Float, nullable=True, default=0.0)  # km/h of last known position
    last_seen     = Column(DateTime, nullable=True)            # Timestamp of last position update
    notes         = Column(String(500), nullable=True)         # Operator notes / service remarks

    # One-to-many relationship: one vehicle → many position history records
    positions = relationship("Position", back_populates="vehicle", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Vehicle id={self.id} name={self.name} plate={self.license_plate}>"


class Position(Base):
    """
    Represents a recorded GPS position of a vehicle at a specific time.
    Used to build the historical path on the map.
    """
    __tablename__ = "positions"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    speed = Column(Float, default=0.0)          # Speed in km/h at the time of recording
    timestamp = Column(DateTime, default=_now, index=True)  # When the position was recorded

    # Back-reference to the parent Vehicle
    vehicle = relationship("Vehicle", back_populates="positions")

    def __repr__(self):
        return f"<Position vehicle_id={self.vehicle_id} lat={self.latitude} lng={self.longitude} time={self.timestamp}>"


class GeofenceZone(Base):
    """
    A named geographic zone (circle on the map) used for entry/exit detection and display.
    """
    __tablename__ = "geofence_zones"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(100), nullable=False)
    latitude    = Column(Float, nullable=False)
    longitude   = Column(Float, nullable=False)
    radius_m    = Column(Float, nullable=False, default=500.0)   # metres
    color       = Column(String(20), default="#1976d2")          # hex border colour
    description = Column(String(300), nullable=True)
    created_at  = Column(DateTime, default=_now)

    def __repr__(self):
        return f"<GeofenceZone id={self.id} name={self.name}>"
