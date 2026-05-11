"""Backend tests for Echoes of Silence Cognitive Assessment API.

Covers:
- Health endpoint
- POST /api/users (user creation)
- POST /api/sessions (scoring + dimensions + level)
- GET /api/sessions/{id}
- 404 for unknown user_id
- Score normalisation edges (0 and 50)
- _id excluded from MongoDB responses
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://cognitive-assess-1.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ----- Health -----
def test_health(session):
    r = session.get(f"{API}/")
    assert r.status_code == 200
    data = r.json()
    assert "message" in data


# ----- Users -----
@pytest.fixture(scope="module")
def created_user(session):
    payload = {
        "name": "TEST_User",
        "day": "12",
        "month": "May",
        "year": "1990",
        "email": "TEST_user@example.com",
        "phone": "1234567890",
        "company": "Cigna",
        "designation": "QA",
    }
    r = session.post(f"{API}/users", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "id" in data and isinstance(data["id"], str) and len(data["id"]) > 0
    assert data["name"] == payload["name"]
    assert data["email"] == payload["email"]
    assert "_id" not in data
    return data


def test_create_user_minimal(session):
    r = session.post(f"{API}/users", json={"name": "TEST_Min", "day": "1", "email": "TEST_min@example.com"})
    assert r.status_code == 200
    data = r.json()
    assert data["name"] == "TEST_Min"
    assert data["month"] == ""
    assert "_id" not in data


# ----- Sessions: scoring -----
def test_session_full_score(session, created_user):
    """raw 50/50 -> normalised 100, total 100, level ADVANCED."""
    payload = {
        "user_id": created_user["id"],
        "scores": {
            "pattern_recall": 50, "rule_changed": 50, "reaction_pulse": 50,
            "decision_sprint": 50, "tap_stars": 50, "find_odd": 50,
        },
    }
    r = session.post(f"{API}/sessions", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "_id" not in data
    assert data["total_score"] == 100
    assert data["level"] == "ADVANCED"
    for k in ("attention", "processing", "memory", "flexibility"):
        assert data["dimensions"][k] == 100
    # all normalised scores equal 100
    for k, v in data["scores"].items():
        assert v == 100, f"{k} expected 100 got {v}"
    return data


def test_session_zero_score(session, created_user):
    """raw 0 -> 0, total 0, level BEGINNER."""
    payload = {
        "user_id": created_user["id"],
        "scores": {
            "pattern_recall": 0, "rule_changed": 0, "reaction_pulse": 0,
            "decision_sprint": 0, "tap_stars": 0, "find_odd": 0,
        },
    }
    r = session.post(f"{API}/sessions", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["total_score"] == 0
    assert data["level"] == "BEGINNER"
    for k in ("attention", "processing", "memory", "flexibility"):
        assert data["dimensions"][k] == 0


def test_session_mid_score_levels(session, created_user):
    """raw 25 each -> normalised 50, total 50, level INTERMEDIATE."""
    payload = {
        "user_id": created_user["id"],
        "scores": {
            "pattern_recall": 25, "rule_changed": 25, "reaction_pulse": 25,
            "decision_sprint": 25, "tap_stars": 25, "find_odd": 25,
        },
    }
    r = session.post(f"{API}/sessions", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["total_score"] == 50
    assert data["level"] == "INTERMEDIATE"


def test_session_proficient_level(session, created_user):
    payload = {
        "user_id": created_user["id"],
        "scores": {
            "pattern_recall": 35, "rule_changed": 35, "reaction_pulse": 35,
            "decision_sprint": 35, "tap_stars": 35, "find_odd": 35,
        },
    }
    r = session.post(f"{API}/sessions", json=payload)
    assert r.status_code == 200
    data = r.json()
    # 35/50*100=70 -> level PROFICIENT (>=60, <80)
    assert data["total_score"] == 70
    assert data["level"] == "PROFICIENT"


def test_session_dimension_blends(session, created_user):
    """Verify dimension formula: attention = (reaction_pulse + tap_stars)/2 normalised."""
    payload = {
        "user_id": created_user["id"],
        "scores": {
            "pattern_recall": 10,    # norm 20
            "rule_changed": 20,      # norm 40
            "reaction_pulse": 30,    # norm 60
            "decision_sprint": 40,   # norm 80
            "tap_stars": 50,         # norm 100
            "find_odd": 0,           # norm 0
        },
    }
    r = session.post(f"{API}/sessions", json=payload)
    assert r.status_code == 200
    data = r.json()
    # total = avg(20,40,60,80,100,0) = 50
    assert data["total_score"] == 50
    assert data["dimensions"]["attention"] == 80    # (60+100)/2
    assert data["dimensions"]["processing"] == 70   # (80+60)/2
    assert data["dimensions"]["memory"] == 10       # (20+0)/2
    assert data["dimensions"]["flexibility"] == 60  # (40+80)/2


# ----- Get session + persistence -----
def test_get_session_persistence(session, created_user):
    payload = {
        "user_id": created_user["id"],
        "scores": {
            "pattern_recall": 40, "rule_changed": 45, "reaction_pulse": 30,
            "decision_sprint": 25, "tap_stars": 50, "find_odd": 35,
        },
    }
    r = session.post(f"{API}/sessions", json=payload)
    assert r.status_code == 200
    sid = r.json()["id"]
    g = session.get(f"{API}/sessions/{sid}")
    assert g.status_code == 200
    fetched = g.json()
    assert "_id" not in fetched
    assert fetched["id"] == sid
    assert fetched["user_id"] == created_user["id"]
    assert fetched["user_name"] == created_user["name"]
    assert fetched["total_score"] == r.json()["total_score"]
    assert fetched["level"] == r.json()["level"]
    assert fetched["dimensions"] == r.json()["dimensions"]


def test_get_session_not_found(session):
    r = session.get(f"{API}/sessions/nonexistent-session-id-xyz-123")
    assert r.status_code == 404


def test_session_unknown_user(session):
    payload = {
        "user_id": "nonexistent-user-id-xyz-9999",
        "scores": {
            "pattern_recall": 10, "rule_changed": 10, "reaction_pulse": 10,
            "decision_sprint": 10, "tap_stars": 10, "find_odd": 10,
        },
    }
    r = session.post(f"{API}/sessions", json=payload)
    assert r.status_code == 404
    assert "detail" in r.json()


def test_session_clamps_over_max(session, created_user):
    """Raw value beyond 50 should be clamped to 100 (per compute_results min/max)."""
    payload = {
        "user_id": created_user["id"],
        "scores": {
            "pattern_recall": 999, "rule_changed": 50, "reaction_pulse": 50,
            "decision_sprint": 50, "tap_stars": 50, "find_odd": 50,
        },
    }
    r = session.post(f"{API}/sessions", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["scores"]["pattern_recall"] == 100
    assert data["total_score"] == 100
