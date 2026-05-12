import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, MapPin } from "lucide-react";

// Curated social proof events — rotates to create FOMO + trust
const EVENTS = [
  { name: "Anita", city: "Pokhara", action: "just bought 500g Dried Mango Strips", t: "2 min ago" },
  { name: "Bibek", city: "Kathmandu", action: "joined the SUNYA Care plan", t: "5 min ago" },
  { name: "Sara", city: "Lalitpur", action: "ordered 1kg Freeze-Dried Strawberries", t: "8 min ago" },
  { name: "Manish", city: "Biratnagar", action: "just bought 500g Dried Kiwi Slices", t: "12 min ago" },
  { name: "Priya", city: "Butwal", action: "unlocked free shipping with a 1kg order", t: "15 min ago" },
  { name: "Rohan", city: "Dharan", action: "ordered 300g Dried Banana Chips", t: "18 min ago" },
  { name: "Kiran", city: "Bhaktapur", action: "left a 5-star review for Dried Mango", t: "22 min ago" },
  { name: "Nisha", city: "Itahari", action: "just bought 200g Dried Pineapple Rings", t: "25 min ago" },
];

const LiveActivity = () => {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Start after a short delay (so it doesn't interrupt page load)
    const initial = setTimeout(() => setVisible(true), 8000);
    return () => clearTimeout(initial);
  }, []);

  useEffect(() => {
    if (!visible) return;
    // Cycle every ~7s — show 5s, hide 2s for breath
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % EVENTS.length);
        setVisible(true);
      }, 2000);
    }, 7000);
    return () => clearInterval(cycle);
  }, [visible]);

  const ev = EVENTS[idx];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: "spring", damping: 18 }}
          className="fixed bottom-6 left-6 z-[70] hidden sm:block"
          data-testid="live-activity-toast"
        >
          <div className="glass rounded-2xl pl-2 pr-4 py-2 flex items-center gap-3 shadow-2xl shadow-sunya-ink/15 max-w-xs">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sunya-green to-sunya-green-dark flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div className="text-xs text-sunya-ink leading-tight">
              <div className="font-semibold text-sunya-ink">
                {ev.name} from <span className="inline-flex items-center gap-0.5"><MapPin className="w-3 h-3" />{ev.city}</span>
              </div>
              <div className="text-sunya-ink-soft mt-0.5">{ev.action}</div>
              <div className="text-[10px] text-sunya-green-dark mt-1 font-medium">· {ev.t}</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LiveActivity;
