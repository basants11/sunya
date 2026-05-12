"""Sunya backend regression tests"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://begin-here-26.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

DEMO = {"email": "demo@sunya.com.np", "password": "Demo@Sunya2026"}
ADMIN = {"email": "admin@sunya.com.np", "password": "Admin@Sunya2026"}


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def demo_token(session):
    r = session.post(f"{API}/auth/login", json=DEMO, timeout=30)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="session")
def admin_token(session):
    r = session.post(f"{API}/auth/login", json=ADMIN, timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["user"]["role"] == "admin"
    return data["token"]


# ---------- root ----------
def test_root(session):
    r = session.get(f"{API}/", timeout=15)
    assert r.status_code == 200
    assert "Sunya" in r.json().get("message", "")


# ---------- products ----------
def test_products_list(session):
    r = session.get(f"{API}/products", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 6
    for p in data:
        assert "gram_pricing" in p
        assert len(p["gram_pricing"]) == 6
        grams = [gp["grams"] for gp in p["gram_pricing"]]
        assert set(grams) == {100, 200, 300, 400, 500, 1000}


def test_product_detail_kiwi(session):
    r = session.get(f"{API}/products/dried-kiwi", timeout=15)
    assert r.status_code == 200
    assert r.json()["slug"] == "dried-kiwi"


def test_product_not_found(session):
    r = session.get(f"{API}/products/nonexistent-slug-xyz", timeout=15)
    assert r.status_code == 404


# ---------- auth ----------
def test_signup_new_user(session):
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    r = session.post(f"{API}/auth/signup", json={"name": "Test User", "email": email, "password": "Test@1234"}, timeout=20)
    assert r.status_code == 200, r.text
    body = r.json()
    assert "token" in body and body["user"]["email"] == email


def test_login_demo(session):
    r = session.post(f"{API}/auth/login", json=DEMO, timeout=20)
    assert r.status_code == 200
    assert r.json()["user"]["role"] == "user"


def test_login_admin(session):
    r = session.post(f"{API}/auth/login", json=ADMIN, timeout=20)
    assert r.status_code == 200
    assert r.json()["user"]["role"] == "admin"


def test_login_invalid(session):
    r = session.post(f"{API}/auth/login", json={"email": "demo@sunya.com.np", "password": "wrong"}, timeout=20)
    assert r.status_code == 401


def test_me_with_token(session, demo_token):
    r = session.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {demo_token}"}, timeout=15)
    assert r.status_code == 200
    assert r.json()["email"] == DEMO["email"]


def test_me_without_token(session):
    # New session without auth header
    r = requests.get(f"{API}/auth/me", timeout=15)
    assert r.status_code == 401


# ---------- promo ----------
def test_promo_welcome15(session):
    r = session.post(f"{API}/promo/validate", json={"code": "WELCOME15"}, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data["valid"] is True and data["discount_pct"] == 15


def test_promo_sunya10(session):
    r = session.post(f"{API}/promo/validate", json={"code": "sunya10"}, timeout=15)
    assert r.json()["discount_pct"] == 10


def test_promo_invalid(session):
    r = session.post(f"{API}/promo/validate", json={"code": "INVALID"}, timeout=15)
    assert r.json()["valid"] is False


# ---------- orders ----------
def _order_payload(promo=None):
    return {
        "items": [
            {"product_id": "p-kiwi", "name": "Dried Kiwi", "selected_grams": 200, "quantity": 2, "unit_price": 1100},
        ],
        "full_name": "Demo Buyer",
        "phone": "9800000000",
        "address": "Test St",
        "city": "Kathmandu",
        "payment_method": "cod",
        "promo_code": promo,
    }


def test_create_order_shipping_applied(session, demo_token):
    headers = {"Authorization": f"Bearer {demo_token}"}
    p = _order_payload()
    r = session.post(f"{API}/orders", json=p, headers=headers, timeout=20)
    assert r.status_code == 200, r.text
    o = r.json()
    # subtotal = 2200, < 3000 → shipping 150
    assert o["subtotal"] == 2200
    assert o["shipping"] == 150
    assert o["total"] == 2350


def test_create_order_with_promo_free_shipping(session, demo_token):
    headers = {"Authorization": f"Bearer {demo_token}"}
    p = {
        "items": [
            {"product_id": "p-kiwi", "name": "Dried Kiwi", "selected_grams": 500, "quantity": 3, "unit_price": 2500},
        ],
        "full_name": "Demo Buyer",
        "phone": "9800000000",
        "address": "Test St",
        "city": "Kathmandu",
        "payment_method": "khalti",
        "promo_code": "WELCOME15",
    }
    r = session.post(f"{API}/orders", json=p, headers=headers, timeout=20)
    assert r.status_code == 200
    o = r.json()
    # subtotal 7500, discount 1125, net 6375 ≥ 3000 → shipping 0
    assert o["subtotal"] == 7500
    assert o["discount"] == 1125
    assert o["shipping"] == 0
    assert o["total"] == 6375


def test_my_orders(session, demo_token):
    headers = {"Authorization": f"Bearer {demo_token}"}
    r = session.get(f"{API}/orders", headers=headers, timeout=15)
    assert r.status_code == 200
    assert isinstance(r.json(), list)
    assert len(r.json()) >= 1


def test_admin_orders(session, admin_token):
    r = session.get(f"{API}/admin/orders", headers={"Authorization": f"Bearer {admin_token}"}, timeout=15)
    assert r.status_code == 200


def test_admin_orders_forbidden_for_user(session, demo_token):
    r = session.get(f"{API}/admin/orders", headers={"Authorization": f"Bearer {demo_token}"}, timeout=15)
    assert r.status_code == 403


def test_admin_update_order_status(session, demo_token, admin_token):
    # create an order as demo
    p = _order_payload()
    r = session.post(f"{API}/orders", json=p, headers={"Authorization": f"Bearer {demo_token}"}, timeout=20)
    oid = r.json()["id"]
    # admin patch
    r2 = session.patch(
        f"{API}/admin/orders/{oid}",
        json={"status": "confirmed"},
        headers={"Authorization": f"Bearer {admin_token}"},
        timeout=15,
    )
    assert r2.status_code == 200
    assert r2.json()["status"] == "confirmed"


# ---------- care ----------
def test_care_recommend_diabetes(session):
    profile = {
        "age": 35, "gender": "male", "height_cm": 175, "weight_kg": 80,
        "activity_level": "moderate", "goals": ["energy", "immunity"], "conditions": ["diabetes"],
    }
    r = session.post(f"{API}/care/recommend", json=profile, timeout=60)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["daily_calories"] > 1500
    assert "protein" in data["macros"]
    assert len(data["package"]) >= 2
    # Diabetes condition should warn about mango
    flat = " ".join([u["name"] + " " + u["reason"] for u in data["unsafe_foods"]]).lower()
    assert "mango" in flat


# ---------- chat ----------
def test_chat_multi_turn(session):
    sid = f"test-{uuid.uuid4().hex[:8]}"
    r1 = session.post(f"{API}/chat", json={"session_id": sid, "message": "Hi, my name is Aarav. What's your bestseller?"}, timeout=90)
    assert r1.status_code == 200, r1.text
    assert len(r1.json()["reply"]) > 0
    r2 = session.post(f"{API}/chat", json={"session_id": sid, "message": "What's my name?"}, timeout=90)
    assert r2.status_code == 200
    reply2 = r2.json()["reply"].lower()
    # check multi-turn memory
    assert "aarav" in reply2

    # history endpoint
    h = session.get(f"{API}/chat/{sid}", timeout=15)
    assert h.status_code == 200
    assert len(h.json()["messages"]) >= 4
