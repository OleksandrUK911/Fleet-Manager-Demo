# tests/test_vehicles.py — Integration tests for vehicle CRUD endpoints

import pytest
from tests.conftest import get_admin_token, get_viewer_token, create_test_vehicle


class TestListVehicles:
    """GET /api/vehicles/"""

    def test_empty_fleet_returns_list(self, client):
        resp = client.get("/api/vehicles/")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_status_filter_accepts_valid_values(self, client):
        for status in ("active", "inactive", "maintenance"):
            resp = client.get(f"/api/vehicles/?status={status}")
            assert resp.status_code == 200

    def test_pagination_params(self, client):
        resp = client.get("/api/vehicles/?skip=0&limit=5")
        assert resp.status_code == 200

    def test_invalid_limit_returns_422(self, client):
        resp = client.get("/api/vehicles/?limit=9999")
        assert resp.status_code == 422


class TestCreateVehicle:
    """POST /api/vehicles/"""

    def test_admin_can_create(self, client):
        token = get_admin_token(client)
        resp = client.post("/api/vehicles/", json={
            "name": "Truck Alpha",
            "license_plate": "AA-100",
            "model": "Scania R500",
            "status": "active",
        }, headers={"Authorization": token})
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "Truck Alpha"
        assert data["license_plate"] == "AA-100"
        assert data["id"] is not None

    def test_viewer_can_create(self, client):
        """viewer role still has a valid JWT → can create (only DELETE needs admin)."""
        token = get_viewer_token(client)
        resp = client.post("/api/vehicles/", json={
            "name": "Truck Beta",
            "license_plate": "BB-200",
            "model": "Mercedes Actros",
            "status": "active",
        }, headers={"Authorization": token})
        assert resp.status_code == 201

    def test_duplicate_plate_returns_409(self, client):
        token = get_admin_token(client)
        payload = {"name": "Van One", "license_plate": "DUPE-01", "model": "VW Crafter", "status": "active"}
        client.post("/api/vehicles/", json=payload, headers={"Authorization": token})
        resp = client.post("/api/vehicles/", json=payload, headers={"Authorization": token})
        assert resp.status_code == 409

    def test_missing_fields_returns_422(self, client):
        token = get_admin_token(client)
        resp = client.post("/api/vehicles/", json={"name": "Incomplete"}, headers={"Authorization": token})
        assert resp.status_code == 422

    def test_vehicle_appears_in_list_after_creation(self, client):
        token = get_admin_token(client)
        unique_plate = "LIST-CHECK"
        client.post("/api/vehicles/", json={
            "name": "List Check Van",
            "license_plate": unique_plate,
            "model": "Ford",
            "status": "active",
        }, headers={"Authorization": token})
        vehicles = client.get("/api/vehicles/").json()
        plates = [v["license_plate"] for v in vehicles]
        assert unique_plate in plates


class TestGetVehicle:
    """GET /api/vehicles/{id}"""

    def test_get_existing_vehicle(self, client):
        token = get_admin_token(client)
        created = create_test_vehicle(client, token, {"license_plate": "GET-01"})
        resp = client.get(f"/api/vehicles/{created['id']}")
        assert resp.status_code == 200
        assert resp.json()["id"] == created["id"]

    def test_get_nonexistent_returns_404(self, client):
        resp = client.get("/api/vehicles/99999")
        assert resp.status_code == 404


