import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Zap, Shield, Apple, Activity, Heart, Loader2, AlertTriangle, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const GOAL_OPTIONS = [
  { id: "energy", label: "Energy", icon: <Zap className="w-4 h-4" /> },
  { id: "immunity", label: "Immunity", icon: <Shield className="w-4 h-4" /> },
  { id: "weight-loss", label: "Weight loss", icon: <Activity className="w-4 h-4" /> },
  { id: "muscle", label: "Muscle gain", icon: <Sparkles className="w-4 h-4" /> },
  { id: "skin", label: "Skin & hair", icon: <Heart className="w-4 h-4" /> },
  { id: "digestion", label: "Digestion", icon: <Apple className="w-4 h-4" /> },
];

const CONDITION_OPTIONS = ["diabetes", "hypertension", "gluten-free", "kidney"];

const NutritionRing = ({ label, value, max, color }) => {
  const radius = 38;
  const circ = 2 * Math.PI * radius;
  const pct = Math.min(100, (value / max) * 100);
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center" data-testid={`nutrition-ring-${label.toLowerCase()}`}>
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} className="fill-none stroke-sunya-ink/10" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r={radius}
            className="fill-none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif-display text-xl font-bold text-sunya-ink">{value}</span>
          <span className="text-[10px] text-sunya-ink-soft">/ {max}g</span>
        </div>
      </div>
      <div className="text-xs uppercase tracking-wider text-sunya-ink-soft mt-2">{label}</div>
    </div>
  );
};

