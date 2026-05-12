import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, Flame } from "lucide-react";
import { api, formatNPR } from "@/lib/api";

// Deterministic pseudo-random "stock left" derived from product id
// (creates urgency without lying about specifics)
const stockFor = (id) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return 6 + (Math.abs(h) % 18); // 6..23
};
const trendingFor = (id) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 17 + id.charCodeAt(i)) | 0;
  return Math.abs(h) % 4 === 0; // ~25% products tagged trending
};

const ProductCard = ({ p, i }) => {
  const minPrice = p.gram_pricing?.[0]?.price ?? 0;
  const fullPrice = p.gram_pricing?.find((g) => g.grams === 500)?.price ?? 0;
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const stockLeft = stockFor(p.id);
  const isTrending = trendingFor(p.id);
  const isLowStock = stockLeft <= 10;

  const onMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
    setTilt({ x: -y, y: x });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: i * 0.05 }}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{ perspective: 1000 }}
      className="group relative"
      data-testid={`product-card-${p.slug}`}
    >
      <motion.div
        animate={{ rotateX: tilt.x, rotateY: tilt.y, y: tilt.x !== 0 || tilt.y !== 0 ? -6 : 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 18 }}
        style={{ transformStyle: "preserve-3d" }}
        className="bg-white rounded-3xl overflow-hidden border border-sunya-ink/5 shadow-sm hover:shadow-2xl hover:shadow-sunya-ink/10 transition-shadow duration-500"
      >
        <Link to={`/products/${p.slug}`} className="block">
          <div className="relative aspect-square overflow-hidden bg-sunya-ivory">
            <img
              src={p.image}
              alt={p.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            {/* Badges row */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {p.badge && (
                <span className="px-3 py-1 rounded-full bg-sunya-gold text-sunya-ink text-[10px] uppercase tracking-widest font-bold shadow">
                  {p.badge}
                </span>
              )}
              {isTrending && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] uppercase tracking-widest font-bold shadow animate-pulse-soft">
                  <Flame className="w-3 h-3" /> Trending
                </span>
              )}
            </div>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 12 }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center group-hover:bg-sunya-green group-hover:text-white text-sunya-ink transition shadow"
            >
              <ArrowUpRight className="w-4 h-4" />
            </motion.div>

            {/* Low stock urgency */}
            {isLowStock && (
              <div className="absolute bottom-3 left-3 right-3 glass-dark rounded-full px-3 py-1.5 flex items-center justify-between text-[10px] text-white">
                <span className="font-semibold">Only {stockLeft} left in batch</span>
                <span className="text-sunya-gold">Hurry</span>
              </div>
            )}
          </div>
          <div className="p-6 space-y-2">
            <div className="text-[10px] uppercase tracking-widest font-semibold text-sunya-green-dark">
              {p.category}
            </div>
            <h3 className="font-serif-display text-xl font-bold text-sunya-ink leading-snug">
              {p.name}
            </h3>
            <p className="text-sm text-sunya-ink-soft line-clamp-2">{p.description}</p>
            <div className="flex items-baseline justify-between pt-3 border-t border-sunya-ink/5">
              <div>
                <div className="text-[10px] text-sunya-ink-soft uppercase tracking-wider">From</div>
                <div className="font-serif-display text-2xl font-bold text-sunya-ink">
                  {formatNPR(minPrice)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-sunya-ink-soft">500g</div>
                <div className="text-xs text-sunya-ink-soft line-through opacity-60">
                  {formatNPR(Math.round(fullPrice * 1.15))}
                </div>
                <div className="text-xs text-sunya-green-dark font-bold">
                  {formatNPR(fullPrice)}
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
};

const ProductShowcase = ({ limit, title = "Our Collection", subtitle = "Hand-crafted in small batches" }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/products")
      .then((res) => setProducts(limit ? res.data.slice(0, limit) : res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [limit]);

  return (
    <section className="py-24 md:py-32 relative" data-testid="product-showcase">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] font-semibold text-sunya-green-dark mb-3">
              {subtitle}
            </div>
            <h2 className="font-serif-display text-4xl md:text-5xl font-bold text-sunya-ink tracking-tight leading-tight">
              {title}
            </h2>
          </div>
          {title && (
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sunya-ink hover:text-sunya-green-dark text-sm font-semibold group"
              data-testid="view-all-products-link"
            >
              View all products
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[4/5] bg-white/50 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p, i) => (
              <ProductCard p={p} i={i} key={p.id} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductShowcase;
