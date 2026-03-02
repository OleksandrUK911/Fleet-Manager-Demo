# generator.py — Simulated vehicle movement data generator
#
# Run this script to:
#   1. Seed the database with sample vehicles (if none exist)
#   2. Continuously generate new GPS positions every N seconds to simulate movement
#
# Usage:
#   python -m app.generator
#   or in a separate terminal while the backend is running
#
# Environment variables:
#   GENERATOR_INTERVAL_SECS  — update interval in seconds (default: 10)
#   GENERATOR_CITY           — city for simulated movement: london | manchester |
#                              birmingham | edinburgh  (default: london)

import os
import time
import math
import random
from datetime import datetime, timezone

from .database import SessionLocal, engine
from .models import Base, Vehicle, Position


def _now():
    """Return current UTC time as a timezone-aware datetime (Python 3.12+ compatible)."""
    return datetime.now(timezone.utc)


# Create tables if needed (safe to call multiple times)
Base.metadata.create_all(bind=engine)

# ─── Sample vehicles to seed the database ────────────────────────────────────
SAMPLE_VEHICLES = [
    {"name": "Truck-01", "license_plate": "LN72 ACT", "model": "Mercedes Actros 1845", "status": "active"},
    {"name": "Truck-02", "license_plate": "SW21 KDB", "model": "Volvo FH 500",          "status": "active"},
    {"name": "Van-01",   "license_plate": "WE19 SDH", "model": "Ford Transit Custom",   "status": "active"},
    {"name": "Van-02",   "license_plate": "BX65 TJH", "model": "Mercedes Sprinter 316", "status": "inactive"},
    {"name": "Car-01",   "license_plate": "KG22 NPL", "model": "BMW 5 Series",          "status": "maintenance"},
]

# ─── Multi-city configuration ─────────────────────────────────────────────────────────────
_CITY_CONFIGS: dict[str, dict] = {
    "london":     {
        "lat": 51.5074, "lng": -0.1278, "lat_min": 51.38, "lat_max": 51.63, "lng_min": -0.52, "lng_max": 0.20,
    },
    "manchester": {
        "lat": 53.4808, "lng": -2.2426, "lat_min": 53.35, "lat_max": 53.60, "lng_min": -2.45, "lng_max": -2.05,
    },
    "birmingham": {
        "lat": 52.4862, "lng": -1.8904, "lat_min": 52.38, "lat_max": 52.60, "lng_min": -2.05, "lng_max": -1.70,
    },
    "edinburgh":  {
        "lat": 55.9533, "lng": -3.1883, "lat_min": 55.87, "lat_max": 56.02, "lng_min": -3.40, "lng_max": -2.95,
    },
}
_CITY = os.getenv("GENERATOR_CITY", "london").lower().strip()
_CITY_CFG = _CITY_CONFIGS.get(_CITY, _CITY_CONFIGS["london"])

# Central starting point for the selected city
BASE_LAT = _CITY_CFG["lat"]
BASE_LNG = _CITY_CFG["lng"]

# Each vehicle has a slightly offset starting position around London
VEHICLE_OFFSETS = [
    ( 0.00,  0.00),   # City of London
    ( 0.02,  0.03),   # Canary Wharf area
    (-0.01, -0.04),   # Kensington
    ( 0.03,  0.05),   # Hackney area
    (-0.02, -0.02),   # Lambeth
]


def seed_vehicles(db):
    """
    Insert sample vehicles into the database if no vehicles exist yet.
    Also sets an initial random position and status for each vehicle.
    """
    if db.query(Vehicle).count() > 0:
        print("[Generator] Vehicles already exist — skipping seed.")
        apply_demo_statuses(db)
        return

    print("[Generator] Seeding sample vehicles...")
    for i, data in enumerate(SAMPLE_VEHICLES):
        lat_offset, lng_offset = VEHICLE_OFFSETS[i]
        vehicle = Vehicle(
            **data,
            current_lat=BASE_LAT + lat_offset,
            current_lng=BASE_LNG + lng_offset,
            current_speed=0.0,
            last_seen=_now(),
        )
        db.add(vehicle)
    db.commit()
    print(f"[Generator] {len(SAMPLE_VEHICLES)} vehicles seeded.")


