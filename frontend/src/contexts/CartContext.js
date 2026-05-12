import React, { createContext, useContext, useEffect, useState } from "react";

const CartCtx = createContext(null);
const STORAGE_KEY = "sunya_cart_v1";

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      setItems(saved);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const keyFor = (it) => `${it.product_id}__${it.selected_grams}`;

  const add = (product, grams, price, qty = 1) => {
    setItems((prev) => {
      const k = `${product.id}__${grams}`;
      const found = prev.find((p) => keyFor(p) === k);
      if (found) {
        return prev.map((p) =>
          keyFor(p) === k ? { ...p, quantity: p.quantity + qty } : p
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          image: product.image,
          slug: product.slug,
          selected_grams: grams,
          unit_price: price,
          quantity: qty,
        },
      ];
    });
    setIsOpen(true);
  };

  const updateQty = (product_id, selected_grams, qty) => {
    if (qty <= 0) return remove(product_id, selected_grams);
    setItems((prev) =>
      prev.map((p) =>
        p.product_id === product_id && p.selected_grams === selected_grams
          ? { ...p, quantity: qty }
          : p
      )
    );
  };

  const remove = (product_id, selected_grams) => {
    setItems((prev) =>
      prev.filter(
        (p) =>
          !(p.product_id === product_id && p.selected_grams === selected_grams)
      )
    );
  };

  const clear = () => setItems([]);

  const subtotal = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartCtx.Provider
      value={{
        items,
        add,
        updateQty,
        remove,
        clear,
        subtotal,
        count,
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen((v) => !v),
      }}
    >
      {children}
    </CartCtx.Provider>
  );
};

export const useCart = () => useContext(CartCtx);
