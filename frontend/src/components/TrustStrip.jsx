import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Truck, RotateCcw, Lock } from "lucide-react";

const ITEMS = [
  { icon: <Truck className="w-5 h-5" />, title: "Free delivery", sub: "Orders over NPR 3,000" },
  { icon: <RotateCcw className="w-5 h-5" />, title: "7-day returns", sub: "Unopened pouches" },
  { icon: <ShieldCheck className="w-5 h-5" />, title: "Quality promise", sub: "Or money back" },
  { icon: <Lock className="w-5 h-5" />, title: "Secure checkout", sub: "Khalti · eSewa · COD" },
];

const TrustStrip = () => {
  return (
    <section className="py-8 bg-sunya-ivory" data-testid="trust-strip">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-6">
        {ITEMS.map((it, i) => (
          <motion.div
            key={it.title}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3"
            data-testid={`trust-item-${i}`}
          >
            <div className="w-11 h-11 rounded-full bg-white border border-sunya-ink/5 flex items-center justify-center text-sunya-green-dark shrink-0">
              {it.icon}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-sunya-ink truncate">{it.title}</div>
              <div className="text-xs text-sunya-ink-soft">{it.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TrustStrip;
