# tests/test_heatmap.py — Tests for GET /api/vehicles/heatmap
#
# Endpoint contract:
#   - Returns a list of [lat, lng, intensity] triples
#   - intensity = min(1.0, speed / 80.0)
#   - positions older than `hours` param are excluded
#   - `limit` caps the number of points returned

import pytest
from datetime import datetime, timedelta, timezone

from app.models import Vehicle, Position


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _make_vehicle(db, plate: str, name: str = "Heatmap Truck") -> Vehicle:
    v = Vehicle(name=name, license_plate=plate, model="Test", status="active")
    db.add(v)
    db.flush()
    return v


def _make_position(db, vehicle_id: int, lat: float, lng: float,
                   speed: float = 30.0, age_hours: float = 0.5) -> Position:
    ts = datetime.now(timezone.utc) - timedelta(hours=age_hours)
    pos = Position(vehicle_id=vehicle_id, latitude=lat, longitude=lng,
                   speed=speed, timestamp=ts)
    db.add(pos)
    db.flush()
    return pos


# ─── Test class ───────────────────────────────────────────────────────────────

class TestHeatmapEndpoint:
    """GET /api/vehicles/heatmap"""

    def test_empty_db_returns_empty_list(self, client):
        resp = client.get("/api/vehicles/heatmap")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_returns_three_element_triples(self, client, db_session):
        v = _make_vehicle(db_session, "HM-001")
        _make_position(db_session, v.id, 51.51, -0.12, speed=40.0)

        resp = client.get("/api/vehicles/heatmap")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 1
        point = data[0]
        assert len(point) == 3, "Each point must be [lat, lng, intensity]"

    def test_coordinates_match_inserted_position(self, client, db_session):
        v = _make_vehicle(db_session, "HM-002")
        _make_position(db_session, v.id, 51.9999, -0.1234, speed=20.0)

        data = client.get("/api/vehicles/heatmap").json()
        point = next((p for p in data if abs(p[0] - 51.9999) < 0.001), None)
        assert point is not None
        assert abs(point[1] - (-0.1234)) < 0.001

    def test_intensity_half_speed(self, client, db_session):
        v = _make_vehicle(db_session, "HM-003")
        _make_position(db_session, v.id, 51.70, -0.20, speed=40.0)  # 40/80 = 0.5

        data = client.get("/api/vehicles/heatmap").json()
        point = next(p for p in data if abs(p[0] - 51.70) < 0.001)
        assert pytest.approx(point[2], abs=0.01) == 0.5

    def test_intensity_capped_at_1_for_high_speed(self, client, db_session):
        v = _make_vehicle(db_session, "HM-004")
        _make_position(db_session, v.id, 51.71, -0.21, speed=200.0)  # > 80 → cap 1.0

        data = client.get("/api/vehicles/heatmap").json()
        point = next(p for p in data if abs(p[0] - 51.71) < 0.001)
        assert point[2] == pytest.approx(1.0, abs=0.001)

    def test_zero_speed_returns_zero_intensity(self, client, db_session):
        v = _make_vehicle(db_session, "HM-005")
        _make_position(db_session, v.id, 51.72, -0.22, speed=0.0)

        data = client.get("/api/vehicles/heatmap").json()
        point = next(p for p in data if abs(p[0] - 51.72) < 0.001)
        assert point[2] == pytest.approx(0.0, abs=0.001)

    def test_hours_filter_excludes_old_positions(self, client, db_session):
        v = _make_vehicle(db_session, "HM-006")
        # Position 36 h ago — outside the default 24 h window
        _make_position(db_session, v.id, 51.73, -0.23, speed=30.0, age_hours=36)

        data = client.get("/api/vehicles/heatmap?hours=24").json()
        assert not any(abs(p[0] - 51.73) < 0.001 for p in data), \
            "Old position should be excluded"

    def test_hours_filter_includes_recent_positions(self, client, db_session):
        v = _make_vehicle(db_session, "HM-007")
        _make_position(db_session, v.id, 51.74, -0.24, speed=30.0, age_hours=1)

        data = client.get("/api/vehicles/heatmap?hours=24").json()
        assert any(abs(p[0] - 51.74) < 0.001 for p in data), \
            "Recent position should be included"

    def test_limit_param_caps_results(self, client, db_session):
        v = _make_vehicle(db_session, "HM-008")
        for i in range(20):
            _make_position(db_session, v.id, 51.5 + i * 0.01, -0.1, speed=25.0)

        resp = client.get("/api/vehicles/heatmap?limit=100")  # min allowed = 100
        assert resp.status_code == 200
        assert len(resp.json()) <= 100

    def test_intensity_all_values_in_valid_range(self, client, db_session):
        v = _make_vehicle(db_session, "HM-009")
        for spd in (0, 10, 40, 80, 120):
            _make_position(db_session, v.id, 51.60 + spd * 0.001, -0.30, speed=float(spd))

        data = client.get("/api/vehicles/heatmap").json()
        for point in data:
            assert 0.0 <= point[2] <= 1.0, f"Intensity out of range: {point[2]}"

    def test_invalid_hours_zero_returns_422(self, client):
        resp = client.get("/api/vehicles/heatmap?hours=0")
        assert resp.status_code == 422

    def test_invalid_limit_below_minimum_returns_422(self, client):
        resp = client.get("/api/vehicles/heatmap?limit=99")  # min is 100
        assert resp.status_code == 422

    def test_invalid_hours_above_maximum_returns_422(self, client):
        resp = client.get("/api/vehicles/heatmap?hours=73")  # max is 72
        assert resp.status_code == 422
