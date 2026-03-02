# tests/test_auth.py — Tests for POST /api/auth/login

import pytest
from tests.conftest import get_admin_token, get_viewer_token


class TestLogin:
    """POST /api/auth/login"""

    def test_admin_login_succeeds(self, client):
        resp = client.post("/api/auth/login", json={"username": "admin", "password": "fleet2024"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["username"] == "admin"
        assert data["role"] == "admin"
        assert data["token_type"] == "bearer"
        assert "access_token" in data
        assert len(data["access_token"]) > 20

    def test_viewer_login_succeeds(self, client):
        resp = client.post("/api/auth/login", json={"username": "viewer", "password": "viewer123"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["username"] == "viewer"
        assert data["role"] == "viewer"

    def test_wrong_password_returns_401(self, client):
        resp = client.post("/api/auth/login", json={"username": "admin", "password": "wrongpass"})
        assert resp.status_code == 401

    def test_unknown_user_returns_401(self, client):
        resp = client.post("/api/auth/login", json={"username": "ghost", "password": "anything"})
        assert resp.status_code == 401

    def test_empty_body_returns_422(self, client):
        resp = client.post("/api/auth/login", json={})
        assert resp.status_code == 422

    def test_case_insensitive_username(self, client):
        resp = client.post("/api/auth/login", json={"username": "ADMIN", "password": "fleet2024"})
        assert resp.status_code == 200


class TestTokenDecoding:
    """Token format and expiry sanity checks."""

    def test_token_has_three_parts(self, client):
        """Every JWT must have exactly 3 dot-separated segments."""
        resp = client.post("/api/auth/login", json={"username": "admin", "password": "fleet2024"})
        token = resp.json()["access_token"]
        assert len(token.split(".")) == 3

    def test_protected_endpoint_without_token_returns_403_or_401(self, client):
        """Creating a vehicle without a token must be rejected."""
        resp = client.post("/api/vehicles/", json={
            "name": "Ghost", "license_plate": "GH-000", "model": "None", "status": "active"
        })
        assert resp.status_code in (401, 403)

    def test_protected_endpoint_with_bad_token_returns_401(self, client):
        resp = client.post(
            "/api/vehicles/",
            json={"name": "Ghost", "license_plate": "GH-000", "model": "X", "status": "active"},
            headers={"Authorization": "Bearer totally.invalid.jwt"},
        )
        assert resp.status_code == 401
