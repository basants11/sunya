import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api, formatNPR, formatGrams } from "@/lib/api";
import { Package } from "lucide-react";
import { motion } from "framer-motion";

const statusColors = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const AccountPage = ({ onAuthOpen }) => {
  const { user, logout, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.get("/orders").then((res) => setOrders(res.data)).finally(() => setLoadingOrders(false));
  }, [user]);

  if (loading) return <div className="pt-40 text-center">Loading...</div>;

  if (!user) {
    return (
      <div className="pt-40 pb-20 text-center" data-testid="account-signed-out">
        <h1 className="font-serif-display text-4xl font-bold">Sign in to view your account</h1>
        <button onClick={onAuthOpen} className="mt-6 px-7 py-3 rounded-full bg-sunya-green text-white font-semibold shimmer-btn" data-testid="account-signin-btn">
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20" data-testid="account-page">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] font-semibold text-sunya-green-dark mb-3">Welcome</div>
            <h1 className="font-serif-display text-4xl md:text-5xl font-bold text-sunya-ink tracking-tight">
              Hello, {user.name.split(" ")[0]}
            </h1>
            <p className="text-sunya-ink-soft text-sm mt-2">{user.email}</p>
          </div>
          <button onClick={logout} className="px-5 py-2.5 rounded-full border border-sunya-ink/15 text-sm hover:border-sunya-green-dark transition" data-testid="account-logout-btn">
            Sign out
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-sunya-ink/5 p-8">
          <h2 className="font-serif-display text-2xl font-bold mb-5 flex items-center gap-2">
            <Package className="w-5 h-5 text-sunya-green-dark" /> Your orders
          </h2>
          {loadingOrders ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-sunya-ivory rounded-2xl animate-pulse" />)}</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10 text-sunya-ink-soft" data-testid="account-no-orders">
              No orders yet. Start shopping →
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o, i) => (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-5 rounded-2xl bg-sunya-ivory"
                  data-testid={`order-row-${o.id}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-xs text-sunya-ink-soft font-mono">#{o.id.slice(0, 8)}</div>
                      <div className="text-sm">
                        {o.items.length} items · {new Date(o.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[o.status] || "bg-gray-100"}`}>{o.status}</span>
                      <span className="font-serif-display text-xl font-bold">{formatNPR(o.total)}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2 flex-wrap text-xs text-sunya-ink-soft">
                    {o.items.map((it) => (
                      <span key={`${it.product_id}-${it.selected_grams}`} className="px-2 py-1 rounded-full bg-white">
                        {it.name} ({formatGrams(it.selected_grams)} × {it.quantity})
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