const CarePage = () => {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    age: 30, gender: "female", height_cm: 165, weight_kg: 65,
    activity_level: "moderate", goals: ["energy"], conditions: [],
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggle = (key, val) => {
    setProfile((p) => ({
      ...p,
      [key]: p[key].includes(val) ? p[key].filter((x) => x !== val) : [...p[key], val],
    }));
  };

  const submit = async () => {
    setLoading(true);
    try {
      const res = await api.post("/care/recommend", profile);
      setResult(res.data);
      setStep(3);
    } catch (e) {
      toast.error("Could not generate plan. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20" data-testid="care-page">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sunya-green/10 text-sunya-green-dark mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-xs uppercase tracking-widest font-semibold">SUNYA Care · AI Nutrition</span>
          </div>
          <h1 className="font-serif-display text-5xl md:text-6xl font-bold text-sunya-ink tracking-tight leading-none">
            Your personal fruit plan
          </h1>
          <p className="mt-5 text-sunya-ink-soft text-lg max-w-xl mx-auto">
            Tell us about you. We'll curate a daily fruit package matched to your body, goals & conditions.
          </p>
        </div>

        {!result && (
          <div className="bg-white rounded-3xl border border-sunya-ink/5 shadow-sm">
            {/* Step indicators */}
            <div className="flex items-center justify-center gap-2 p-6 border-b border-sunya-ink/5">
              {["About you", "Goals", "Conditions"].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${i === step ? "bg-sunya-green text-white" : i < step ? "bg-sunya-green/20 text-sunya-green-dark" : "bg-sunya-ivory text-sunya-ink-soft"}`}>
                    {i + 1}. {s}
                  </div>
                  {i < 2 && <div className="w-6 h-px bg-sunya-ink/10" />}
                </div>
              ))}
            </div>

            <div className="p-8 md:p-10">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <h3 className="font-serif-display text-2xl font-bold">Quick about you</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <label className="space-y-1.5">
                        <span className="text-xs uppercase tracking-wider text-sunya-ink-soft font-semibold">Age</span>
                        <input type="number" min="13" max="100" value={profile.age} onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value || "0") })} className="w-full px-4 py-3 rounded-2xl bg-sunya-ivory border border-sunya-ink/10 outline-none focus:border-sunya-green-dark" data-testid="care-age-input" />
                      </label>
                      <label className="space-y-1.5">
                        <span className="text-xs uppercase tracking-wider text-sunya-ink-soft font-semibold">Gender</span>
                        <select value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })} className="w-full px-4 py-3 rounded-2xl bg-sunya-ivory border border-sunya-ink/10 outline-none focus:border-sunya-green-dark" data-testid="care-gender-select">
                          <option value="female">Female</option>
                          <option value="male">Male</option>
                          <option value="other">Other</option>
                        </select>
                      </label>
                      <label className="space-y-1.5">
                        <span className="text-xs uppercase tracking-wider text-sunya-ink-soft font-semibold">Height (cm)</span>
                        <input type="number" min="100" max="250" value={profile.height_cm} onChange={(e) => setProfile({ ...profile, height_cm: parseInt(e.target.value || "0") })} className="w-full px-4 py-3 rounded-2xl bg-sunya-ivory border border-sunya-ink/10 outline-none focus:border-sunya-green-dark" data-testid="care-height-input" />
                      </label>
                      <label className="space-y-1.5">
                        <span className="text-xs uppercase tracking-wider text-sunya-ink-soft font-semibold">Weight (kg)</span>
                        <input type="number" min="20" max="250" value={profile.weight_kg} onChange={(e) => setProfile({ ...profile, weight_kg: parseInt(e.target.value || "0") })} className="w-full px-4 py-3 rounded-2xl bg-sunya-ivory border border-sunya-ink/10 outline-none focus:border-sunya-green-dark" data-testid="care-weight-input" />
                      </label>
                    </div>
                    <label className="block space-y-1.5">
                      <span className="text-xs uppercase tracking-wider text-sunya-ink-soft font-semibold">Activity level</span>
                      <select value={profile.activity_level} onChange={(e) => setProfile({ ...profile, activity_level: e.target.value })} className="w-full px-4 py-3 rounded-2xl bg-sunya-ivory border border-sunya-ink/10 outline-none focus:border-sunya-green-dark" data-testid="care-activity-select">
                        <option value="sedentary">Sedentary (desk job, no exercise)</option>
                        <option value="light">Light (1-3 days/week)</option>
                        <option value="moderate">Moderate (3-5 days/week)</option>
                        <option value="active">Active (6-7 days/week)</option>
                        <option value="athlete">Athlete (2x daily)</option>
                      </select>
                    </label>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <h3 className="font-serif-display text-2xl font-bold">What are your goals?</h3>
                    <p className="text-sm text-sunya-ink-soft">Pick all that apply.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {GOAL_OPTIONS.map((g) => {
                        const active = profile.goals.includes(g.id);
                        return (
                          <button
                            key={g.id}
                            onClick={() => toggle("goals", g.id)}
                            className={`p-4 rounded-2xl border-2 text-left transition ${active ? "border-sunya-green-dark bg-sunya-green/10" : "border-sunya-ink/10 hover:border-sunya-green-dark/30"}`}
                            data-testid={`goal-option-${g.id}`}
                          >
                            <div className="flex items-center gap-2 font-semibold text-sunya-ink">
                              <span className={`w-7 h-7 rounded-full flex items-center justify-center ${active ? "bg-sunya-green-dark text-white" : "bg-sunya-ivory text-sunya-green-dark"}`}>{g.icon}</span>
                              {g.label}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <h3 className="font-serif-display text-2xl font-bold">Any health conditions?</h3>
                    <p className="text-sm text-sunya-ink-soft">Optional — we'll warn about unsafe foods. Not medical advice.</p>
                    <div className="grid grid-cols-2 gap-3">
                      {CONDITION_OPTIONS.map((c) => {
                        const active = profile.conditions.includes(c);
                        return (
                          <button
                            key={c}
                            onClick={() => toggle("conditions", c)}
                            className={`p-4 rounded-2xl border-2 text-left transition capitalize font-semibold ${active ? "border-sunya-green-dark bg-sunya-green/10" : "border-sunya-ink/10 hover:border-sunya-green-dark/30"}`}
                            data-testid={`condition-option-${c}`}
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between mt-10 pt-6 border-t border-sunya-ink/5">
                <button
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="text-sm text-sunya-ink-soft hover:text-sunya-ink disabled:opacity-30"
                  data-testid="care-back-btn"
                >
                  ← Back
                </button>
                {step < 2 ? (
                  <button
                    onClick={() => setStep((s) => s + 1)}
                    className="px-7 py-3 rounded-full bg-sunya-green text-white font-semibold shimmer-btn inline-flex items-center gap-2"
                    data-testid="care-next-btn"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={submit}
                    disabled={loading}
                    className="px-7 py-3 rounded-full bg-sunya-green text-white font-semibold shimmer-btn inline-flex items-center gap-2 disabled:opacity-60"
                    data-testid="care-submit-btn"
                  >
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <>Generate my plan <Sparkles className="w-4 h-4" /></>}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
            data-testid="care-results"
          >
            {/* Hero result */}
            <div className="bg-gradient-to-br from-sunya-ink to-[#1a1a1a] text-white rounded-3xl p-10 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-sunya-green/30 rounded-full blur-3xl" />
              <div className="relative">
                <div className="text-xs uppercase tracking-widest text-sunya-gold font-semibold mb-2">Your plan</div>
                <h2 className="font-serif-display text-4xl md:text-5xl font-bold leading-tight">A daily fruit package, just for you</h2>
                <p className="mt-5 text-white/80 max-w-2xl">{result.advice}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
                  <div className="rounded-2xl bg-white/5 p-4 backdrop-blur"><div className="text-xs text-white/60 uppercase">Calories/day</div><div className="font-serif-display text-2xl font-bold mt-1" data-testid="care-calories">{result.daily_calories}</div></div>
                  <div className="rounded-2xl bg-white/5 p-4 backdrop-blur"><div className="text-xs text-white/60 uppercase">Protein</div><div className="font-serif-display text-2xl font-bold mt-1">{result.macros.protein}g</div></div>
                  <div className="rounded-2xl bg-white/5 p-4 backdrop-blur"><div className="text-xs text-white/60 uppercase">Fiber</div><div className="font-serif-display text-2xl font-bold mt-1">{result.macros.fiber}g</div></div>
                  <div className="rounded-2xl bg-white/5 p-4 backdrop-blur"><div className="text-xs text-white/60 uppercase">Pack covers</div><div className="font-serif-display text-2xl font-bold mt-1" data-testid="care-coverage">{result.coverage_pct}%</div></div>
                </div>
              </div>
            </div>

            {/* Macros rings */}
            <div className="bg-white rounded-3xl p-8 border border-sunya-ink/5">
              <h3 className="font-serif-display text-2xl font-bold mb-6">Daily macro targets</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <NutritionRing label="Protein" value={result.macros.protein} max={Math.max(result.macros.protein, 100)} color="#00C950" />
                <NutritionRing label="Carbs" value={result.macros.carbs} max={Math.max(result.macros.carbs, 300)} color="#FFD700" />
                <NutritionRing label="Fats" value={result.macros.fats} max={Math.max(result.macros.fats, 80)} color="#5C5C5C" />
                <NutritionRing label="Fiber" value={result.macros.fiber} max={Math.max(result.macros.fiber, 40)} color="#00A040" />
              </div>
            </div>

            {/* Daily package */}
            <div className="bg-white rounded-3xl p-8 border border-sunya-ink/5">
              <h3 className="font-serif-display text-2xl font-bold mb-1">Your daily fruit package</h3>
              <p className="text-sm text-sunya-ink-soft mb-6">Total: {result.package.reduce((s, i) => s + i.grams, 0)}g across {result.package.length} fruits</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {result.package.map((it, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-sunya-ivory" data-testid={`care-pack-item-${i}`}>
                    <div className="w-12 h-12 rounded-full bg-sunya-green/20 flex items-center justify-center font-bold text-sunya-green-dark">{it.grams}g</div>
                    <div className="flex-1">
                      <div className="font-serif-display font-bold text-sunya-ink">{it.name}</div>
                      <div className="text-xs text-sunya-ink-soft">{it.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Unsafe warnings */}
            {result.unsafe_foods.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8" data-testid="care-warnings">
                <h3 className="font-serif-display text-2xl font-bold flex items-center gap-2 text-amber-900">
                  <AlertTriangle className="w-5 h-5" /> Moderation suggested
                </h3>
                <ul className="mt-4 space-y-3">
                  {result.unsafe_foods.map((u, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-700 mt-2" />
                      <div><span className="font-semibold">{u.name}</span> — <span className="text-amber-900/80">{u.reason}</span></div>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-amber-800/70 mt-4 italic">SUNYA Care provides general guidance, not medical advice. Consult your doctor for clinical decisions.</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => { setResult(null); setStep(0); }} className="px-6 py-3 rounded-full border border-sunya-ink/15 text-sunya-ink font-medium hover:border-sunya-green-dark transition" data-testid="care-redo-btn">
                Redo my plan
              </button>
              <a href="/products" className="px-6 py-3 rounded-full bg-sunya-green text-white font-semibold shimmer-btn inline-flex items-center justify-center gap-2" data-testid="care-shop-btn">
                Shop these fruits <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CarePage;
