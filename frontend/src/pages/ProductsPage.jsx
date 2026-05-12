import React from "react";
import ProductShowcase from "@/components/ProductShowcase";

const ProductsPage = () => {
  return (
    <div className="pt-32 pb-12" data-testid="products-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <div className="text-xs uppercase tracking-[0.25em] font-semibold text-sunya-green-dark mb-3">
            The Collection
          </div>
          <h1 className="font-serif-display text-5xl md:text-6xl font-bold text-sunya-ink tracking-tight leading-none">
            Every fruit, slow-crafted
          </h1>
          <p className="mt-5 text-sunya-ink-soft">
            Six premium dehydrated fruits — each available in 100g to 1kg, with bulk savings up to 20%.
          </p>
        </div>
      </div>
      <ProductShowcase title="" subtitle="All Products" />
    </div>
  );
};

export default ProductsPage;
