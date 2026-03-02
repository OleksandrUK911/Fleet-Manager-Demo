# routers/geofence.py — CRUD endpoints for geofence zones

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import require_admin
from ..database import get_db
from ..models import GeofenceZone
from ..schemas import GeofenceZoneCreate, GeofenceZoneOut, GeofenceZoneUpdate

router = APIRouter(tags=["Geofence"])


# ─── List all zones ───────────────────────────────────────────────────────────

@router.get(
    "/geofence",
    response_model=list[GeofenceZoneOut],
    summary="List all geofence zones",
)
def list_zones(db: Session = Depends(get_db)):
    """Return all geofence zones ordered by id."""
    return db.query(GeofenceZone).order_by(GeofenceZone.id).all()


# ─── Get single zone ──────────────────────────────────────────────────────────

@router.get(
    "/geofence/{zone_id}",
    response_model=GeofenceZoneOut,
    summary="Get a specific geofence zone",
)
def get_zone(zone_id: int, db: Session = Depends(get_db)):
    zone = db.query(GeofenceZone).filter(GeofenceZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Geofence zone not found")
    return zone


# ─── Create zone ──────────────────────────────────────────────────────────────

@router.post(
    "/geofence",
    response_model=GeofenceZoneOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new geofence zone (admin only)",
)
def create_zone(body: GeofenceZoneCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    zone = GeofenceZone(**body.model_dump())
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return zone


# ─── Update zone ──────────────────────────────────────────────────────────────

@router.patch(
    "/geofence/{zone_id}",
    response_model=GeofenceZoneOut,
    summary="Update a geofence zone (admin only)",
)
def update_zone(zone_id: int, body: GeofenceZoneUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    zone = db.query(GeofenceZone).filter(GeofenceZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Geofence zone not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(zone, field, value)
    db.commit()
    db.refresh(zone)
    return zone


# ─── Delete zone ──────────────────────────────────────────────────────────────

@router.delete(
    "/geofence/{zone_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a geofence zone (admin only)",
)
def delete_zone(zone_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    zone = db.query(GeofenceZone).filter(GeofenceZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Geofence zone not found")
    db.delete(zone)
    db.commit()
