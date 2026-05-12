import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Award, Mountain } from "lucide-react";

const HERO_LANDSCAPE =
  "https://images.unsplash.com/photo-1612031326777-1391836af889?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzR8MHwxfHNlYXJjaHwxfHxuZXBhbCUyMGhpbWFsYXlhcyUyMGxhbmRzY2FwZXxlbnwwfHx8fDE3Nzg1NzgzOTF8MA&ixlib=rb-4.1.0&q=85";
const HERO_FRUITS =
  "https://images.unsplash.com/photo-1542562504-963dc9feead5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzJ8MHwxfHNlYXJjaHwxfHxkcmllZCUyMGZydWl0cyUyMGZsYXRsYXl8ZW58MHx8fHwxNzc4NTc4MzkxfDA&ixlib=rb-4.1.0&q=85";

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden" data-testid="hero-section">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-sunya-ivory via-white to-sunya-ivory pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-sunya-green/10 rounded-full blur-3xl animate-pulse-soft pointer-events-none" />
      <div className="absolute top-40 -left-20 w-[400px] h-[400px] bg-sunya-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-12 gap-12 items-center">
        {/* Left content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="lg:col-span-6 space-y-8"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-sunya-green/20 shadow-sm"
          >
            <Mountain className="w-4 h-4 text-sunya-green-dark" />
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-sunya-green-dark">
              From the Himalayas
            </span>
          </motion.div>

          <div>
            <h1 className="font-serif-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95] text-sunya-ink">
              The sweetness of fruit.
              <br />
              <span className="italic text-sunya-green-dark">Nothing else.</span>
            </h1>
            <p className="mt-6 text-lg text-sunya-ink-soft max-w-xl leading-relaxed">
              Hand-selected fruits from the foothills of Nepal — slow-dehydrated for
              <span className="text-sunya-ink font-medium"> 14+ hours</span> at low
              temperatures. Zero added sugar. Zero preservatives. Export-grade.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/products"
              className="shimmer-btn group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-sunya-green text-white font-semibold shadow-lg shadow-sunya-green/30 hover:shadow-xl hover:shadow-sunya-green/40 transition-all"
              data-testid="hero-shop-btn"
            >
              Shop Collection
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/care"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-sunya-ink/15 text-sunya-ink font-medium hover:border-sunya-green-dark hover:text-sunya-green-dark transition"
              data-testid="hero-care-btn"
            >
              Try SUNYA Care
            </Link>
          </div>

          {/* Quality markers */}
          <div className="flex flex-wrap items-center gap-6 pt-4">
            {[
              { icon: <Leaf className="w-4 h-4" />, label: "Zero Sugar" },
              { icon: <Award className="w-4 h-4" />, label: "Export Grade" },
              { icon: <Mountain className="w-4 h-4" />, label: "Himalayan Origin" },
            ].map((b, i) => (
              <motion.div
                key={b.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-2 text-sm text-sunya-ink-soft"
              >
                <span className="w-7 h-7 rounded-full bg-sunya-gold/20 flex items-center justify-center text-sunya-green-dark">
                  {b.icon}
                </span>
                {b.label}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right hero image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
          className="lg:col-span-6 relative"
        >
          <div className="relative h-[420px] md:h-[560px] rounded-[2rem] overflow-hidden shadow-2xl shadow-sunya-ink/20">
            <img src={HERO_FRUITS} alt="Sunya dried fruits flatlay" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-sunya-ink/40 via-transparent to-transparent" />

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-6 left-6 glass rounded-2xl p-4 max-w-[180px]"
            >
              <div className="text-[10px] uppercase tracking-widest text-sunya-green-dark font-bold">
                Slow-dehydrated
              </div>
              <div className="font-serif-display text-2xl font-bold text-sunya-ink mt-1">
                14 hrs
              </div>
              <div className="text-xs text-sunya-ink-soft mt-1">
                preserving every nutrient
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.6 }}
              className="absolute bottom-6 right-6 glass rounded-2xl p-4 max-w-[200px]"
            >
              <div className="text-[10px] uppercase tracking-widest text-sunya-green-dark font-bold">
                Coverage
              </div>
              <div className="font-serif-display text-2xl font-bold text-sunya-ink mt-1">
                +87% nutrients
              </div>
              <div className="text-xs text-sunya-ink-soft mt-1">
                retained vs. air-drying
              </div>
            </motion.div>
          </div>

          {/* Floating landscape thumbnail */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.3 }}
            className="hidden md:block absolute -bottom-10 -left-12 w-56 h-40 rounded-2xl overflow-hidden border-4 border-white shadow-xl"
          >
            <img src={HERO_LANDSCAPE} alt="Himalayan landscape" className="w-full h-full object-cover" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