class TestUpdateVehicle:
    """PATCH /api/vehicles/{id}"""

    def test_admin_can_update_name(self, client):
        token = get_admin_token(client)
        v = create_test_vehicle(client, token, {"license_plate": "UPD-01"})
        resp = client.patch(f"/api/vehicles/{v['id']}", json={"name": "Updated Name"},
                            headers={"Authorization": token})
        assert resp.status_code == 200
        assert resp.json()["name"] == "Updated Name"

    def test_update_status(self, client):
        token = get_admin_token(client)
        v = create_test_vehicle(client, token, {"license_plate": "UPD-02"})
        resp = client.patch(f"/api/vehicles/{v['id']}", json={"status": "maintenance"},
                            headers={"Authorization": token})
        assert resp.status_code == 200
        assert resp.json()["status"] == "maintenance"

    def test_update_notes(self, client):
        token = get_admin_token(client)
        v = create_test_vehicle(client, token, {"license_plate": "UPD-03"})
        resp = client.patch(f"/api/vehicles/{v['id']}", json={"notes": "Service due 15 Mar"},
                            headers={"Authorization": token})
        assert resp.status_code == 200
        assert resp.json()["notes"] == "Service due 15 Mar"

    def test_update_plate_conflict_returns_409(self, client):
        token = get_admin_token(client)
        v1 = create_test_vehicle(client, token, {"license_plate": "CONF-A"})
        v2 = create_test_vehicle(client, token, {"license_plate": "CONF-B"})
        resp = client.patch(f"/api/vehicles/{v2['id']}", json={"license_plate": "CONF-A"},
                            headers={"Authorization": token})
        assert resp.status_code == 409

    def test_update_without_token_returns_401(self, client):
        token = get_admin_token(client)
        v = create_test_vehicle(client, token, {"license_plate": "NOAUTH-01"})
        resp = client.patch(f"/api/vehicles/{v['id']}", json={"name": "Hijack"})
        assert resp.status_code in (401, 403)

    def test_update_nonexistent_returns_404(self, client):
        token = get_admin_token(client)
        resp = client.patch("/api/vehicles/99999", json={"name": "Ghost"},
                            headers={"Authorization": token})
        assert resp.status_code == 404


class TestDeleteVehicle:
    """DELETE /api/vehicles/{id}"""

    def test_admin_can_delete(self, client):
        token = get_admin_token(client)
        v = create_test_vehicle(client, token, {"license_plate": "DEL-01"})
        resp = client.delete(f"/api/vehicles/{v['id']}", headers={"Authorization": token})
        assert resp.status_code == 204

    def test_deleted_vehicle_not_in_list(self, client):
        token = get_admin_token(client)
        v = create_test_vehicle(client, token, {"license_plate": "DEL-02"})
        client.delete(f"/api/vehicles/{v['id']}", headers={"Authorization": token})
        plates = [x["license_plate"] for x in client.get("/api/vehicles/").json()]
        assert "DEL-02" not in plates

    def test_viewer_cannot_delete(self, client):
        """Viewer role should get 403 on DELETE."""
        admin_token = get_admin_token(client)
        viewer_token = get_viewer_token(client)
        v = create_test_vehicle(client, admin_token, {"license_plate": "DEL-VIEWER"})
        resp = client.delete(f"/api/vehicles/{v['id']}", headers={"Authorization": viewer_token})
        assert resp.status_code == 403

    def test_delete_without_token_returns_401_or_403(self, client):
        token = get_admin_token(client)
        v = create_test_vehicle(client, token, {"license_plate": "DEL-NOAUTH"})
        resp = client.delete(f"/api/vehicles/{v['id']}")
        assert resp.status_code in (401, 403)

    def test_delete_nonexistent_returns_404(self, client):
        token = get_admin_token(client)
        resp = client.delete("/api/vehicles/99999", headers={"Authorization": token})
        assert resp.status_code == 404


class TestFleetStats:
    """GET /api/vehicles/stats"""

    def test_stats_shape(self, client):
        resp = client.get("/api/vehicles/stats")
        assert resp.status_code == 200
        data = resp.json()
        for key in ("total", "active", "inactive", "maintenance"):
            assert key in data
            assert isinstance(data[key], int)

    def test_stats_reflect_created_vehicle(self, client):
        token = get_admin_token(client)
        before = client.get("/api/vehicles/stats").json()["active"]
        create_test_vehicle(client, token, {"license_plate": "STAT-01", "status": "active"})
        after = client.get("/api/vehicles/stats").json()["active"]
        assert after == before + 1


