import React from "react";
import ProductCard from "../../components/product/ProductCard";
import { ProductInfo } from "../../api/post";
import { useProductContext } from "../../context/ProductContext";

const ProductListPage: React.FC = () => {
  const { products } = useProductContext();

  return (
    <div className="w-full flex justify-center px-4 py-6">
      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-screen-xl">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductListPage;
