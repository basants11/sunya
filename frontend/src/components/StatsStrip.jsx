import React from "react";
import { motion } from "framer-motion";
import CountUp from "@/components/CountUp";

const StatsStrip = () => {
  const stats = [
    { value: 12847, suffix: "+", label: "Happy customers" },
    { value: 4.9, label: "★ rating", isFloat: true },
    { value: 87, suffix: "%", label: "Nutrients retained" },
    { value: 14, suffix: "h+", label: "Slow-dehydrated" },
  ];
  return (
    <section className="py-12 md:py-16 bg-white border-y border-sunya-ink/5" data-testid="stats-strip">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="text-center md:border-r md:border-sunya-ink/5 md:last:border-r-0 px-2"
            data-testid={`stat-strip-${i}`}
          >
            <div className="font-serif-display text-4xl md:text-5xl font-bold text-sunya-ink tracking-tight tabular-nums">
              {s.isFloat ? (
                <>
                  4.<CountUp to={9} duration={1.4} />
                </>
              ) : (
                <CountUp to={s.value} duration={1.6} suffix={s.suffix || ""} />
              )}
            </div>
            <div className="text-xs uppercase tracking-widest text-sunya-ink-soft font-semibold mt-2">
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default StatsStrip;
