import React from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  return (
    <div className="pt-32 pb-20 min-h-screen flex items-center" data-testid="order-success-page">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="w-24 h-24 mx-auto mb-8 rounded-full bg-sunya-green/20 flex items-center justify-center"
        >
          <CheckCircle2 className="w-14 h-14 text-sunya-green-dark" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-serif-display text-5xl font-bold text-sunya-ink leading-tight"
        >
          Thank you!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-5 text-sunya-ink-soft text-lg"
        >
          Your order has been confirmed. We'll send updates to your email soon.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-sunya-ivory text-sm text-sunya-ink-soft"
          data-testid="order-id-pill"
        >
          <Package className="w-4 h-4" /> Order ID: <span className="font-mono text-sunya-ink">{orderId}</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-10 flex gap-3 justify-center"
        >
          <Link to="/account" className="px-6 py-3 rounded-full border border-sunya-ink/15 text-sunya-ink font-medium hover:border-sunya-green-dark transition" data-testid="view-orders-btn">
            View my orders
          </Link>
          <Link to="/products" className="px-6 py-3 rounded-full bg-sunya-green text-white font-semibold shimmer-btn inline-flex items-center gap-2" data-testid="continue-shopping-btn">
            Continue shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
