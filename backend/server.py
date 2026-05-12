"""
Sunya - Premium Dehydrated Fruits E-commerce Backend
FastAPI + MongoDB + Claude Sonnet 4.5 (via emergentintegrations)
"""
from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import bcrypt
import jwt
import json
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Literal
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# ---------- DB ----------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'dev-secret')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

app = FastAPI(title="Sunya API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)


# =========================================================================
# MODELS
# =========================================================================
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    id: str
    name: str
    email: str
    role: Literal["user", "admin"] = "user"
    created_at: str


class AuthResponse(BaseModel):
    token: str
    user: UserPublic


class GramPricing(BaseModel):
    grams: int
    price: int  # NPR
    pricePerGram: float


class Product(BaseModel):
    id: str
    name: str
    slug: str
    description: str
    long_description: str
    image: str
    badge: Optional[str] = None
    features: List[str]
    price_per_gram: float
    gram_pricing: List[GramPricing]
    nutrition: dict  # per 100g
    in_stock: bool = True
    category: str = "dried-fruits"


class OrderItemInput(BaseModel):
    product_id: str
    name: str
    selected_grams: int
    quantity: int
    unit_price: int
    image: Optional[str] = None


class OrderCreate(BaseModel):
    items: List[OrderItemInput]
    full_name: str
    phone: str
    address: str
    city: str
    payment_method: Literal["cod", "khalti", "esewa", "bank"] = "cod"
    promo_code: Optional[str] = None


class Order(BaseModel):
    id: str
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    items: List[dict]
    subtotal: int
    discount: int = 0
    shipping: int = 0
    total: int
    full_name: str
    phone: str
    address: str
    city: str
    payment_method: str
    promo_code: Optional[str] = None
    status: Literal["pending", "confirmed", "shipped", "delivered", "cancelled"] = "pending"
    created_at: str


class ChatRequest(BaseModel):
    session_id: str
    message: str


class ChatResponse(BaseModel):
    session_id: str
    reply: str


class CareProfileInput(BaseModel):
    age: int
    gender: Literal["male", "female", "other"]
    height_cm: int
    weight_kg: int
    activity_level: Literal["sedentary", "light", "moderate", "active", "athlete"]
    goals: List[str]  # e.g. ["energy", "immunity", "weight-loss", "skin", "digestion", "muscle"]
    conditions: List[str] = []  # e.g. ["diabetes", "hypertension", "gluten-free"]


class CareRecommendation(BaseModel):
    daily_calories: int
    macros: dict  # protein/carbs/fats/fiber grams
    package: List[dict]  # [{product_id, name, grams, reason}]
    unsafe_foods: List[dict]  # [{name, reason}]
    advice: str
    coverage_pct: int


# =========================================================================
# AUTH HELPERS
# =========================================================================
def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()


def verify_password(p: str, h: str) -> bool:
    try:
        return bcrypt.checkpw(p.encode(), h.encode())
    except Exception:
        return False


def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=30),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(creds: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[dict]:
    if not creds:
        return None
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password": 0})
        return user
    except Exception:
        return None


async def require_user(user: Optional[dict] = Depends(get_current_user)) -> dict:
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user


async def require_admin(user: dict = Depends(require_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user


# =========================================================================
# SEED DATA
# =========================================================================
def build_gram_pricing(base_per_gram: float) -> List[dict]:
    """Tiered pricing: smaller = pricier per gram, bulk = cheaper."""
    multipliers = {100: 1.20, 200: 1.10, 300: 1.06, 400: 1.04, 500: 1.00, 1000: 0.90}
    out = []
    for g, m in multipliers.items():
        price = round(base_per_gram * g * m / 10) * 10  # round to nearest 10 NPR
        out.append({"grams": g, "price": int(price), "pricePerGram": round(price / g, 2)})
    return out


SEED_PRODUCTS = [
    {
        "id": "p-kiwi",
        "name": "Dried Kiwi Slices",
        "slug": "dried-kiwi",
        "description": "Tangy, vibrant green kiwi slices — slow-dehydrated to preserve their tart sweetness.",
        "long_description": "Hand-picked Himalayan-grown kiwi, slowly dehydrated at low temperature for 14+ hours. Zero added sugar, zero preservatives. Rich in vitamin C, vitamin K, and dietary fiber.",
        "image": "https://images.unsplash.com/photo-1752007085692-94d58e79b722?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODB8MHwxfHNlYXJjaHwyfHxkcmllZCUyMGtpd2klMjBzbGljZXN8ZW58MHx8fHwxNzc4NTc4NDIxfDA&ixlib=rb-4.1.0&q=85",
        "badge": "Bestseller",
        "features": ["Zero added sugar", "Slow-dehydrated 14h+", "High Vitamin C", "Export-grade"],
        "price_per_gram": 5.0,
        "nutrition": {"calories": 285, "protein": 4.3, "carbs": 71, "fiber": 14, "fats": 1.4, "vit_c": 75},
    },
    {
        "id": "p-mango",
        "name": "Dried Mango Strips",
        "slug": "dried-mango",
        "description": "Sun-ripened Nepalese mango — chewy, golden, and naturally sweet.",
        "long_description": "Tropical mangoes from the foothills of Nepal, dehydrated at low temperature for 16 hours. Naturally sweet without a single grain of added sugar. Full of beta-carotene and vitamin A.",
        "image": "https://images.unsplash.com/photo-1686204040685-f7a2bc30d1fd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwzfHxkcmllZCUyMG1hbmdvJTIwc2xpY2VzfGVufDB8fHx8MTc3ODU3ODQyMXww&ixlib=rb-4.1.0&q=85",
        "badge": "Limited",
        "features": ["No sulphites", "Vitamin A rich", "Naturally sweet", "Gluten-free"],
        "price_per_gram": 4.5,
        "nutrition": {"calories": 319, "protein": 2.5, "carbs": 78, "fiber": 8, "fats": 0.7, "vit_c": 35},
    },
    {
        "id": "p-pineapple",
        "name": "Dried Pineapple Rings",
        "slug": "dried-pineapple",
        "description": "Bright tropical rings with that bromelain zing — sun-kissed.",
        "long_description": "Whole pineapple rings air-dried at 50°C for 12 hours. Contains bromelain, an enzyme that aids digestion. Tropical sweetness with a satisfying chew.",
        "image": "https://images.unsplash.com/photo-1614963366795-973eb8748ebb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHw0fHxkcmllZCUyMHBpbmVhcHBsZSUyMHNsaWNlc3xlbnwwfHx8fDE3Nzg1Nzg0MjF8MA&ixlib=rb-4.1.0&q=85",
        "badge": "New",
        "features": ["Bromelain rich", "Digestion friendly", "Zero preservatives", "Tropical taste"],
        "price_per_gram": 4.2,
        "nutrition": {"calories": 252, "protein": 2.0, "carbs": 65, "fiber": 7, "fats": 0.6, "vit_c": 48},
    },
    {
        "id": "p-apple",
        "name": "Dried Apple Crisps",
        "slug": "dried-apple",
        "description": "Crisp Himalayan apple wafers — light, sweet, and snackable.",
        "long_description": "Mountain-grown Himalayan apples sliced thin and dehydrated to a satisfying crisp. Naturally high in pectin and fiber. Perfect for kids and adults alike.",
        "image": "https://images.unsplash.com/photo-1760533535534-c69f637df2e6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwyfHxkcmllZCUyMG1hbmdvJTIwc2xpY2VzfGVufDB8fHx8MTc3ODU3ODQyMXww&ixlib=rb-4.1.0&q=85",
        "badge": "Family Pack",
        "features": ["Himalayan grown", "High fiber", "Crispy texture", "Kid friendly"],
        "price_per_gram": 3.8,
        "nutrition": {"calories": 243, "protein": 0.9, "carbs": 65, "fiber": 9, "fats": 0.3, "vit_c": 4},
    },
    {
        "id": "p-banana",
        "name": "Dried Banana Chips",
        "slug": "dried-banana",
        "description": "Energy-packed banana coins — pre-workout fuel from Nepal.",
        "long_description": "Ripe bananas dehydrated to crispy golden coins. Rich in potassium and natural sugars. The perfect pre-workout or hiking snack.",
        "image": "https://images.unsplash.com/photo-1542562504-963dc9feead5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzJ8MHwxfHNlYXJjaHwxfHxkcmllZCUyMGZydWl0cyUyMGZsYXRsYXl8ZW58MHx8fHwxNzc4NTc4MzkxfDA&ixlib=rb-4.1.0&q=85",
        "badge": "Athlete Favorite",
        "features": ["Potassium rich", "Pre-workout fuel", "Resealable pouch", "No added oil"],
        "price_per_gram": 3.5,
        "nutrition": {"calories": 346, "protein": 3.9, "carbs": 88, "fiber": 9, "fats": 1.8, "vit_c": 7},
    },
    {
        "id": "p-strawberry",
        "name": "Freeze-Dried Strawberries",
        "slug": "freeze-dried-strawberry",
        "description": "Crunchy ruby-red strawberries — pure, sugar-free indulgence.",
        "long_description": "Vine-ripened strawberries freeze-dried at -40°C to preserve every nutrient. Crunchy, intense, with no rehydration. Perfect for yoghurt bowls and trail mix.",
        "image": "https://images.unsplash.com/photo-1612031326777-1391836af889?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzR8MHwxfHNlYXJjaHwxfHxuZXBhbCUyMGhpbWFsYXlhcyUyMGxhbmRzY2FwZXxlbnwwfHx8fDE3Nzg1NzgzOTF8MA&ixlib=rb-4.1.0&q=85",
        "badge": "Premium",
        "features": ["Freeze-dried", "Antioxidant rich", "100% strawberry", "Vitamin C boost"],
        "price_per_gram": 6.8,
        "nutrition": {"calories": 375, "protein": 8.0, "carbs": 87, "fiber": 17, "fats": 4.0, "vit_c": 254},
    },
]


async def seed_database():
    """Seed products & admin user if DB is empty."""
    # Seed products
    if await db.products.count_documents({}) == 0:
        docs = []
        for p in SEED_PRODUCTS:
            doc = dict(p)
            doc["gram_pricing"] = build_gram_pricing(p["price_per_gram"])
            doc["in_stock"] = True
            doc["category"] = "dried-fruits"
            docs.append(doc)
        await db.products.insert_many(docs)
        logging.info(f"Seeded {len(docs)} products")

    # Seed admin user
    existing_admin = await db.users.find_one({"email": "admin@sunya.com.np"})
    if not existing_admin:
        admin = {
            "id": str(uuid.uuid4()),
            "name": "Sunya Admin",
            "email": "admin@sunya.com.np",
            "password": hash_password("Admin@Sunya2026"),
            "role": "admin",
            "created_at": now_iso(),
        }
        await db.users.insert_one(admin)
        logging.info("Seeded admin user")

    # Seed demo user
    existing_demo = await db.users.find_one({"email": "demo@sunya.com.np"})
    if not existing_demo:
        demo = {
            "id": str(uuid.uuid4()),
            "name": "Demo Customer",
            "email": "demo@sunya.com.np",
            "password": hash_password("Demo@Sunya2026"),
            "role": "user",
            "created_at": now_iso(),
        }
        await db.users.insert_one(demo)


# =========================================================================
# ROUTES
# =========================================================================
@api_router.get("/")
async def root():
    return {"message": "Sunya API live", "version": "1.0.0"}


# ---------- AUTH ----------
@api_router.post("/auth/signup", response_model=AuthResponse)
async def signup(body: UserSignup):
    existing = await db.users.find_one({"email": body.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = {
        "id": str(uuid.uuid4()),
        "name": body.name.strip(),
        "email": body.email.lower(),
        "password": hash_password(body.password),
        "role": "user",
        "created_at": now_iso(),
    }
    await db.users.insert_one(dict(user))
    token = create_token(user["id"], user["email"], user["role"])
    return AuthResponse(
        token=token,
        user=UserPublic(id=user["id"], name=user["name"], email=user["email"], role=user["role"], created_at=user["created_at"]),
    )


@api_router.post("/auth/login", response_model=AuthResponse)
async def login(body: UserLogin):
    user = await db.users.find_one({"email": body.email.lower()})
    if not user or not verify_password(body.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(user["id"], user["email"], user["role"])
    return AuthResponse(
        token=token,
        user=UserPublic(id=user["id"], name=user["name"], email=user["email"], role=user["role"], created_at=user["created_at"]),
    )


@api_router.get("/auth/me", response_model=UserPublic)
async def me(user: dict = Depends(require_user)):
    return UserPublic(id=user["id"], name=user["name"], email=user["email"], role=user["role"], created_at=user["created_at"])


# ---------- PRODUCTS ----------
@api_router.get("/products", response_model=List[Product])
async def list_products():
    docs = await db.products.find({}, {"_id": 0}).to_list(100)
    return docs


@api_router.get("/products/{slug}", response_model=Product)
async def get_product(slug: str):
    doc = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")
    return doc


# ---------- PROMO ----------
PROMO_CODES = {
    "SUNYA10": 10,
    "WELCOME15": 15,
    "BULK20": 20,
}


@api_router.post("/promo/validate")
async def validate_promo(body: dict):
    code = (body.get("code") or "").strip().upper()
    if code in PROMO_CODES:
        return {"valid": True, "discount_pct": PROMO_CODES[code], "code": code}
    return {"valid": False, "discount_pct": 0}


# ---------- ORDERS ----------
SHIPPING_FLAT = 150  # NPR
FREE_SHIP_THRESHOLD = 3000


@api_router.post("/orders", response_model=Order)
async def create_order(body: OrderCreate, user: Optional[dict] = Depends(get_current_user)):
    if not body.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Recompute unit_price server-side from product catalog (trust no client)
    product_ids = list({it.product_id for it in body.items})
    products_docs = await db.products.find({"id": {"$in": product_ids}}, {"_id": 0}).to_list(100)
    by_id = {p["id"]: p for p in products_docs}
    validated_items = []
    for it in body.items:
        prod = by_id.get(it.product_id)
        if not prod:
            raise HTTPException(status_code=400, detail=f"Unknown product: {it.product_id}")
        tier = next((g for g in prod["gram_pricing"] if g["grams"] == it.selected_grams), None)
        if not tier:
            raise HTTPException(status_code=400, detail=f"Invalid pouch size for {prod['name']}")
        validated_items.append({
            "product_id": it.product_id,
            "name": prod["name"],
            "selected_grams": it.selected_grams,
            "quantity": max(1, int(it.quantity)),
            "unit_price": int(tier["price"]),
            "image": prod.get("image"),
        })

    subtotal = sum(it["unit_price"] * it["quantity"] for it in validated_items)
    discount_pct = PROMO_CODES.get((body.promo_code or "").strip().upper(), 0)
    discount = int(subtotal * discount_pct / 100)
    shipping = 0 if (subtotal - discount) >= FREE_SHIP_THRESHOLD else SHIPPING_FLAT
    total = subtotal - discount + shipping

    order = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"] if user else None,
        "user_email": user["email"] if user else None,
        "items": validated_items,
        "subtotal": subtotal,
        "discount": discount,
        "shipping": shipping,
        "total": total,
        "full_name": body.full_name,
        "phone": body.phone,
        "address": body.address,
        "city": body.city,
        "payment_method": body.payment_method,
        "promo_code": body.promo_code,
        "status": "pending",
        "created_at": now_iso(),
    }
    await db.orders.insert_one(dict(order))
    return order


@api_router.get("/orders", response_model=List[Order])
async def my_orders(user: dict = Depends(require_user)):
    docs = await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return docs


@api_router.get("/admin/orders", response_model=List[Order])
async def all_orders(user: dict = Depends(require_admin)):
    docs = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


@api_router.patch("/admin/orders/{order_id}")
async def update_order_status(order_id: str, body: dict, user: dict = Depends(require_admin)):
    new_status = body.get("status")
    if new_status not in ["pending", "confirmed", "shipped", "delivered", "cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    res = await db.orders.update_one({"id": order_id}, {"$set": {"status": new_status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"ok": True, "status": new_status}


# ---------- CHATBOT ----------
SUNYA_SYSTEM_PROMPT = """You are Sunya Assist — the friendly, knowledgeable customer support assistant for Sunya, a premium dehydrated fruits brand from Nepal.

ABOUT SUNYA:
- Premium dehydrated fruits brand from Nepal
- Zero added sugar, zero preservatives
- Hand-selected, slow-dehydrated for 12-16 hours at low temperatures
- Export-grade quality
- Currency: NPR (Nepalese Rupees)

PRODUCTS (all available in 100g, 200g, 300g, 400g, 500g, 1kg pouches with bulk discounts):
- Dried Kiwi Slices — Tangy, Vitamin C rich (from NPR 600 for 100g)
- Dried Mango Strips — Naturally sweet, Vitamin A rich (from NPR 540 for 100g)
- Dried Pineapple Rings — Bromelain rich, digestion friendly (from NPR 500 for 100g)
- Dried Apple Crisps — Himalayan grown, high fiber (from NPR 460 for 100g)
- Dried Banana Chips — Potassium rich, pre-workout fuel (from NPR 420 for 100g)
- Freeze-Dried Strawberries — Premium, antioxidant rich (from NPR 820 for 100g)

SHIPPING & DELIVERY:
- Free shipping inside Nepal on orders over NPR 3,000
- Flat shipping NPR 150 below threshold
- Delivery within Kathmandu Valley: 1-2 days
- Outside Valley (Nepal): 3-5 days
- Payments: Cash on Delivery, Khalti, eSewa, Bank Transfer

PROMO CODES:
- SUNYA10 (10% off)
- WELCOME15 (15% off for new customers)
- BULK20 (20% off on bulk orders)

CONTACT:
- Email: hello@sunya.com.np
- Phone: +977-1-4567890
- Address: Lazimpat, Kathmandu, Nepal

GUIDELINES:
- Be warm, concise, and helpful
- Always mention NPR currency when discussing prices
- Suggest SUNYA Care personalized panel for nutrition questions
- Never invent products or prices not listed above
- For complex order issues, suggest contacting hello@sunya.com.np
- Keep responses under 120 words unless detail is requested"""


@api_router.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest):
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM not configured")

    # Load conversation history from DB
    history_doc = await db.chat_sessions.find_one({"session_id": body.session_id}, {"_id": 0})

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM lib not available: {e}")

    chat_instance = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=body.session_id,
        system_message=SUNYA_SYSTEM_PROMPT,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    # Build a context-enriched message including last 6 turns for memory
    history_text = ""
    if history_doc and history_doc.get("messages"):
        recent = history_doc["messages"][-10:]
        for m in recent:
            who = "Customer" if m["role"] == "user" else "Sunya Assist"
            history_text += f"\n{who}: {m['content']}"
        history_text = f"\n\n(Recent conversation:{history_text}\n)\n\nCustomer's new message:\n"

    user_msg = UserMessage(text=f"{history_text}{body.message}")
    try:
        reply = await chat_instance.send_message(user_msg)
    except Exception as e:
        logging.error(f"LLM error: {e}")
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)[:200]}")

    # Persist conversation
    new_messages = (history_doc.get("messages") if history_doc else []) or []
    new_messages.append({"role": "user", "content": body.message, "ts": now_iso()})
    new_messages.append({"role": "assistant", "content": reply, "ts": now_iso()})
    await db.chat_sessions.update_one(
        {"session_id": body.session_id},
        {"$set": {"session_id": body.session_id, "messages": new_messages, "updated_at": now_iso()}},
        upsert=True,
    )
    return ChatResponse(session_id=body.session_id, reply=reply)


@api_router.get("/chat/{session_id}")
async def get_chat_history(session_id: str):
    doc = await db.chat_sessions.find_one({"session_id": session_id}, {"_id": 0})
    return doc or {"session_id": session_id, "messages": []}


# ---------- SUNYA CARE ----------
def estimate_calories(p: CareProfileInput) -> int:
    """Mifflin-St Jeor + activity multiplier."""
    if p.gender == "male":
        bmr = 10 * p.weight_kg + 6.25 * p.height_cm - 5 * p.age + 5
    else:
        bmr = 10 * p.weight_kg + 6.25 * p.height_cm - 5 * p.age - 161
    mult = {"sedentary": 1.2, "light": 1.375, "moderate": 1.55, "active": 1.725, "athlete": 1.9}[p.activity_level]
    return int(bmr * mult)


@api_router.post("/care/recommend", response_model=CareRecommendation)
async def care_recommend(profile: CareProfileInput):
    cals = estimate_calories(profile)
    # Macros target: 25% protein, 50% carbs, 25% fats, fiber 14g/1000kcal
    macros = {
        "protein": round(cals * 0.25 / 4),
        "carbs": round(cals * 0.50 / 4),
        "fats": round(cals * 0.25 / 9),
        "fiber": round(cals * 14 / 1000),
    }

    # Rule-based fruit selection (deterministic, no LLM needed for accuracy)
    products = await db.products.find({}, {"_id": 0}).to_list(100)
    by_id = {p["id"]: p for p in products}

    pkg = []
    # Default 2 base picks
    pkg.append({"product_id": "p-mango", "name": by_id["p-mango"]["name"], "grams": 30, "reason": "Daily vitamin A & natural energy"})
    pkg.append({"product_id": "p-apple", "name": by_id["p-apple"]["name"], "grams": 25, "reason": "Fiber for digestion"})

    goals = set(g.lower() for g in profile.goals)
    if "energy" in goals or "muscle" in goals:
        pkg.append({"product_id": "p-banana", "name": by_id["p-banana"]["name"], "grams": 30, "reason": "Potassium & natural sugars for energy"})
    if "immunity" in goals or "skin" in goals:
        pkg.append({"product_id": "p-kiwi", "name": by_id["p-kiwi"]["name"], "grams": 25, "reason": "Vitamin C for immunity & skin"})
    if "digestion" in goals:
        pkg.append({"product_id": "p-pineapple", "name": by_id["p-pineapple"]["name"], "grams": 25, "reason": "Bromelain enzyme aids digestion"})
    if "weight-loss" not in goals:
        pkg.append({"product_id": "p-strawberry", "name": by_id["p-strawberry"]["name"], "grams": 15, "reason": "Antioxidants & vitamin C boost"})

    # Compute nutrition coverage
    total_cal, total_protein, total_carbs, total_fiber, total_fats = 0, 0.0, 0.0, 0.0, 0.0
    for item in pkg:
        n = by_id[item["product_id"]]["nutrition"]
        f = item["grams"] / 100.0
        total_cal += n["calories"] * f
        total_protein += n["protein"] * f
        total_carbs += n["carbs"] * f
        total_fiber += n["fiber"] * f
        total_fats += n["fats"] * f

    coverage = min(100, int((total_fiber / macros["fiber"]) * 100)) if macros["fiber"] > 0 else 0

    # Unsafe foods
    unsafe = []
    conditions = set(c.lower() for c in profile.conditions)
    if "diabetes" in conditions:
        unsafe.append({"name": "Dried Mango Strips (large servings)", "reason": "Higher natural sugar — keep portions ≤ 20g/day"})
        unsafe.append({"name": "Dried Banana Chips (sugared variants)", "reason": "Avoid sugar-coated chips — our brand is naturally sweetened, but moderate intake"})
    if "hypertension" in conditions:
        unsafe.append({"name": "Salted dried fruits", "reason": "Avoid added-salt versions — Sunya products are unsalted"})
    if "gluten-free" in conditions:
        unsafe.append({"name": "Mixed trail blends", "reason": "Some bulk mixes may contain gluten cross-contamination — stick to single-fruit pouches"})
    if "kidney" in conditions:
        unsafe.append({"name": "Dried Banana Chips (large servings)", "reason": "High potassium — limit to 15g/day"})

    # Optional LLM-curated advice (best-effort)
    advice = (
        f"Based on your {profile.activity_level} activity level and goals ({', '.join(profile.goals) or 'general wellness'}), "
        f"this {sum(i['grams'] for i in pkg)}g daily package covers ~{coverage}% of your fiber needs and "
        f"delivers ~{int(total_cal)} kcal. Pair with water and balanced meals for best results."
    )
    if EMERGENT_LLM_KEY:
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage
            llm = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"care-{uuid.uuid4()}",
                system_message="You are a concise nutrition advisor for Sunya, a premium dried-fruits brand. Reply in under 60 words. Never give medical advice.",
            ).with_model("anthropic", "claude-sonnet-4-5-20250929")
            pkg_summary = ", ".join([f"{i['grams']}g {i['name']}" for i in pkg])
            prompt = (
                f"User profile: age {profile.age}, {profile.gender}, {profile.height_cm}cm, {profile.weight_kg}kg, "
                f"{profile.activity_level} activity. Goals: {', '.join(profile.goals)}. Conditions: {', '.join(profile.conditions) or 'none'}. "
                f"Daily package: {pkg_summary}. "
                f"Write ONE warm, friendly paragraph (max 50 words) explaining why this package suits them."
            )
            advice = await llm.send_message(UserMessage(text=prompt))
        except Exception as e:
            logging.warning(f"Care LLM fallback: {e}")

    return CareRecommendation(
        daily_calories=cals,
        macros=macros,
        package=pkg,
        unsafe_foods=unsafe,
        advice=advice,
        coverage_pct=coverage,
    )


# =========================================================================
# APP SETUP
# =========================================================================
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def on_startup():
    await seed_database()
    logger.info("Sunya API started")


@app.on_event("shutdown")
async def on_shutdown():
    client.close()
