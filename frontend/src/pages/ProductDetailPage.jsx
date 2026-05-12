import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowLeft, Plus, Minus, Truck, Leaf, Shield, Flame, Eye, ShoppingBag } from "lucide-react";
import { api, formatNPR, formatGrams } from "@/lib/api";
import GramSelector from "@/components/GramSelector";
import MagneticButton from "@/components/MagneticButton";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { fireConfetti } from "@/lib/confetti";

const stockFor = (id) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return 6 + (Math.abs(h) % 18);
};
const viewersFor = (id) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 13 + id.charCodeAt(i)) | 0;
  return 3 + (Math.abs(h) % 9);
};

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grams, setGrams] = useState(500);
  const [price, setPrice] = useState(0);
  const [qty, setQty] = useState(1);
  const [stickyVisible, setStickyVisible] = useState(false);
  const { add } = useCart();
  const ctaRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/products/${slug}`)
      .then((res) => {
        setProduct(res.data);
        const def = res.data.gram_pricing.find((g) => g.grams === 500) || res.data.gram_pricing[0];
        setGrams(def.grams);
        setPrice(def.price);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    const onScroll = () => {
      if (!ctaRef.current) return;
      const rect = ctaRef.current.getBoundingClientRect();
      setStickyVisible(rect.bottom < 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [product]);

  if (loading) {
    return (
      <div className="pt-32 pb-20 max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-sunya-ivory animate-pulse rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-sunya-ivory animate-pulse rounded" />
            <div className="h-4 bg-sunya-ivory animate-pulse rounded w-2/3" />
            <div className="h-32 bg-sunya-ivory animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-40 pb-20 text-center" data-testid="product-not-found">
        <h2 className="font-serif-display text-3xl font-bold">Product not found</h2>
        <Link to="/products" className="mt-6 inline-block text-sunya-green-dark font-semibold">
          ← Back to products
        </Link>
      </div>
    );
  }

  const stockLeft = stockFor(product.id);
  const viewers = viewersFor(product.id);
  const isLowStock = stockLeft <= 10;
  const base500 = product.gram_pricing.find((g) => g.grams === 500)?.price || 0;
  const fakeOriginal = Math.round(price * 1.15);

  const onAdd = (e) => {
    add(product, grams, price, qty);
    fireConfetti(e);
    toast.success(`${qty} × ${formatGrams(grams)} ${product.name} added 🎉`);
  };

  return (
    <div className="pt-28 pb-20" data-testid="product-detail-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm text-sunya-ink-soft hover:text-sunya-green-dark mb-8"
          data-testid="back-to-products"
        >
          <ArrowLeft className="w-4 h-4" /> All products
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative aspect-square rounded-3xl overflow-hidden bg-sunya-ivory shadow-xl"
          >
            <motion.img
              src={product.image}
              alt={product.name}
              whileHover={{ scale: 1.06 }}
              transition={{ duration: 0.6 }}
              className="w-full h-full object-cover"
            />
            {product.badge && (
              <span className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-sunya-gold text-sunya-ink text-xs uppercase tracking-widest font-bold">
                {product.badge}
              </span>
            )}
            {/* Live viewers */}
            <div className="absolute top-6 right-6 glass rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs">
              <Eye className="w-3 h-3 text-sunya-green-dark" />
              <span className="font-semibold text-sunya-ink">{viewers}</span>
              <span className="text-sunya-ink-soft">viewing now</span>
            </div>
            {isLowStock && (
              <div className="absolute bottom-6 left-6 right-6 glass-dark rounded-2xl px-4 py-3 flex items-center gap-3 text-sm text-white">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold">Only {stockLeft} pouches left in this batch</div>
                  <div className="text-xs text-white/70">Next batch ships in 4–6 weeks</div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
            ref={ctaRef}
          >
            <div>
              <div className="text-xs uppercase tracking-[0.25em] font-semibold text-sunya-green-dark mb-2">
                {product.category}
              </div>
              <h1 className="font-serif-display text-4xl md:text-5xl font-bold text-sunya-ink tracking-tight leading-tight" data-testid="product-name">
                {product.name}
              </h1>
              <p className="mt-4 text-sunya-ink-soft text-lg leading-relaxed">{product.description}</p>
            </div>

            {/* Reviews + scarcity strip */}
            <div className="flex items-center gap-4 flex-wrap text-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-sunya-gold">★★★★★</span>
                <span className="font-semibold text-sunya-ink">4.9</span>
                <span className="text-sunya-ink-soft">· {200 + (stockLeft * 7)} reviews</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-sunya-ink/20" />
              <span className="text-sunya-green-dark font-medium">
                <span className="font-bold">{120 + (stockLeft * 4)}</span> bought this week
              </span>
            </div>

            <div className="flex items-baseline gap-3 pb-2">
              <span className="font-serif-display text-4xl font-bold text-sunya-ink" data-testid="product-price">
                {formatNPR(price)}
              </span>
              <span className="text-lg text-sunya-ink-soft line-through opacity-60">
                {formatNPR(fakeOriginal)}
              </span>
              <span className="text-sm bg-sunya-gold text-sunya-ink rounded-full px-2 py-0.5 font-bold">
                Save {Math.round(((fakeOriginal - price) / fakeOriginal) * 100)}%
              </span>
              <span className="text-sm text-sunya-ink-soft">/ {formatGrams(grams)} pouch</span>
            </div>

            <GramSelector
              product={product}
              selectedGrams={grams}
              onSelect={(g, p) => { setGrams(g); setPrice(p); }}
            />

            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center border border-sunya-ink/10 rounded-full">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-sunya-ivory rounded-l-full transition"
                  data-testid="pdp-qty-dec"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-semibold" data-testid="pdp-qty">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-sunya-ivory rounded-r-full transition"
                  data-testid="pdp-qty-inc"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <MagneticButton
                onClick={onAdd}
                className="flex-1 py-3.5 rounded-full bg-sunya-green text-white font-semibold shimmer-btn hover:bg-sunya-green-dark transition"
                data-testid="add-to-cart-btn"
              >
                Add to cart · {formatNPR(price * qty)}
              </MagneticButton>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-4">
              {[
                { icon: <Truck className="w-4 h-4" />, t: "Free over NPR 3K" },
                { icon: <Leaf className="w-4 h-4" />, t: "Zero sugar" },
                { icon: <Shield className="w-4 h-4" />, t: "Export grade" },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-2xl bg-sunya-ivory">
                  <span className="w-7 h-7 rounded-full bg-white text-sunya-green-dark flex items-center justify-center">{b.icon}</span>
                  <span className="text-xs text-sunya-ink-soft">{b.t}</span>
                </div>
              ))}
            </div>

            {/* Features list */}
            <div className="pt-6 border-t border-sunya-ink/5">
              <h3 className="font-serif-display text-xl font-bold mb-3">Highlights</h3>
              <ul className="space-y-2">
                {product.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-sunya-ink-soft">
                    <Check className="w-4 h-4 text-sunya-green-dark mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Long description & nutrition */}
        <div className="mt-20 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="text-xs uppercase tracking-widest text-sunya-green-dark font-semibold">The Story</div>
            <h2 className="font-serif-display text-3xl font-bold text-sunya-ink">Made with patience</h2>
            <p className="text-sunya-ink-soft leading-relaxed">{product.long_description}</p>
          </div>
          <div className="bg-white rounded-3xl p-8 border border-sunya-ink/5">
            <div className="text-xs uppercase tracking-widest text-sunya-green-dark font-semibold mb-2">Nutrition (per 100g)</div>
            <h3 className="font-serif-display text-2xl font-bold mb-4">Pure goodness</h3>
            <ul className="space-y-3 text-sm">
              {Object.entries(product.nutrition).map(([k, v]) => (
                <li key={k} className="flex justify-between border-b border-sunya-ink/5 pb-2">
                  <span className="capitalize text-sunya-ink-soft">{k.replace("_", " ")}</span>
                  <span className="font-semibold text-sunya-ink">
                    {v}
                    {k === "calories" ? " kcal" : k === "vit_c" ? "mg" : "g"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Sticky add-to-cart bar */}
      <AnimatePresence>
        {stickyVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 22 }}
            className="fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-sunya-ink/10 shadow-2xl px-4 sm:px-6 py-3"
            data-testid="sticky-add-to-cart"
          >
            <div className="max-w-5xl mx-auto flex items-center gap-3">
              <img src={product.image} alt="" className="w-12 h-12 rounded-xl object-cover hidden sm:block" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sunya-ink truncate text-sm">{product.name}</div>
                <div className="text-xs text-sunya-ink-soft">
                  {formatGrams(grams)} · <span className="font-bold text-sunya-ink">{formatNPR(price * qty)}</span>
                </div>
              </div>
              <button
                onClick={onAdd}
                className="px-5 py-3 rounded-full bg-sunya-green text-white font-semibold text-sm hover:bg-sunya-green-dark transition flex items-center gap-2 shimmer-btn"
                data-testid="sticky-add-btn"
              >
                <ShoppingBag className="w-4 h-4" /> Add to cart
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetailPage;
