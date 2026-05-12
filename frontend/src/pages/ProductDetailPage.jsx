import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowLeft, Plus, Minus, Truck, Leaf, Shield } from "lucide-react";
import { api, formatNPR, formatGrams } from "@/lib/api";
import GramSelector from "@/components/GramSelector";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grams, setGrams] = useState(500);
  const [price, setPrice] = useState(0);
  const [qty, setQty] = useState(1);
  const { add } = useCart();

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

  const onAdd = () => {
    add(product, grams, price, qty);
    toast.success(`${qty} × ${formatGrams(grams)} ${product.name} added`);
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
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            {product.badge && (
              <span className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-sunya-gold text-sunya-ink text-xs uppercase tracking-widest font-bold">
                {product.badge}
              </span>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
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

            <div className="flex items-baseline gap-3 pb-2">
              <span className="font-serif-display text-4xl font-bold text-sunya-ink" data-testid="product-price">
                {formatNPR(price)}
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
              <button
                onClick={onAdd}
                className="flex-1 py-3.5 rounded-full bg-sunya-green text-white font-semibold shimmer-btn hover:bg-sunya-green-dark transition"
                data-testid="add-to-cart-btn"
              >
                Add to cart · {formatNPR(price * qty)}
              </button>
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
    </div>
  );
};

export default ProductDetailPage;
