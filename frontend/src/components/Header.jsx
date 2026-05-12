import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, User, Menu, X, Sparkles } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

const Header = ({ onAuthOpen }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count, open: openCart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium tracking-wide transition-colors ${
      isActive ? "text-sunya-green-dark" : "text-sunya-ink hover:text-sunya-green-dark"
    }`;

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-sunya-ink/5 py-3"
          : "bg-transparent py-5"
      }`}
      data-testid="site-header"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" data-testid="header-logo">
          <div className="w-9 h-9 rounded-full bg-sunya-green flex items-center justify-center shadow-lg shadow-sunya-green/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span
            className="font-serif-display text-2xl font-extrabold tracking-tight text-sunya-ink"
            style={{ fontStyle: "normal" }}
          >
            SUNYA
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/" end className={navLinkClass} data-testid="nav-home">
            Home
          </NavLink>
          <NavLink to="/products" className={navLinkClass} data-testid="nav-products">
            Products
          </NavLink>
          <NavLink to="/care" className={navLinkClass} data-testid="nav-care">
            SUNYA Care
          </NavLink>
          <NavLink to="/account" className={navLinkClass} data-testid="nav-account">
            Account
          </NavLink>
          {user?.role === "admin" && (
            <NavLink to="/admin" className={navLinkClass} data-testid="nav-admin">
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="hidden sm:flex text-xs text-sunya-ink-soft hover:text-sunya-green-dark transition px-3 py-2"
              data-testid="logout-btn"
            >
              Hi, {user.name.split(" ")[0]} · Logout
            </button>
          ) : (
            <button
              onClick={onAuthOpen}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm text-sunya-ink hover:text-sunya-green-dark transition"
              data-testid="header-login-btn"
            >
              <User className="w-4 h-4" /> Sign in
            </button>
          )}

          <button
            onClick={openCart}
            className="relative w-11 h-11 rounded-full bg-sunya-ink text-white flex items-center justify-center hover:bg-sunya-green-dark transition group"
            data-testid="header-cart-btn"
          >
            <ShoppingBag className="w-5 h-5" />
            {count > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-sunya-gold text-sunya-ink text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
                data-testid="cart-count-badge"
              >
                {count}
              </motion.span>
            )}
          </button>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden w-11 h-11 rounded-full bg-sunya-ivory border border-sunya-ink/10 flex items-center justify-center"
            data-testid="mobile-menu-btn"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass mt-3 mx-6 rounded-2xl p-6 space-y-4"
        >
          <NavLink to="/" end onClick={() => setMobileOpen(false)} className="block text-sunya-ink font-medium" data-testid="mobile-nav-home">Home</NavLink>
          <NavLink to="/products" onClick={() => setMobileOpen(false)} className="block text-sunya-ink font-medium" data-testid="mobile-nav-products">Products</NavLink>
          <NavLink to="/care" onClick={() => setMobileOpen(false)} className="block text-sunya-ink font-medium" data-testid="mobile-nav-care">SUNYA Care</NavLink>
          <NavLink to="/account" onClick={() => setMobileOpen(false)} className="block text-sunya-ink font-medium" data-testid="mobile-nav-account">Account</NavLink>
          {user?.role === "admin" && (
            <NavLink to="/admin" onClick={() => setMobileOpen(false)} className="block text-sunya-ink font-medium" data-testid="mobile-nav-admin">Admin</NavLink>
          )}
          {!user && (
            <button onClick={() => { setMobileOpen(false); onAuthOpen(); }} className="text-sunya-green-dark font-semibold" data-testid="mobile-login-btn">
              Sign in
            </button>
          )}
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header;
