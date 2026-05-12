import React from "react";
import { motion } from "framer-motion";
import { formatNPR, formatGrams } from "@/lib/api";

const GramSelector = ({ product, selectedGrams, onSelect }) => {
  if (!product?.gram_pricing) return null;
  const base = product.gram_pricing.find((g) => g.grams === 500);

  return (
    <div className="space-y-4" data-testid="gram-selector">
      <div className="text-xs uppercase tracking-[0.2em] font-semibold text-sunya-green-dark">
        Choose pouch size
      </div>
      <div className="grid grid-cols-3 gap-2">
        {product.gram_pricing.map((g) => {
          const active = g.grams === selectedGrams;
          const savings =
            base && g.grams >= 500
              ? Math.round(((base.pricePerGram - g.pricePerGram) / base.pricePerGram) * 100)
              : 0;
          return (
            <motion.button
              key={g.grams}
              whileHover={{ scale: active ? 1 : 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(g.grams, g.price)}
              className={`relative px-3 py-3 rounded-2xl text-center transition-all ${
                active
                  ? "bg-sunya-green text-white shadow-lg shadow-sunya-green/30"
                  : "bg-white border border-sunya-ink/10 text-sunya-ink hover:border-sunya-green-dark"
              }`}
              data-testid={`gram-option-${g.grams}`}
            >
              <div className={`font-serif-display text-lg font-bold leading-none ${active ? "text-white" : "text-sunya-ink"}`}>
                {formatGrams(g.grams)}
              </div>
              <div className={`text-xs mt-1 ${active ? "text-white/85" : "text-sunya-ink-soft"}`}>
                {formatNPR(g.price)}
              </div>
              {savings >= 5 && !active && (
                <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-sunya-gold text-sunya-ink text-[9px] font-bold">
                  −{savings}%
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-sm pt-3 border-t border-sunya-ink/5">
        <span className="text-sunya-ink-soft">Price per gram</span>
        <span className="font-semibold text-sunya-ink">
          {formatNPR(product.gram_pricing.find((g) => g.grams === selectedGrams)?.pricePerGram ?? 0)}/g
        </span>
      </div>
    </div>
  );
};

export default GramSelector;
