import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api, formatNPR } from "@/lib/api";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ShieldAlert, Package, DollarSign, ShoppingBag, TrendingUp } from "lucide-react";

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const AdminPage = () => {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const load = () => {
    api.get("/admin/orders")
      .then((res) => setOrders(res.data))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoadingOrders(false));
  };

  useEffect(() => {
    if (user?.role === "admin") load();
  }, [user]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/admin/orders/${orderId}`, { status: newStatus });
      toast.success(`Order ${orderId.slice(0, 8)} → ${newStatus}`);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch {
      toast.error("Update failed");
    }
  };

  if (loading) return <div className="pt-40 text-center">Loading...</div>;
  if (!user || user.role !== "admin") {
    return (
      <div className="pt-40 pb-20 text-center" data-testid="admin-no-access">
        <ShieldAlert className="w-12 h-12 mx-auto text-amber-600 mb-4" />
        <h1 className="font-serif-display text-3xl font-bold">Admin access required</h1>
        <p className="text-sunya-ink-soft mt-2">Sign in with an admin account.</p>
      </div>
    );
  }

  const totalRevenue = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
  const pendingCount = orders.filter(o => o.status === "pending").length;

  return (
    <div className="pt-28 pb-20" data-testid="admin-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-10">
          <div className="text-xs uppercase tracking-[0.25em] font-semibold text-sunya-green-dark mb-3">Admin</div>
          <h1 className="font-serif-display text-4xl md:text-5xl font-bold text-sunya-ink tracking-tight">Operations dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: <ShoppingBag className="w-5 h-5" />, label: "Total orders", value: orders.length, color: "bg-sunya-green/10 text-sunya-green-dark" },
            { icon: <DollarSign className="w-5 h-5" />, label: "Revenue", value: formatNPR(totalRevenue), color: "bg-sunya-gold/20 text-amber-700" },
            { icon: <Package className="w-5 h-5" />, label: "Pending", value: pendingCount, color: "bg-amber-100 text-amber-800" },
            { icon: <TrendingUp className="w-5 h-5" />, label: "Avg order", value: orders.length ? formatNPR(totalRevenue / orders.length) : "—", color: "bg-blue-50 text-blue-700" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl p-5 border border-sunya-ink/5">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${s.color}`}>{s.icon}</div>
              <div className="text-xs text-sunya-ink-soft uppercase tracking-wider">{s.label}</div>
              <div className="font-serif-display text-2xl font-bold mt-1" data-testid={`stat-${s.label.toLowerCase().replace(/ /g, '-')}`}>{s.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Orders table */}
        <div className="bg-white rounded-3xl border border-sunya-ink/5 overflow-hidden">
          <div className="p-6 border-b border-sunya-ink/5">
            <h2 className="font-serif-display text-2xl font-bold">All orders</h2>
          </div>
          {loadingOrders ? (
            <div className="p-6 space-y-3">{[1,2,3].map((i) => <div key={i} className="h-12 bg-sunya-ivory animate-pulse rounded-xl" />)}</div>
          ) : orders.length === 0 ? (
            <div className="p-10 text-center text-sunya-ink-soft" data-testid="admin-no-orders">No orders yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-sunya-ink-soft bg-sunya-ivory">
                    <th className="p-4">Order</th><th className="p-4">Customer</th><th className="p-4">Total</th><th className="p-4">Payment</th><th className="p-4">Status</th><th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-t border-sunya-ink/5 hover:bg-sunya-ivory/50 transition" data-testid={`admin-order-${o.id}`}>
                      <td className="p-4 font-mono text-xs">#{o.id.slice(0, 8)}</td>
                      <td className="p-4">
                        <div className="font-semibold">{o.full_name}</div>
                        <div className="text-xs text-sunya-ink-soft">{o.phone}</div>
                      </td>
                      <td className="p-4 font-bold font-serif-display">{formatNPR(o.total)}</td>
                      <td className="p-4 capitalize text-xs">{o.payment_method}</td>
                      <td className="p-4">
                        <select
                          value={o.status}
                          onChange={(e) => updateStatus(o.id, e.target.value)}
                          className="px-3 py-1.5 rounded-full bg-sunya-ivory border border-sunya-ink/10 text-xs font-semibold capitalize outline-none"
                          data-testid={`admin-status-${o.id}`}
                        >
                          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="p-4 text-xs text-sunya-ink-soft">{new Date(o.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