def apply_demo_statuses(db):
    """
    Ensure demo vehicles have the correct statuses for visual variety.
    Safe to call on an existing database — only updates if status differs.
    """
    demo_statuses = {
        "BX65 TJH": "inactive",    # Van-02 — parked, off shift
        "KG22 NPL": "maintenance",  # Car-01 — broken down
    }
    changed = 0
    for plate, target_status in demo_statuses.items():
        v = db.query(Vehicle).filter(Vehicle.license_plate == plate).first()
        if v and v.status != target_status:
            v.status = target_status
            v.current_speed = 0.0
            changed += 1
            print(f"[Generator] Set {v.name} ({plate}) → {target_status}")
    if changed:
        db.commit()


def simulate_movement(
    lat: float,
    lng: float,
    step: float = 0.001,
    lat_min: float | None = None,
    lat_max: float | None = None,
    lng_min: float | None = None,
    lng_max: float | None = None,
) -> tuple:
    """
    Simulate small random GPS movement around the current position.

    Uses a random walk algorithm with slight directional bias.
    Bounds default to the configured city's bounding box.
    Returns new (latitude, longitude).
    """
    # Random angle for direction change
    angle = random.uniform(0, 2 * math.pi)
    distance = random.uniform(0.0002, step)

    new_lat = lat + distance * math.cos(angle)
    new_lng = lng + distance * math.sin(angle)

    # Keep vehicles within the city bounding box
    _lat_min = lat_min if lat_min is not None else _CITY_CFG["lat_min"]
    _lat_max = lat_max if lat_max is not None else _CITY_CFG["lat_max"]
    _lng_min = lng_min if lng_min is not None else _CITY_CFG["lng_min"]
    _lng_max = lng_max if lng_max is not None else _CITY_CFG["lng_max"]

    new_lat = max(_lat_min, min(_lat_max, new_lat))
    new_lng = max(_lng_min, min(_lng_max, new_lng))

    return round(new_lat, 6), round(new_lng, 6)


def generate_positions(db, vehicle: Vehicle) -> Position:
    """
    Generate a new simulated GPS position for a vehicle,
    update its current_lat/current_lng, and persist both records.
    """
    new_lat, new_lng = simulate_movement(
        vehicle.current_lat or BASE_LAT,
        vehicle.current_lng or BASE_LNG,
    )

    # Calculate a simulated speed (km/h) based on movement distance
    lat_diff = abs(new_lat - (vehicle.current_lat or BASE_LAT))
    lng_diff = abs(new_lng - (vehicle.current_lng or BASE_LNG))
    speed = round(math.sqrt(lat_diff**2 + lng_diff**2) * 111_000 * 0.36, 1)  # approx km/h

    now = _now()

    # Record position in history table
    position = Position(
        vehicle_id=vehicle.id,
        latitude=new_lat,
        longitude=new_lng,
        speed=speed,
        timestamp=now,
    )
    db.add(position)

    # Update vehicle's current position and speed
    vehicle.current_lat = new_lat
    vehicle.current_lng = new_lng
    vehicle.current_speed = speed
    vehicle.last_seen = now

    return position


def run_generator(interval_seconds: int = 10):
    """
    Main loop: generates new positions for active vehicles every `interval_seconds`.
    Inactive / maintenance vehicles stay put — no position updates for them.
    Runs indefinitely until interrupted with Ctrl+C.
    """
    db = SessionLocal()

    try:
        # Seed vehicles on first run (also applies demo statuses to existing DBs)
        seed_vehicles(db)

        print(f"[Generator] Starting simulation — updating every {interval_seconds}s. Press Ctrl+C to stop.")

        while True:
            all_vehicles = db.query(Vehicle).filter(Vehicle.is_active).all()
            moving = [v for v in all_vehicles if v.status == "active"]
            parked = [v for v in all_vehicles if v.status != "active"]

            for vehicle in moving:
                pos = generate_positions(db, vehicle)
                print(
                    f"  ▶ {vehicle.name} -> lat={pos.latitude}, lng={pos.longitude}, speed={pos.speed} km/h"
                )

            for vehicle in parked:
                print(
                    f"  ■ {vehicle.name} [{vehicle.status}] — stationary"
                )

            db.commit()
            print(
                f"[Generator] tick — {len(moving)} moving, "
                f"{len(parked)} stationary — {_now().strftime('%H:%M:%S')} UTC"
            )
            time.sleep(interval_seconds)

    except KeyboardInterrupt:
        print("\n[Generator] Stopped by user.")
    finally:
        db.close()


if __name__ == "__main__":
    interval = int(os.getenv("GENERATOR_INTERVAL_SECS", "10"))
    run_generator(interval_seconds=interval)
