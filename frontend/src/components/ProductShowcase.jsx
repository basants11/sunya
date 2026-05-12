import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { api, formatNPR } from "@/lib/api";

const ProductCard = ({ p, i }) => {
  const minPrice = p.gram_pricing?.[0]?.price ?? 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: i * 0.05 }}
      whileHover={{ y: -8 }}
      className="group relative bg-white rounded-3xl overflow-hidden border border-sunya-ink/5 shadow-sm hover:shadow-2xl hover:shadow-sunya-ink/10 transition-all duration-500"
      data-testid={`product-card-${p.slug}`}
    >
      <Link to={`/products/${p.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-sunya-ivory">
          <img
            src={p.image}
            alt={p.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          {p.badge && (
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-sunya-gold text-sunya-ink text-[10px] uppercase tracking-widest font-bold">
              {p.badge}
            </span>
          )}
          <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center group-hover:bg-sunya-green group-hover:text-white text-sunya-ink transition">
            <ArrowUpRight className="w-4 h-4" />
          </div>
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
            <div className="text-xs text-sunya-ink-soft">100g · 1kg</div>
          </div>
        </div>
      </Link>
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
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sunya-ink hover:text-sunya-green-dark text-sm font-semibold group"
            data-testid="view-all-products-link"
          >
            View all products
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
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
