# Sunya — Product Requirements (PRD)

## Original Problem Statement
Build Sunya — Premium dehydrated fruits e-commerce website (Nepal, NPR currency). Source: `https://github.com/basants11/sunya.git` (markdown docs only, no source code) + user said "Do all and use best model".

## Tagline
"Premium dehydrated fruits with zero sugar, zero preservatives. Hand-selected, slow-dehydrated, export-grade quality from Nepal."

## User Personas
- **Wellness shopper** — health-conscious, wants nutrition info, values "no added sugar"
- **Bulk buyer / gifter** — buys 500g/1kg pouches, expects bulk savings
- **Personalized seeker** — uses SUNYA Care to get a tailored daily fruit plan
- **Admin/operator** — manages orders, updates statuses

## Tech Stack
- **Frontend**: React (CRA via craco), Tailwind CSS, Framer Motion, shadcn/ui, react-router-dom, sonner
- **Backend**: FastAPI, MongoDB (motor), JWT auth, bcrypt
- **AI**: Claude Sonnet 4.5 via `emergentintegrations` with Emergent LLM Key (chatbot + SUNYA Care advice paragraph)
- **Fonts**: Playfair Display (headings) + Outfit (body)
- **Palette**: deep green #00C950 / #00A040, gold #FFD700, ivory #FAF9F6, ink #333

## Implemented (2026-05-12)
- Landing page (Hero, ProductShowcase, QualityBadges, Care promo, Footer w/ newsletter)
- Product catalog page + Product detail page with gram-based pricing (100/200/300/400/500/1000g, tiered, bulk savings indicator)
- Shopping cart drawer (client-side localStorage, qty +/-, remove, free shipping threshold)
- Checkout page (delivery details, payment methods: COD/Khalti/eSewa/Bank, promo code apply, server-side price validation)
- Order success page
- JWT auth (signup/login/me), AuthModal (login/signup switch, demo creds shown)
- Admin dashboard (stats: orders/revenue/pending/avg, orders table with status select dropdown)
- Account page (user order history with statuses)
- SUNYA Care: multi-step form (about-you, goals, conditions) → POST /api/care/recommend → results panel with daily calories, macro rings, daily fruit package, unsafe foods warnings, LLM-curated advice
- Floating AI chatbot (bottom-right, glass UI, Claude Sonnet 4.5, multi-turn memory in Mongo)
- Newsletter signup (toast confirm)
- Responsive design + framer-motion animations + shimmer CTAs + glass-morphism

## Testing Status
- **Backend**: 21/21 pytest pass (auth, products, promo, orders, admin orders, chat multi-turn, care/recommend)
- **Frontend**: All flows verified e2e (auth, PDP gram pricing, add to cart, checkout w/ WELCOME15 promo, SUNYA Care w/ diabetes warning, admin order status update, Claude chat multi-turn memory)

## Seed Data
- 6 products (kiwi, mango, pineapple, apple, banana, freeze-dried strawberry)
- Admin: `admin@sunya.com.np / Admin@Sunya2026`
- Demo: `demo@sunya.com.np / Demo@Sunya2026`
- Promo codes: SUNYA10 (10%), WELCOME15 (15%), BULK20 (20%)

## Prioritized Backlog (P1/P2)
- P1: Real payment gateway integration (Khalti / eSewa / Stripe) — currently mocked
- P1: Email notifications on order placement & status change (Resend/SendGrid)
- P1: PDF export of SUNYA Care plan (download)
- P2: Wishlist + saved addresses
- P2: Customer reviews & ratings on PDP
- P2: Inventory tracking + low-stock alerts
- P2: Subscription orders (weekly/monthly fruit box)
- P2: Multi-language (Nepali / English toggle)
- P2: Google OAuth (Emergent-managed) sign-in
- P3: Mobile React Native app

## Code Quality Suggestions (from review)
- Consider splitting `server.py` (~700 lines) into routers/ modules
- Move PROMO_CODES & shipping constants to a config module
- Done: server-side unit_price validation in /api/orders
- Done: dead code removed in /api/chat