class TestHealthCheck:
    """GET /api/health"""

    def test_health_returns_ok(self, client):
        resp = client.get("/api/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"


class TestSearchVehicles:
    """GET /api/vehicles/?search="""

    def test_search_by_name(self, client):
        token = get_admin_token(client)
        create_test_vehicle(client, token, {"name": "SearchTruck-X", "license_plate": "SRCH-01"})
        resp = client.get("/api/vehicles/?search=SearchTruck")
        assert resp.status_code == 200
        plates = [v["license_plate"] for v in resp.json()]
        assert "SRCH-01" in plates

    def test_search_by_plate(self, client):
        token = get_admin_token(client)
        create_test_vehicle(client, token, {"name": "AnyVan", "license_plate": "UNIQ-PLATE-99"})
        resp = client.get("/api/vehicles/?search=UNIQ-PLATE")
        assert resp.status_code == 200
        data = resp.json()
        assert any(v["license_plate"] == "UNIQ-PLATE-99" for v in data)

    def test_search_case_insensitive(self, client):
        token = get_admin_token(client)
        create_test_vehicle(client, token, {"name": "CaseSensitiveVan", "license_plate": "CASE-01"})
        for term in ("casesensitive", "CASESENSITIVE", "CaseSensitive"):
            resp = client.get(f"/api/vehicles/?search={term}")
            assert resp.status_code == 200
            assert any(v["license_plate"] == "CASE-01" for v in resp.json())

    def test_search_no_results_returns_empty_list(self, client):
        resp = client.get("/api/vehicles/?search=ZZZNOMATCHZZZ")
        assert resp.status_code == 200
        assert resp.json() == []


class TestFleetDistance:
    """GET /api/vehicles/stats/distance"""

    def test_distance_shape(self, client):
        resp = client.get("/api/vehicles/stats/distance")
        assert resp.status_code == 200
        data = resp.json()
        assert "total_km" in data
        assert "vehicle_count" in data
        assert isinstance(data["total_km"], (int, float))
        assert isinstance(data["vehicle_count"], int)

    def test_distance_non_negative(self, client):
        resp = client.get("/api/vehicles/stats/distance")
        assert resp.json()["total_km"] >= 0
        assert resp.json()["vehicle_count"] >= 0


class TestOverspeedStats:
    """GET /api/vehicles/stats/overspeed"""

    def test_overspeed_default_shape(self, client):
        resp = client.get("/api/vehicles/stats/overspeed")
        assert resp.status_code == 200
        data = resp.json()
        assert "count" in data
        assert "threshold" in data
        assert "vehicles" in data
        assert isinstance(data["count"], int)
        assert isinstance(data["vehicles"], list)

    def test_overspeed_default_threshold_is_80(self, client):
        resp = client.get("/api/vehicles/stats/overspeed")
        assert resp.json()["threshold"] == 80.0

    def test_overspeed_custom_threshold(self, client):
        resp = client.get("/api/vehicles/stats/overspeed?threshold=120")
        assert resp.status_code == 200
        assert resp.json()["threshold"] == 120.0

    def test_overspeed_invalid_threshold_returns_422(self, client):
        resp = client.get("/api/vehicles/stats/overspeed?threshold=0")
        assert resp.status_code == 422

    def test_overspeed_count_matches_vehicles_list(self, client):
        data = client.get("/api/vehicles/stats/overspeed").json()
        assert data["count"] == len(data["vehicles"])

    def test_overspeed_vehicle_fields(self, client):
        data = client.get("/api/vehicles/stats/overspeed?threshold=1").json()
        # With threshold=1 km/h, any moving vehicle will appear — test field shape
        for v in data["vehicles"]:
            assert "id" in v
            assert "name" in v
            assert "license_plate" in v
            assert "current_speed" in v

