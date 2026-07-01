"""Tests for the Package Builder feature: GET /api/packages, POST /api/packages/quote,
POST /api/packages/paypal/order (fallback), and /admin/submissions integration."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://tech-stack-audit-1.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "paul@theparabellumco.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "Parabellum@142420")


@pytest.fixture(scope="module")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_token(api_client):
    r = api_client.post(f"{BASE_URL}/api/auth/login",
                        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"admin login failed: {r.status_code} {r.text}")
    return r.json()["access_token"]


# ---------- GET /api/packages ----------
class TestPackagesCatalog:
    def test_catalog_shape(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/packages")
        assert r.status_code == 200
        data = r.json()
        # tiers
        assert set(data["tiers"].keys()) == {"starter", "growth", "operator"}
        for k in ("starter", "growth", "operator"):
            t = data["tiers"][k]
            assert "setup" in t and "monthly" in t and "includes" in t and "name" in t
            assert isinstance(t["includes"], list) and len(t["includes"]) >= 3
            assert isinstance(t["setup"], (int, float)) and t["setup"] > 0
            assert isinstance(t["monthly"], (int, float)) and t["monthly"] > 0
        # addons
        assert len(data["addons"]) == 6
        for k, v in data["addons"].items():
            assert "label" in v and "setup" in v and "monthly" in v
        # paypal fallback
        assert data["paypal_enabled"] is False
        assert data["paypal_client_id"] == ""

    def test_tier_baseline_prices(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/packages")
        d = r.json()
        assert d["tiers"]["starter"]["setup"] == 1500 and d["tiers"]["starter"]["monthly"] == 99
        assert d["tiers"]["growth"]["setup"] == 3500 and d["tiers"]["growth"]["monthly"] == 199
        assert d["tiers"]["operator"]["setup"] == 6500 and d["tiers"]["operator"]["monthly"] == 349


# ---------- POST /api/packages/quote (server-side pricing math) ----------
class TestPackageQuote:
    def test_operator_plus_automations(self, api_client):
        payload = {"name": "TEST_QuoteOp", "email": "test_quote_op@example.com",
                   "org": "TEST Org", "tier": "operator", "addons": ["automations"],
                   "question": "Timeline?"}
        r = api_client.post(f"{BASE_URL}/api/packages/quote", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["ok"] is True
        assert "id" in data
        # 6500 + 900 = 7400 / 349 + 59 = 408
        assert data["setup_total"] == 7400
        assert data["monthly_total"] == 408

    def test_growth_plus_ai_and_gang_sheet(self, api_client):
        payload = {"name": "TEST_QuoteGrowth", "email": "test_quote_g@example.com",
                   "tier": "growth", "addons": ["ai_tools", "gang_sheet"]}
        r = api_client.post(f"{BASE_URL}/api/packages/quote", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        # 3500 + 1200 + 800 = 5500 / 199 + 79 + 39 = 317
        assert data["setup_total"] == 5500
        assert data["monthly_total"] == 317

    def test_starter_no_addons(self, api_client):
        payload = {"name": "TEST_QuoteStarter", "email": "test_quote_s@example.com",
                   "tier": "starter", "addons": []}
        r = api_client.post(f"{BASE_URL}/api/packages/quote", json=payload)
        assert r.status_code == 200
        d = r.json()
        assert d["setup_total"] == 1500 and d["monthly_total"] == 99

    def test_invalid_tier_rejected(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/packages/quote",
                            json={"name": "TEST_bad", "email": "t@x.com",
                                  "tier": "enterprise", "addons": []})
        assert r.status_code == 400

    def test_invalid_addons_ignored(self, api_client):
        # bogus addon strings should be silently dropped, price = tier baseline
        r = api_client.post(f"{BASE_URL}/api/packages/quote",
                            json={"name": "TEST_ignore", "email": "t2@x.com",
                                  "tier": "starter", "addons": ["not_real", "also_fake"]})
        assert r.status_code == 200
        d = r.json()
        assert d["setup_total"] == 1500 and d["monthly_total"] == 99

    def test_missing_required_fields(self, api_client):
        # missing name
        r = api_client.post(f"{BASE_URL}/api/packages/quote",
                            json={"email": "t3@x.com", "tier": "starter"})
        assert r.status_code == 422


# ---------- POST /api/packages/paypal/order (graceful 503) ----------
class TestPaypalFallback:
    def test_create_order_503_when_unconfigured(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/packages/paypal/order",
                            json={"tier": "starter", "addons": [], "email": "buyer@x.com"})
        assert r.status_code == 503
        # graceful error body
        body = r.json()
        assert "PayPal" in body.get("detail", "")

    def test_capture_order_503_when_unconfigured(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/packages/paypal/capture/FAKE_ORDER_ID")
        assert r.status_code == 503


# ---------- Admin visibility ----------
class TestAdminSeesQuotes:
    def test_quote_appears_in_admin_inbox(self, api_client, admin_token):
        # create a quote first
        unique_email = "test_admin_visibility@example.com"
        payload = {"name": "TEST_AdminVisibility", "email": unique_email,
                   "tier": "operator", "addons": ["automations"],
                   "question": "Do quotes land in /admin?"}
        create_r = api_client.post(f"{BASE_URL}/api/packages/quote", json=payload)
        assert create_r.status_code == 200
        sub_id = create_r.json()["id"]

        # fetch admin submissions
        r = api_client.get(f"{BASE_URL}/api/admin/submissions",
                           headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200
        subs = r.json()["submissions"]
        # find ours
        match = next((s for s in subs if s.get("id") == sub_id), None)
        assert match is not None, "quote submission not visible in admin inbox"
        assert match["type"] == "package_quote"
        assert match["email"] == unique_email
        data = match["data"]
        assert data["tier"] == "Operator"
        assert data["addons"] == ["Automations (n8n / Zapier)"]
        assert data["setup_total"] == 7400
        assert data["monthly_total"] == 408
        assert data["question"] == "Do quotes land in /admin?"

    def test_admin_inbox_requires_auth(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/admin/submissions")
        assert r.status_code == 401
