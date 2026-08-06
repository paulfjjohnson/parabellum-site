"""Backend tests: contact/launch submissions + admin auth + admin/submissions listing."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "paul@theparabellumco.com"
ADMIN_PASSWORD = "Parabellum@142420"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data and isinstance(data["access_token"], str) and len(data["access_token"]) > 20
    assert data["user"]["email"] == ADMIN_EMAIL
    return data["access_token"]


# ---- Public submission endpoints ----
class TestSubmissions:
    def test_contact_submit(self, session):
        payload = {
            "name": "TEST_Contact_User",
            "email": f"test_contact_{uuid.uuid4().hex[:6]}@example.com",
            "org": "TEST Org",
            "message": "TEST_MARKER hello from pytest",
        }
        r = session.post(f"{API}/contact", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("ok") is True
        assert "id" in data and isinstance(data["id"], str)
        pytest.contact_email = payload["email"]  # stash for later verification
        pytest.contact_id = data["id"]

    def test_launch_submit(self, session):
        payload = {
            "name": "TEST_Launch_User",
            "email": f"test_launch_{uuid.uuid4().hex[:6]}@example.com",
            "org": "TEST Booster Club",
            "orgType": "Sports / Booster Club",
            "goals": ["Fundraising", "Spirit Wear"],
            "timeline": "This month",
            "notes": "TEST_MARKER launch notes",
        }
        r = session.post(f"{API}/launch", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("ok") is True
        assert "id" in data
        pytest.launch_email = payload["email"]
        pytest.launch_id = data["id"]

    def test_contact_validation_missing_fields(self, session):
        r = session.post(f"{API}/contact", json={"name": "x"})
        assert r.status_code == 422

    def test_contact_invalid_email(self, session):
        r = session.post(f"{API}/contact", json={"name": "x", "email": "not-an-email", "message": "hi"})
        assert r.status_code == 422


# ---- Auth ----
class TestAuth:
    def test_login_success(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["user"]["email"] == ADMIN_EMAIL
        assert d["user"].get("role") == "admin"
        assert isinstance(d["access_token"], str)

    def test_login_wrong_password_returns_401(self, session):
        # Use throwaway email so we don't lock out real admin
        throwaway = f"nobody_{uuid.uuid4().hex[:8]}@example.com"
        r = session.post(f"{API}/auth/login", json={"email": throwaway, "password": "wrong"})
        assert r.status_code == 401

    def test_brute_force_lockout_with_throwaway(self, session):
        """Try up to 15 attempts to trigger lockout. In the K8s deployment
        request.client.host alternates between backend pod IPs, so a single
        client can hit multiple identifier buckets. This test documents the
        behavior; if 429 never appears, the lockout is effectively bypassable."""
        throwaway = f"bruteforce_{uuid.uuid4().hex[:8]}@example.com"
        statuses = []
        for _ in range(15):
            r = session.post(f"{API}/auth/login", json={"email": throwaway, "password": "wrong"})
            statuses.append(r.status_code)
        assert 429 in statuses, (
            f"Brute force lockout never triggered in 15 attempts (got {statuses}). "
            "Likely cause: identifier uses request.client.host which is the backend "
            "pod IP behind the ingress and varies per request. Use X-Forwarded-For."
        )

    def test_auth_me_requires_token(self, session):
        # Fresh session without auth
        s2 = requests.Session()
        r = s2.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_auth_me_with_token(self, session, admin_token):
        r = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL


# ---- Admin submissions listing ----
class TestAdminSubmissions:
    def test_list_without_token_401(self, session):
        s2 = requests.Session()
        r = s2.get(f"{API}/admin/submissions")
        assert r.status_code == 401

    def test_list_with_invalid_token_401(self, session):
        r = requests.get(f"{API}/admin/submissions", headers={"Authorization": "Bearer garbage.token.here"})
        assert r.status_code == 401

    def test_list_with_valid_token(self, admin_token):
        r = requests.get(f"{API}/admin/submissions", headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200
        data = r.json()
        assert "submissions" in data and isinstance(data["submissions"], list)
        # Verify our earlier test submissions appear
        emails = [s.get("email") for s in data["submissions"]]
        assert getattr(pytest, "contact_email", None) in emails, "Contact submission not persisted"
        assert getattr(pytest, "launch_email", None) in emails, "Launch submission not persisted"

        # Validate shape of one launch entry
        launch = next((s for s in data["submissions"] if s.get("email") == pytest.launch_email), None)
        assert launch is not None
        assert launch["type"] == "launch"
        assert "_id" not in launch  # MongoDB _id must be excluded
        assert launch["data"]["goals"] == ["Fundraising", "Spirit Wear"]
        assert launch["data"]["orgType"] == "Sports / Booster Club"
        assert launch["data"]["timeline"] == "This month"
