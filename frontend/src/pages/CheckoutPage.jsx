import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Tag, Check, CreditCard, Truck, Wallet } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { api, formatNPR, formatGrams } from "@/lib/api";
import { toast } from "sonner";

const CheckoutPage = () => {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Kathmandu");
  const [payment, setPayment] = useState("cod");
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState({ code: null, discount_pct: 0 });
  const [submitting, setSubmitting] = useState(false);

  const discount = Math.round(subtotal * promo.discount_pct / 100);
  const shipping = (subtotal - discount) >= 3000 ? 0 : 150;
  const total = subtotal - discount + shipping;

  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    try {
      const res = await api.post("/promo/validate", { code: promoInput });
      if (res.data.valid) {
        setPromo(res.data);
        toast.success(`Promo applied: ${res.data.discount_pct}% off`);
      } else {
        toast.error("Invalid promo code");
      }
    } catch {
      toast.error("Could not validate promo");
    }
  };

  const placeOrder = async () => {
    if (!fullName || !phone || !address) {
      toast.error("Please fill all required fields");
      return;
    }
    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post("/orders", {
        items,
        full_name: fullName,
        phone,
        address,
        city,
        payment_method: payment,
        promo_code: promo.code,
      });
      clear();
      toast.success("Order placed! 🎉");
      navigate(`/order-success/${res.data.id}`);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Order failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-40 pb-20 text-center" data-testid="checkout-empty">
        <h2 className="font-serif-display text-3xl font-bold">Your cart is empty</h2>
        <button
          onClick={() => navigate("/products")}
          className="mt-6 px-6 py-3 rounded-full bg-sunya-green text-white font-semibold shimmer-btn"
        >
          Shop products
        </button>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20" data-testid="checkout-page">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-[0.25em] font-semibold text-sunya-green-dark mb-3">
            Final step
          </div>
          <h1 className="font-serif-display text-4xl md:text-5xl font-bold text-sunya-ink tracking-tight">
            Checkout
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white rounded-3xl p-8 space-y-6 border border-sunya-ink/5"
          >
            <div>
              <h3 className="font-serif-display text-2xl font-bold mb-1">Delivery details</h3>
              <p className="text-sm text-sunya-ink-soft">We'll deliver to your doorstep across Nepal.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <input type="text" required placeholder="Full name *" value={fullName} onChange={(e) => setFullName(e.target.value)} className="px-4 py-3 rounded-2xl bg-sunya-ivory border border-sunya-ink/10 outline-none focus:border-sunya-green-dark" data-testid="checkout-name-input" />
              <input type="tel" required placeholder="Phone number *" value={phone} onChange={(e) => setPhone(e.target.value)} className="px-4 py-3 rounded-2xl bg-sunya-ivory border border-sunya-ink/10 outline-none focus:border-sunya-green-dark" data-testid="checkout-phone-input" />
              <input type="text" required placeholder="Street address *" value={address} onChange={(e) => setAddress(e.target.value)} className="sm:col-span-2 px-4 py-3 rounded-2xl bg-sunya-ivory border border-sunya-ink/10 outline-none focus:border-sunya-green-dark" data-testid="checkout-address-input" />
              <input type="text" required placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="sm:col-span-2 px-4 py-3 rounded-2xl bg-sunya-ivory border border-sunya-ink/10 outline-none focus:border-sunya-green-dark" data-testid="checkout-city-input" />
            </div>

            <div className="pt-4">
              <h3 className="font-serif-display text-2xl font-bold mb-3">Payment method</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { v: "cod", t: "Cash on Delivery", i: <Truck className="w-4 h-4" />, d: "Pay when your package arrives" },
                  { v: "khalti", t: "Khalti", i: <Wallet className="w-4 h-4" />, d: "Digital wallet (Nepal)" },
                  { v: "esewa", t: "eSewa", i: <Wallet className="w-4 h-4" />, d: "Digital wallet (Nepal)" },
                  { v: "bank", t: "Bank Transfer", i: <CreditCard className="w-4 h-4" />, d: "Direct bank deposit" },
                ].map((p) => (
                  <button
                    key={p.v}
                    onClick={() => setPayment(p.v)}
                    className={`text-left p-4 rounded-2xl border-2 transition ${
                      payment === p.v
                        ? "border-sunya-green-dark bg-sunya-green/5"
                        : "border-sunya-ink/10 bg-sunya-ivory hover:border-sunya-green-dark/30"
                    }`}
                    data-testid={`payment-method-${p.v}`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-sunya-ink">
                      <span className="w-7 h-7 rounded-full bg-sunya-green/10 text-sunya-green-dark flex items-center justify-center">{p.i}</span>
                      {p.t}
                      {payment === p.v && <Check className="w-4 h-4 text-sunya-green-dark ml-auto" />}
                    </div>
                    <div className="text-xs text-sunya-ink-soft mt-1">{p.d}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-sunya-ink text-white rounded-3xl p-8 h-fit sticky top-28"
          >
            <h3 className="font-serif-display text-2xl font-bold mb-5">Order summary</h3>
            <div className="space-y-3 max-h-72 overflow-y-auto no-scrollbar pr-2 mb-5">
              {items.map((it) => (
                <div key={`${it.product_id}-${it.selected_grams}`} className="flex items-start gap-3 text-sm">
                  <img src={it.image} alt={it.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{it.name}</div>
                    <div className="text-xs text-white/60">{formatGrams(it.selected_grams)} × {it.quantity}</div>
                  </div>
                  <div className="font-semibold text-sm">{formatNPR(it.unit_price * it.quantity)}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-5">
              <input
                type="text"
                placeholder="Promo code"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2.5 rounded-full bg-white/10 text-white placeholder:text-white/40 outline-none border border-white/15 text-sm"
                data-testid="promo-input"
              />
              <button onClick={applyPromo} className="px-4 py-2.5 rounded-full bg-sunya-gold text-sunya-ink text-sm font-semibold hover:bg-white transition" data-testid="apply-promo-btn">
                Apply
              </button>
            </div>
            {promo.code && (
              <div className="flex items-center gap-2 mb-4 text-sm text-sunya-gold">
                <Tag className="w-4 h-4" /> {promo.code} − {promo.discount_pct}% off applied
              </div>
            )}

            <div className="space-y-2 text-sm border-t border-white/10 pt-4">
              <div className="flex justify-between text-white/70"><span>Subtotal</span><span data-testid="summary-subtotal">{formatNPR(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-sunya-gold"><span>Discount</span><span>−{formatNPR(discount)}</span></div>}
              <div className="flex justify-between text-white/70"><span>Shipping</span><span>{shipping === 0 ? "Free" : formatNPR(shipping)}</span></div>
              <div className="flex justify-between font-bold pt-2 text-lg border-t border-white/10 mt-2">
                <span>Total</span><span className="font-serif-display" data-testid="summary-total">{formatNPR(total)}</span>
              </div>
            </div>

            <button
              onClick={placeOrder}
              disabled={submitting}
              className="w-full mt-6 py-4 rounded-full bg-sunya-green text-white font-semibold shimmer-btn disabled:opacity-60 hover:bg-sunya-green-dark transition"
              data-testid="place-order-btn"
            >
              {submitting ? "Placing order..." : "Place order"}
            </button>
            <p className="text-[10px] text-white/40 text-center mt-3">
              By placing this order you agree to Sunya's terms and privacy policy.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
