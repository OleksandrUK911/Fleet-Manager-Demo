# tests/test_geofence.py — Tests for geofence zone CRUD endpoints

import pytest
from .conftest import get_admin_token, get_viewer_token


# ─── Helpers ─────────────────────────────────────────────────────────────────

def create_test_zone(client, auth_header: str, overrides: dict = None) -> dict:
    """POST a geofence zone and return the created object."""
    payload = {
        "name": "Test Zone",
        "latitude": 51.5074,
        "longitude": -0.1278,
        "radius_m": 500.0,
        "color": "#1976d2",
        "description": "Test geofence",
    }
    if overrides:
        payload.update(overrides)
    resp = client.post("/api/geofence", json=payload, headers={"Authorization": auth_header})
    assert resp.status_code == 201, f"create_test_zone failed: {resp.text}"
    return resp.json()


# ─── List zones ───────────────────────────────────────────────────────────────

class TestListGeofences:
    def test_list_zones_returns_list(self, client):
        resp = client.get("/api/geofence")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_list_zones_includes_created_zone(self, client):
        auth = get_admin_token(client)
        create_test_zone(client, auth, overrides={"name": "Marker Zone"})
        resp = client.get("/api/geofence")
        names = [z["name"] for z in resp.json()]
        assert "Marker Zone" in names


# ─── Get single zone ──────────────────────────────────────────────────────────

class TestGetGeofence:
    def test_get_existing_zone(self, client):
        auth = get_admin_token(client)
        created = create_test_zone(client, auth)
        resp = client.get(f"/api/geofence/{created['id']}")
        assert resp.status_code == 200
        assert resp.json()["name"] == created["name"]

    def test_get_nonexistent_returns_404(self, client):
        resp = client.get("/api/geofence/99999")
        assert resp.status_code == 404


# ─── Create zone ──────────────────────────────────────────────────────────────

class TestCreateGeofence:
    def test_admin_can_create(self, client):
        auth = get_admin_token(client)
        zone = create_test_zone(client, auth)
        assert zone["id"] > 0
        assert zone["name"] == "Test Zone"
        assert zone["radius_m"] == 500.0
        assert "created_at" in zone

    def test_viewer_cannot_create(self, client):
        auth = get_viewer_token(client)
        resp = client.post(
            "/api/geofence",
            json={"name": "X", "latitude": 51.5, "longitude": -0.1, "radius_m": 200},
            headers={"Authorization": auth},
        )
        assert resp.status_code == 403

    def test_unauthenticated_cannot_create(self, client):
        resp = client.post(
            "/api/geofence",
            json={"name": "X", "latitude": 51.5, "longitude": -0.1, "radius_m": 200},
        )
        assert resp.status_code in (401, 403)

    def test_missing_required_fields_returns_422(self, client):
        auth = get_admin_token(client)
        resp = client.post("/api/geofence", json={"name": "No coords"}, headers={"Authorization": auth})
        assert resp.status_code == 422


# ─── Update zone ──────────────────────────────────────────────────────────────

class TestUpdateGeofence:
    def test_admin_can_update(self, client):
        auth = get_admin_token(client)
        zone = create_test_zone(client, auth)
        resp = client.patch(
            f"/api/geofence/{zone['id']}",
            json={"name": "Updated Zone", "radius_m": 750.0},
            headers={"Authorization": auth},
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "Updated Zone"
        assert resp.json()["radius_m"] == 750.0

    def test_update_nonexistent_returns_404(self, client):
        auth = get_admin_token(client)
        resp = client.patch("/api/geofence/99999", json={"name": "X"}, headers={"Authorization": auth})
        assert resp.status_code == 404

    def test_viewer_cannot_update(self, client):
        admin = get_admin_token(client)
        viewer = get_viewer_token(client)
        zone = create_test_zone(client, admin)
        resp = client.patch(
            f"/api/geofence/{zone['id']}",
            json={"name": "Hacked"},
            headers={"Authorization": viewer},
        )
        assert resp.status_code == 403


# ─── Delete zone ──────────────────────────────────────────────────────────────

class TestDeleteGeofence:
    def test_admin_can_delete(self, client):
        auth = get_admin_token(client)
        zone = create_test_zone(client, auth)
        resp = client.delete(f"/api/geofence/{zone['id']}", headers={"Authorization": auth})
        assert resp.status_code == 204

    def test_deleted_zone_not_in_list(self, client):
        auth = get_admin_token(client)
        zone = create_test_zone(client, auth, overrides={"name": "Soon Gone"})
        client.delete(f"/api/geofence/{zone['id']}", headers={"Authorization": auth})
        ids = [z["id"] for z in client.get("/api/geofence").json()]
        assert zone["id"] not in ids

    def test_viewer_cannot_delete(self, client):
        admin = get_admin_token(client)
        viewer = get_viewer_token(client)
        zone = create_test_zone(client, admin)
        resp = client.delete(f"/api/geofence/{zone['id']}", headers={"Authorization": viewer})
        assert resp.status_code == 403

    def test_delete_nonexistent_returns_404(self, client):
        auth = get_admin_token(client)
        resp = client.delete("/api/geofence/99999", headers={"Authorization": auth})
        assert resp.status_code == 404
