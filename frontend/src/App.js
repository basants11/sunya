import React, { useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import AuthModal from "@/components/AuthModal";
import FloatingChat from "@/components/FloatingChat";
import HomePage from "@/pages/HomePage";
import ProductsPage from "@/pages/ProductsPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrderSuccessPage from "@/pages/OrderSuccessPage";
import CarePage from "@/pages/CarePage";
import AccountPage from "@/pages/AccountPage";
import AdminPage from "@/pages/AdminPage";

function App() {
  const [authOpen, setAuthOpen] = useState(false);
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="App min-h-screen flex flex-col">
            <Header onAuthOpen={() => setAuthOpen(true)} />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:slug" element={<ProductDetailPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                <Route path="/care" element={<CarePage />} />
                <Route path="/account" element={<AccountPage onAuthOpen={() => setAuthOpen(true)} />} />
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </main>
            <Footer />
            <CartDrawer />
            <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
            <FloatingChat />
            <Toaster position="top-center" richColors closeButton />
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
