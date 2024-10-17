import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import { postFetcher, ProductInfo } from "../api/post";
import { useAuthContext } from "../hooks/useAuthContext";

interface ProductContextProps {
  products: ProductInfo[];
  loading: boolean;
  error: string | null;
}

export const ProductContext = createContext<ProductContextProps | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const {auth} = useAuthContext();

  useEffect(() => {
    if (!auth?.token) return;
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const fetchedProducts = await postFetcher.getAllProducts(auth?.token);
        setProducts(fetchedProducts as unknown as ProductInfo[]);
      } catch (err) {
        setError("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading, error }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("usePostContext must be used within a PostProvider");
  }
  return context;
};

export default ProductContext;
