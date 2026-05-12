import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const AuthModal = ({ open, onClose }) => {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
        toast.success("Welcome back!");
      } else {
        await signup(name, email, password);
        toast.success("Account created — welcome to Sunya!");
      }
      onClose();
      setEmail("");
      setPassword("");
      setName("");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-sunya-ink/60 backdrop-blur-sm"
          onClick={onClose}
          data-testid="auth-modal-backdrop"
        >
          <motion.div
            initial={{ scale: 0.95, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 30, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            data-testid="auth-modal"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-sunya-ivory hover:bg-sunya-ink/10 flex items-center justify-center transition"
              data-testid="auth-close-btn"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-8 pt-10">
              <h2 className="font-serif-display text-3xl font-bold text-sunya-ink" data-testid="auth-modal-title">
                {mode === "login" ? "Welcome back" : "Create account"}
              </h2>
              <p className="mt-2 text-sm text-sunya-ink-soft">
                {mode === "login" ? "Sign in to your Sunya account" : "Join the Sunya circle"}
              </p>

              <form onSubmit={submit} className="mt-6 space-y-4">
                {mode === "signup" && (
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sunya-ink-soft" />
                    <input
                      type="text"
                      required
                      placeholder="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-sunya-ivory border border-sunya-ink/10 outline-none focus:border-sunya-green-dark transition"
                      data-testid="auth-name-input"
                    />
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sunya-ink-soft" />
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-sunya-ivory border border-sunya-ink/10 outline-none focus:border-sunya-green-dark transition"
                    data-testid="auth-email-input"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sunya-ink-soft" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Password (min 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-sunya-ivory border border-sunya-ink/10 outline-none focus:border-sunya-green-dark transition"
                    data-testid="auth-password-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-sunya-green text-white font-semibold disabled:opacity-60 hover:bg-sunya-green-dark transition shimmer-btn"
                  data-testid="auth-submit-btn"
                >
                  {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-sunya-ink-soft">
                {mode === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <button onClick={() => setMode("signup")} className="text-sunya-green-dark font-semibold hover:underline" data-testid="auth-switch-signup">
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Have an account?{" "}
                    <button onClick={() => setMode("login")} className="text-sunya-green-dark font-semibold hover:underline" data-testid="auth-switch-login">
                      Sign in
                    </button>
                  </>
                )}
              </div>

              <div className="mt-5 text-[11px] text-center text-sunya-ink-soft/70">
                Try the demo: <span className="font-mono">demo@sunya.com.np / Demo@Sunya2026</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
