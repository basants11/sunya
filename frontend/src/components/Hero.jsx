import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Award, Mountain, Sparkles } from "lucide-react";
import MagneticButton from "@/components/MagneticButton";

const HERO_LANDSCAPE =
  "https://images.unsplash.com/photo-1612031326777-1391836af889?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzR8MHwxfHNlYXJjaHwxfHxuZXBhbCUyMGhpbWFsYXlhcyUyMGxhbmRzY2FwZXxlbnwwfHx8fDE3Nzg1NzgzOTF8MA&ixlib=rb-4.1.0&q=85";
const HERO_FRUITS =
  "https://images.unsplash.com/photo-1542562504-963dc9feead5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzJ8MHwxfHNlYXJjaHwxfHxkcmllZCUyMGZydWl0cyUyMGZsYXRsYXl8ZW58MHx8fHwxNzc4NTc4MzkxfDA&ixlib=rb-4.1.0&q=85";

const Hero = () => {
  const heroRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const onMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 18;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 18;
    setTilt({ x: -y, y: x });
  };
  const onMouseLeave = () => setTilt({ x: 0, y: 0 });

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
          {/* Live status pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-sunya-green/20 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-sunya-green opacity-60 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sunya-green" />
            </span>
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-sunya-green-dark">
              New batch · fresh from Nepal
            </span>
          </motion.div>

          <div>
            <h1 className="font-serif-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95] text-sunya-ink">
              The sweetness of fruit.
              <br />
              <span className="italic text-sunya-green-dark relative inline-block">
                Nothing else.
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }}
                  className="absolute -bottom-1 left-0 h-[3px] bg-sunya-gold/60 rounded-full origin-left"
                />
              </span>
            </h1>
            <p className="mt-6 text-lg text-sunya-ink-soft max-w-xl leading-relaxed">
              Hand-selected fruits from the foothills of Nepal — slow-dehydrated for
              <span className="text-sunya-ink font-medium"> 14+ hours</span> at low
              temperatures. Zero added sugar. Zero preservatives. Export-grade.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link to="/products" data-testid="hero-shop-btn">
              <MagneticButton
                className="shimmer-btn group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-sunya-green text-white font-semibold shadow-lg shadow-sunya-green/30 hover:shadow-xl hover:shadow-sunya-green/40 transition-all"
              >
                Shop Collection <ArrowRight className="w-4 h-4" />
              </MagneticButton>
            </Link>
            <Link
              to="/care"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-sunya-ink/15 text-sunya-ink font-medium hover:border-sunya-green-dark hover:text-sunya-green-dark transition group"
              data-testid="hero-care-btn"
            >
              <Sparkles className="w-4 h-4 group-hover:text-sunya-gold transition-colors" />
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
                whileHover={{ y: -2 }}
                className="flex items-center gap-2 text-sm text-sunya-ink-soft cursor-default"
              >
                <span className="w-7 h-7 rounded-full bg-sunya-gold/20 flex items-center justify-center text-sunya-green-dark">
                  {b.icon}
                </span>
                {b.label}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right hero image with mouse tilt */}
        <motion.div
          ref={heroRef}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
          className="lg:col-span-6 relative"
          style={{ perspective: 1000 }}
        >
          <motion.div
            animate={{ rotateX: tilt.x, rotateY: tilt.y }}
            transition={{ type: "spring", stiffness: 60, damping: 18 }}
            style={{ transformStyle: "preserve-3d" }}
            className="relative h-[420px] md:h-[560px] rounded-[2rem] overflow-hidden shadow-2xl shadow-sunya-ink/20"
          >
            <img src={HERO_FRUITS} alt="Sunya dried fruits flatlay" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-sunya-ink/40 via-transparent to-transparent" />

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              style={{ transform: "translateZ(40px)" }}
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
              style={{ transform: "translateZ(40px)" }}
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

            {/* Trust mini pill */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 1 }}
              style={{ transform: "translateZ(60px)" }}
              className="absolute top-1/2 -right-3 glass rounded-full px-3 py-1.5 flex items-center gap-1.5"
            >
              <span className="text-[10px] font-bold text-sunya-gold">★ 4.9</span>
              <span className="text-[9px] text-sunya-ink-soft">12k reviews</span>
            </motion.div>
          </motion.div>

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
