import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { formatNPR, formatGrams } from "@/lib/api";

const CartDrawer = () => {
  const { items, isOpen, close, updateQty, remove, subtotal } = useCart();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          className="fixed inset-0 z-[90] bg-sunya-ink/50 backdrop-blur-sm"
          data-testid="cart-drawer-backdrop"
        >
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-white shadow-2xl flex flex-col"
            data-testid="cart-drawer"
          >
            <div className="flex items-center justify-between p-6 border-b border-sunya-ink/5">
              <div>
                <div className="text-xs uppercase tracking-widest text-sunya-green-dark font-semibold">Your Cart</div>
                <h2 className="font-serif-display text-2xl font-bold text-sunya-ink mt-1">
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </h2>
              </div>
              <button
                onClick={close}
                className="w-10 h-10 rounded-full bg-sunya-ivory hover:bg-sunya-ink/10 flex items-center justify-center transition"
                data-testid="cart-close-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20" data-testid="cart-empty-state">
                  <div className="w-20 h-20 rounded-full bg-sunya-ivory flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-sunya-ink-soft" />
                  </div>
                  <p className="text-sunya-ink-soft">Your cart is empty</p>
                  <button
                    onClick={() => { close(); navigate("/products"); }}
                    className="mt-6 px-6 py-3 rounded-full bg-sunya-green text-white font-semibold shimmer-btn"
                    data-testid="cart-shop-now-btn"
                  >
                    Shop products
                  </button>
                </div>
              ) : (
                items.map((it) => (
                  <motion.div
                    key={`${it.product_id}-${it.selected_grams}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex gap-4 p-4 rounded-2xl bg-sunya-ivory"
                    data-testid={`cart-item-${it.product_id}`}
                  >
                    <img src={it.image} alt={it.name} className="w-20 h-20 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="font-serif-display text-base font-bold text-sunya-ink truncate">{it.name}</div>
                      <div className="text-xs text-sunya-ink-soft">{formatGrams(it.selected_grams)} pouch</div>
                      <div className="text-sm font-bold text-sunya-ink mt-1">{formatNPR(it.unit_price)}</div>
                      <div className="flex items-center gap-1 mt-2">
                        <button
                          onClick={() => updateQty(it.product_id, it.selected_grams, it.quantity - 1)}
                          className="w-7 h-7 rounded-full bg-white border border-sunya-ink/10 flex items-center justify-center hover:bg-sunya-green hover:text-white transition"
                          data-testid={`cart-qty-dec-${it.product_id}`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold" data-testid={`cart-qty-${it.product_id}`}>{it.quantity}</span>
                        <button
                          onClick={() => updateQty(it.product_id, it.selected_grams, it.quantity + 1)}
                          className="w-7 h-7 rounded-full bg-white border border-sunya-ink/10 flex items-center justify-center hover:bg-sunya-green hover:text-white transition"
                          data-testid={`cart-qty-inc-${it.product_id}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => remove(it.product_id, it.selected_grams)}
                          className="ml-auto w-7 h-7 rounded-full text-sunya-ink-soft hover:text-red-500 transition"
                          data-testid={`cart-remove-${it.product_id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-sunya-ink/5 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-sunya-ink-soft">Subtotal</span>
                  <span className="font-serif-display text-2xl font-bold text-sunya-ink" data-testid="cart-subtotal">
                    {formatNPR(subtotal)}
                  </span>
                </div>
                <div className="text-xs text-sunya-ink-soft">
                  {subtotal >= 3000
                    ? "🎉 Free shipping unlocked!"
                    : `Add ${formatNPR(3000 - subtotal)} more for free shipping`}
                </div>
                <button
                  onClick={() => { close(); navigate("/checkout"); }}
                  className="w-full py-4 rounded-full bg-sunya-green text-white font-semibold shimmer-btn hover:bg-sunya-green-dark transition"
                  data-testid="cart-checkout-btn"
                >
                  Checkout
                </button>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
