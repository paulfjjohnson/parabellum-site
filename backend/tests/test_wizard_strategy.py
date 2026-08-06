"""Tests for POST /api/wizard/strategy (AI Team Store Wizard)."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")
ENDPOINT = f"{BASE_URL}/api/wizard/strategy"

SAMPLE_ANSWERS = {
    "orgName": "Westfield High Boosters",
    "orgType": "School / K-12",
    "memberBase": "500–2,000",
    "goals": ["Fundraising", "Spirit Wear"],
    "windowType": "Scheduled windows",
    "volume": "1,000–5,000",
    "products": ["Tees", "Hoodies", "Hats"],
    "printMethod": "DTF",
    "personalization": "Names & numbers",
    "access": "Access code",
    "payment": ["Card", "Apple/Google Pay"],
    "fulfillment": "Ship to buyer",
    "logoStatus": "Have final files",
    "brandGuide": "Colors & logo only",
    "designSupport": "Mockups only",
    "platform": "WordPress",
    "deploy": "Subdomain store",
    "integrations": ["Email marketing", "Analytics"],
    "automation": ["Auto emails", "Auto window close"],
    "timeline": "This month",
    "budget": "$5K–$15K",
    "management": "Co-managed",
    "notes": "Fall football drop is the priority.",
}


@pytest.fixture(scope="module")
def wizard_response():
    """Call the endpoint once (AI call is slow/costs quota)."""
    resp = requests.post(ENDPOINT, json={"answers": SAMPLE_ANSWERS}, timeout=90)
    return resp


class TestWizardStrategy:
    def test_status_code_200(self, wizard_response):
        assert wizard_response.status_code == 200, (
            f"Expected 200, got {wizard_response.status_code}. Body: {wizard_response.text[:400]}"
        )

    def test_has_sections_array(self, wizard_response):
        data = wizard_response.json()
        assert "sections" in data
        assert isinstance(data["sections"], list)
        assert len(data["sections"]) >= 10, f"Expected ~11 sections, got {len(data['sections'])}"

    def test_section_shape(self, wizard_response):
        sections = wizard_response.json()["sections"]
        for i, s in enumerate(sections):
            assert isinstance(s, dict), f"Section {i} not a dict"
            assert "h" in s and "b" in s, f"Section {i} missing h/b: {s}"
            assert isinstance(s["h"], str) and s["h"].strip(), f"Section {i} empty h"
            assert isinstance(s["b"], str) and s["b"].strip(), f"Section {i} empty b"

    def test_expected_section_titles_present(self, wizard_response):
        sections = wizard_response.json()["sections"]
        titles_lower = " | ".join(s["h"].lower() for s in sections)
        for expected in [
            "executive summary",
            "platform architecture",
            "store configuration",
            "product catalog",
            "integrations",
            "automation",
            "recommended plugins",
            "timeline",
            "investment",
            "next steps",
        ]:
            assert expected in titles_lower, f"Missing section containing '{expected}' in: {titles_lower}"

    def test_content_mentions_org_context(self, wizard_response):
        sections = wizard_response.json()["sections"]
        full_text = " ".join(s["b"] for s in sections).lower()
        # Should reference the org name or a key answer for personalization
        assert "westfield" in full_text or "booster" in full_text or "school" in full_text, (
            "Response does not appear personalized to intake answers"
        )

    def test_empty_answers_still_returns_or_fails_gracefully(self):
        """With empty answers the endpoint should still respond (200 or 502) — never 500 crash."""
        resp = requests.post(ENDPOINT, json={"answers": {}}, timeout=90)
        assert resp.status_code in (200, 502), f"Unexpected {resp.status_code}: {resp.text[:300]}"

    def test_invalid_payload_returns_422(self):
        resp = requests.post(ENDPOINT, json={"bad": "payload"}, timeout=15)
        assert resp.status_code == 422, f"Expected 422 for missing 'answers', got {resp.status_code}"
