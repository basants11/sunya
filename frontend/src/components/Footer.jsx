import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

const Footer = () => {
  const [email, setEmail] = useState("");

  const onSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    toast.success("You're on the list — welcome to the Sunya circle!");
    setEmail("");
  };

  return (
    <footer className="bg-sunya-ink text-sunya-ivory pt-20 pb-8" data-testid="site-footer">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Newsletter banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-sunya-green-dark to-sunya-green rounded-3xl p-8 md:p-14 mb-20 relative overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-60 h-60 bg-sunya-gold/20 rounded-full blur-3xl" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] font-semibold text-sunya-gold mb-2">
                Newsletter
              </div>
              <h3 className="font-serif-display text-3xl md:text-4xl font-bold leading-tight">
                Get 15% off your first order
              </h3>
              <p className="mt-3 text-white/80 text-sm">
                Plus tasting notes, recipes, and stories from our farms.
              </p>
            </div>
            <form onSubmit={onSubscribe} className="flex gap-2" data-testid="newsletter-form">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-5 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 outline-none focus:bg-white/20 transition"
                data-testid="newsletter-email-input"
              />
              <button
                type="submit"
                className="px-6 py-4 rounded-full bg-sunya-gold text-sunya-ink font-semibold hover:bg-white transition shimmer-btn"
                data-testid="newsletter-submit-btn"
              >
                Join
              </button>
            </form>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full bg-sunya-green flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-serif-display text-2xl font-extrabold tracking-tight">
                SUNYA
              </span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Premium dehydrated fruits from the foothills of Nepal. Zero sugar. Zero preservatives. Forever real.
            </p>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-sunya-gold font-semibold mb-4">Shop</div>
            <ul className="space-y-3 text-sm text-white/70">
              <li><a href="/products" className="hover:text-white transition">All Products</a></li>
              <li><a href="/care" className="hover:text-white transition">SUNYA Care</a></li>
              <li><a href="/products" className="hover:text-white transition">Bulk Pricing</a></li>
              <li><a href="/account" className="hover:text-white transition">My Orders</a></li>
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-sunya-gold font-semibold mb-4">Company</div>
            <ul className="space-y-3 text-sm text-white/70">
              <li><a href="#" className="hover:text-white transition">Our Story</a></li>
              <li><a href="#" className="hover:text-white transition">Farms & Sourcing</a></li>
              <li><a href="#" className="hover:text-white transition">Sustainability</a></li>
              <li><a href="#" className="hover:text-white transition">Press</a></li>
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-sunya-gold font-semibold mb-4">Contact</div>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> hello@sunya.com.np</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +977-1-4567890</li>
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5" /> Lazimpat, Kathmandu, Nepal</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <div>© {new Date().getFullYear()} Sunya. Crafted with care in Nepal.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Shipping</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
