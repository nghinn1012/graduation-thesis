import React, { createContext, useState, useEffect, ReactNode, useContext, useCallback } from "react";
import { Cart, postFetcher, ProductCart, ProductInfo, ProductList } from "../api/post";
import { useAuthContext } from "../hooks/useAuthContext";

interface ProductContextProps {
  products: ProductInfo[];
  cart: ProductCart[];
  setCart: React.Dispatch<React.SetStateAction<ProductCart[]>>;
  removeProduct: (productId: string) => void;
  removeProductFromCart: (productId: string) => void;
  fetchProductByPostId: (postId: string) => void;
  addProductToCart: (productId: string, quantity: number) => void;
  currentProduct: ProductInfo | null;
  setCurrentProduct: React.Dispatch<React.SetStateAction<ProductInfo | null>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}

export const ProductContext = createContext<ProductContextProps | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<ProductInfo[]>([]);
  const [currentProduct, setCurrentProduct] = useState<ProductInfo | null>(null);
  const [cart, setCart] = useState<ProductCart[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const {auth} = useAuthContext();
  const [page, setPage] = useState<number>(1);
  const limit = 8;
  const [totalPages, setTotalPages] = useState<number>(0);

  useEffect(() => {
    if (!auth?.token) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const fetchedProducts = await postFetcher.getAllProducts(auth?.token, page, limit) as unknown as ProductList;
        console.log(fetchedProducts);
        setProducts(fetchedProducts.products);
        setTotalPages(fetchedProducts.totalPages);
      } catch (err) {
        setError("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [auth?.token, page]);

  useEffect(() => {
    if (!auth?.token) return;
    const fetchCart = async () => {
      try {
        setLoading(true);
        const fetchedCart = await postFetcher.getCart(auth?.token);
        setCart(fetchedCart as unknown as ProductCart[]);
        console.log(fetchedCart);
      } catch (err) {
        setError("Failed to fetch cart");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [auth?.token]);

  const fetchProductByPostId = useCallback(
    async (postId: string) => {
      if (!auth?.token) return;
      try {
        setLoading(true);
        const product = await postFetcher.getProductByPostId(postId, auth?.token) as unknown as ProductInfo;
        console.log(product);

        setProducts((prevProducts) => {
          const isProductExists = prevProducts.some((p) => p._id === product._id);

          if (!isProductExists) {
            return [...prevProducts, product];
          }

          return [...prevProducts.filter((p) => p._id !== product._id), product];
        });
        setCurrentProduct(product);
      } catch (err) {
        setError("Failed to fetch product");
      } finally {
        setLoading(false);
      }
    },
    [auth?.token, setProducts, setCurrentProduct]
  );

  const removeProduct = useCallback(
    async (postId: string) => {
      if (!auth?.token) return;
      try {
        setLoading(true);
        setProducts((prevProducts) => prevProducts.filter((p) => p.postId !== postId));
      } catch (err) {
        setError("Failed to remove product");
      } finally {
        setLoading(false);
      }
    },
    [auth?.token]
  );

  const addProductToCart = useCallback(
    async (productId: string, quantity: number) => {
      if (!auth?.token) return;
      try {
        setLoading(true);
        const updatedCart = await postFetcher.addProductToCart(productId, quantity, auth?.token) as unknown as Cart;

        setCart(updatedCart.products);
      } catch (err) {
        setError("Failed to add product to cart");
      } finally {
        setLoading(false);
      }
    },
    [auth?.token]
  );

  const removeProductFromCart = useCallback(
    async (productId: string) => {
      console.log(productId);
      if (!auth?.token) return;
      try {
        setLoading(true);
        const updatedCart = await postFetcher.removeProductFromCart(productId, auth?.token) as unknown as Cart;
        console.log(updatedCart);
        setCart((prevCart) => prevCart.filter((p) => p.productId !== productId));
      } catch (err) {
        setError("Failed to remove product from cart");
      } finally {
        setLoading(false);
      }
    },
    [auth?.token]
  );

  return (
    <ProductContext.Provider value={{ totalPages, page, setPage, setLoading, currentProduct, setCurrentProduct, removeProductFromCart, addProductToCart, removeProduct, products, loading, error, cart, setCart, fetchProductByPostId }}>
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
