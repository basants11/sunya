import React from "react";
import Hero from "@/components/Hero";
import ProductShowcase from "@/components/ProductShowcase";
import QualityBadges from "@/components/QualityBadges";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

const HomePage = () => {
  return (
    <div data-testid="home-page">
      <Hero />
      <ProductShowcase limit={6} title="Hand-crafted favorites" subtitle="Our Bestsellers" />
      <QualityBadges />

      {/* SUNYA Care promo strip */}
      <section className="py-24 md:py-32" data-testid="care-promo-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-sunya-ink to-[#1a1a1a] text-white p-10 md:p-16"
          >
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-sunya-green/30 rounded-full blur-3xl animate-pulse-soft" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-sunya-gold/20 rounded-full blur-3xl" />
            <div className="relative grid md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-5">
                  <Sparkles className="w-3.5 h-3.5 text-sunya-gold" />
                  <span className="text-xs uppercase tracking-widest font-semibold">AI Nutrition</span>
                </div>
                <h2 className="font-serif-display text-4xl md:text-5xl font-bold leading-tight">
                  Meet <span className="italic text-sunya-gold">SUNYA Care</span> — your personal fruit nutritionist.
                </h2>
                <p className="mt-5 text-white/70 text-lg max-w-md">
                  Tell us about your goals, and we'll curate a daily fruit package matched to your body, lifestyle, and health conditions.
                </p>
                <Link
                  to="/care"
                  className="mt-8 inline-flex items-center gap-2 px-7 py-4 rounded-full bg-sunya-gold text-sunya-ink font-semibold shimmer-btn hover:bg-white transition"
                  data-testid="care-promo-cta"
                >
                  Start your nutrition plan <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="hidden md:grid grid-cols-2 gap-4">
                {[
                  { label: "Daily calories", value: "1,840", sub: "personalized" },
                  { label: "Protein target", value: "115g", sub: "based on weight" },
                  { label: "Fiber boost", value: "+34%", sub: "from fruit pack" },
                  { label: "Coverage", value: "87%", sub: "of fiber needs" },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur">
                    <div className="text-xs text-white/50 uppercase tracking-wider">{s.label}</div>
                    <div className="font-serif-display text-3xl font-bold mt-2">{s.value}</div>
                    <div className="text-xs text-white/60 mt-1">{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Story strip */}
      <section className="py-16 bg-white border-y border-sunya-ink/5 overflow-hidden">
        <div className="flex marquee gap-12 whitespace-nowrap text-sunya-ink-soft">
          {Array(2).fill(0).map((_, i) => (
            <div key={i} className="flex gap-12 items-center text-2xl md:text-3xl font-serif-display italic">
              <span>· Zero Sugar</span>
              <span>· Slow Dehydrated</span>
              <span>· Himalayan Grown</span>
              <span>· Export Grade</span>
              <span>· Zero Preservatives</span>
              <span>· Hand Selected</span>
              <span>· Small Batch</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
