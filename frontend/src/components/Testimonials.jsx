import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const REVIEWS = [
  {
    name: "Ankita S.",
    role: "Yoga teacher · Kathmandu",
    text: "I've replaced my afternoon biscuit with Sunya kiwi slices. My energy is steadier, my skin clearer — and they taste like real fruit, not candy.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop",
  },
  {
    name: "Dr. Pratima R.",
    role: "Nutritionist · Pokhara",
    text: "I recommend Sunya to clients managing pre-diabetes. Zero added sugar is rare in dried fruit. The gram-based pouches make portion control trivial.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&h=120&fit=crop",
  },
  {
    name: "Suresh T.",
    role: "Trail runner · Lalitpur",
    text: "1kg bag lives in my pack. Banana chips on climbs, strawberries at camp. They've literally never gotten soggy.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden" data-testid="testimonials-section">
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-sunya-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-14">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] font-semibold text-sunya-green-dark mb-3">
              Loved across Nepal
            </div>
            <h2 className="font-serif-display text-4xl md:text-5xl font-bold text-sunya-ink tracking-tight leading-tight">
              <span className="italic">12,847</span> reasons<br />to fall in love
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-sunya-gold text-sunya-gold" />
              ))}
            </div>
            <span className="text-sm text-sunya-ink-soft">
              <span className="font-bold text-sunya-ink">4.9</span> · 1,234 reviews
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {REVIEWS.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -6 }}
              className="relative bg-white rounded-3xl p-7 border border-sunya-ink/5 shadow-sm hover:shadow-2xl hover:shadow-sunya-ink/10 transition-shadow"
              data-testid={`testimonial-${i}`}
            >
              <Quote className="absolute top-6 right-6 w-7 h-7 text-sunya-gold opacity-40" />
              <div className="flex mb-4">
                {[...Array(r.rating)].map((_, k) => (
                  <Star key={k} className="w-4 h-4 fill-sunya-gold text-sunya-gold" />
                ))}
              </div>
              <p className="text-sunya-ink leading-relaxed text-[15px] mb-6">"{r.text}"</p>
              <div className="flex items-center gap-3 pt-5 border-t border-sunya-ink/5">
                <img src={r.avatar} alt={r.name} className="w-11 h-11 rounded-full object-cover" />
                <div>
                  <div className="font-semibold text-sunya-ink text-sm">{r.name}</div>
                  <div className="text-xs text-sunya-ink-soft">{r.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
