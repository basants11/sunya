import React from "react";
import { motion } from "framer-motion";
import { Leaf, Shield, Award, Sparkles, Mountain, HeartPulse } from "lucide-react";

const items = [
  { icon: <Leaf className="w-7 h-7" />, title: "Zero Added Sugar", desc: "Naturally sweet — period." },
  { icon: <Shield className="w-7 h-7" />, title: "No Preservatives", desc: "Just fruit. Just air. Just patience." },
  { icon: <Mountain className="w-7 h-7" />, title: "Himalayan Grown", desc: "From small farms in Nepal." },
  { icon: <Award className="w-7 h-7" />, title: "Export Grade", desc: "Quality you can taste." },
  { icon: <HeartPulse className="w-7 h-7" />, title: "Nutrient Dense", desc: "Low-temp drying preserves 87% of nutrients." },
  { icon: <Sparkles className="w-7 h-7" />, title: "Slow-Dehydrated", desc: "14+ hours of patience per batch." },
];

const QualityBadges = () => {
  return (
    <section className="py-24 bg-white border-y border-sunya-ink/5" data-testid="quality-badges">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs uppercase tracking-[0.25em] font-semibold text-sunya-green-dark mb-3">
            Why Sunya
          </div>
          <h2 className="font-serif-display text-4xl md:text-5xl font-bold text-sunya-ink tracking-tight">
            Promises kept, not printed
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="flex flex-col items-center text-center md:items-start md:text-left gap-3 p-4 md:p-0"
              data-testid={`quality-badge-${i}`}
            >
              <div className="w-14 h-14 rounded-2xl bg-sunya-gold/20 text-sunya-green-dark flex items-center justify-center">
                {it.icon}
              </div>
              <h3 className="font-serif-display text-lg font-bold text-sunya-ink">{it.title}</h3>
              <p className="text-sm text-sunya-ink-soft">{it.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QualityBadges;
