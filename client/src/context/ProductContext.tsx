import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
  useCallback,
} from "react";
import {
  Cart,
  OrderInfo,
  OrderListWithPagination,
  OrderWithUserInfo,
  postFetcher,
  ProductCart,
  ProductInfo,
  ProductList,
  ReviewCreate,
} from "../api/post";
import { useAuthContext } from "../hooks/useAuthContext";
import { useLocation } from "react-router-dom";
import { useToastContext } from "../hooks/useToastContext";
import { useI18nContext } from "../hooks/useI18nContext";

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}

interface ProductContextProps {
  products: ProductInfo[];
  cart: ProductCart[];
  setCart: React.Dispatch<React.SetStateAction<ProductCart[]>>;
  removeProduct: (productId: string) => void;
  removeProductFromCart: (productIds: string[]) => void;
  fetchProductByPostId: (postId: string) => void;
  addProductToCart: (productId: string, quantity: number) => void;
  currentProduct: ProductInfo | null;
  setCurrentProduct: React.Dispatch<React.SetStateAction<ProductInfo | null>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  errorProduct: string | null;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  searchProducts: (searchTerm: string, filter: string) => void;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  selectedItems: string[];
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
  ordersByUser: OrderWithUserInfo[];
  ordersBySeller: OrderWithUserInfo[];
  setOrdersByUser: React.Dispatch<React.SetStateAction<OrderWithUserInfo[]>>;
  setOrdersBySeller: React.Dispatch<React.SetStateAction<OrderWithUserInfo[]>>;
  fetchOrdersByUser: () => void;
  fetchOrderBySeller: () => void;
  createOrder: (orderInfo: OrderInfo) => Promise<OrderWithUserInfo | undefined>;
  currentOrder: OrderWithUserInfo | null;
  setCurrentOrder: React.Dispatch<
    React.SetStateAction<OrderWithUserInfo | null>
  >;
  totalUserPages: number;
  totalSellerPages: number;
  pageUser: number;
  pageSeller: number;
  statusUser: string;
  statusSeller: string;
  setTotalUserPages: React.Dispatch<React.SetStateAction<number>>;
  setTotalSellerPages: React.Dispatch<React.SetStateAction<number>>;
  setPageUser: React.Dispatch<React.SetStateAction<number>>;
  setPageSeller: React.Dispatch<React.SetStateAction<number>>;
  setStatusUser: React.Dispatch<React.SetStateAction<string>>;
  setStatusSeller: React.Dispatch<React.SetStateAction<string>>;
  limit: number;
  setLimit: React.Dispatch<React.SetStateAction<number>>;
  currentOrderDetail: OrderWithUserInfo | null;
  setCurrentOrderDetail: React.Dispatch<
    React.SetStateAction<OrderWithUserInfo | null>
  >;
  fetchOrderById: (orderId: string) => void;
  loadingCart: boolean;
  setLoadingCart: React.Dispatch<React.SetStateAction<boolean>>;
  loadingOrder: boolean;
  setLoadingOrder: React.Dispatch<React.SetStateAction<boolean>>;
  cancelOrder: (
    orderId: string,
    reason: string,
    isMyOrder: boolean,
    tab: string
  ) => void;
  updateOrderStatus: (orderId: string, status: string, tab: string) => void;
  alreadyAddToCart: boolean;
  setAlreadyAddToCart: React.Dispatch<React.SetStateAction<boolean>>;
  currentOrderReview: OrderWithUserInfo | null;
  setCurrentOrderReview: React.Dispatch<
    React.SetStateAction<OrderWithUserInfo | null>
  >;
  createOrderReview: (orderId: string, reviews: ReviewCreate[]) => void;
}

export const ProductContext = createContext<ProductContextProps | undefined>(
  undefined
);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<ProductInfo[]>([]);
  const [currentProduct, setCurrentProduct] = useState<ProductInfo | null>(
    null
  );
  const [cart, setCart] = useState<ProductCart[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingOrder, setLoadingOrder] = useState<boolean>(true);
  const [loadingCart, setLoadingCart] = useState<boolean>(true);
  const [errorProduct, setErrorProduct] = useState<string | null>(null);
  const { auth } = useAuthContext();
  const [pageOrder, setPageOrder] = useState<number>(1);
  const location = useLocation();
  const [totalUserPages, setTotalUserPages] = useState<number>(0);
  const [totalSellerPages, setTotalSellerPages] = useState<number>(0);
  const [pageUser, setPageUser] = useState<number>(1);
  const [pageSeller, setPageSeller] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [ordersByUser, setOrdersByUser] = useState<OrderWithUserInfo[]>([]);
  const [ordersBySeller, setOrdersBySeller] = useState<OrderWithUserInfo[]>([]);
  const [currentOrder, setCurrentOrder] = useState<OrderWithUserInfo | null>(
    null
  );
  const [statusUser, setStatusUser] = useState<string>("");
  const [statusSeller, setStatusSeller] = useState<string>("");
  const [limit, setLimit] = useState<number>(8);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [alreadyAddToCart, setAlreadyAddToCart] = useState<boolean>(false);
  const [currentOrderDetail, setCurrentOrderDetail] =
    useState<OrderWithUserInfo | null>(null);
  const [currentOrderReview, setCurrentOrderReview] =
    useState<OrderWithUserInfo | null>(null);
  const {success, error } = useToastContext();
  const language = useI18nContext();
  const lang = language.of("ToastrSection");

  useEffect(() => {
    if (location.pathname !== "/products") {
      setPage(1);
      setSearchTerm("");
      setSelectedCategory("all");
      console.log("reset");
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!auth?.token) return;
    const fetchCart = async () => {
      try {
        setLoadingCart(true);
        const fetchedCart = await postFetcher.getCart(auth?.token);
        setCart(fetchedCart as unknown as ProductCart[]);
      } catch (err) {
        setErrorProduct("Failed to fetch cart");
      }
    };

    fetchCart();
  }, [auth?.token]);

  const fetchProductByPostId = useCallback(
    async (postId: string) => {
      if (!auth?.token) return;
      try {
        setLoading(true);
        const product = (await postFetcher.getProductByPostId(
          postId,
          auth?.token
        )) as unknown as ProductInfo;
        console.log(product);

        setProducts((prevProducts) => {
          const isProductExists = prevProducts.some(
            (p) => p._id === product._id
          );

          if (!isProductExists) {
            return [...prevProducts, product];
          }

          return [
            ...prevProducts.filter((p) => p._id !== product._id),
            product,
          ];
        });
        setCurrentProduct(product);
      } catch (err) {
        setErrorProduct("Failed to fetch product");
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
        setProducts((prevProducts) =>
          prevProducts.filter((p) => p.postId !== postId)
        );
      } catch (err) {
        setErrorProduct("Failed to remove product");
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
        setAlreadyAddToCart(true);
        const updatedCart = (await postFetcher.addProductToCart(
          productId,
          quantity,
          auth?.token
        )) as unknown as Cart;

        setCart(updatedCart.products);
      } catch (err) {
        setErrorProduct("Failed to add product to cart");
      } finally {
        setAlreadyAddToCart(false);
      }
    },
    [auth?.token]
  );

  const removeProductFromCart = useCallback(
    async (productIds: string[]) => {
      console.log(productIds);
      if (!auth?.token) return;
      try {
        setLoading(true);
        const updatedCart = (await postFetcher.removeProductFromCart(
          productIds,
          auth?.token
        )) as unknown as Cart;
        // success(lang("remove-cart-success"));
        setCart((prevCart) =>
          prevCart.filter((p) => productIds.indexOf(p.productId) === -1)
        );
      } catch (err) {
        setErrorProduct("Failed to remove product from cart");
        error(lang("remove-cart-fail"));
      } finally {
        setLoading(false);
      }
    },
    [auth?.token]
  );

  const searchProducts = useCallback(
    async (searchTerm: string, filter: string) => {
      if (!auth?.token) return;
      try {
        setLoading(true);
        setProducts([]);
        const fetchedProducts = (await postFetcher.searchProduct(
          searchTerm,
          filter === "all" ? "" : filter,
          page,
          limit,
          auth?.token
        )) as unknown as ProductList;
        setProducts(fetchedProducts.products);
        setTotalPages(fetchedProducts.totalPages);
      } catch (err) {
        setErrorProduct("Failed to search products");
      } finally {
        setLoading(false);
      }
    },
    [auth?.token, page, limit]
  );

  useEffect(() => {
    if (!auth?.token) return;
    searchProducts(searchTerm, selectedCategory);
  }, [auth?.token, page, searchTerm, selectedCategory, searchProducts]);

  const fetchOrdersByUser = useCallback(async () => {
    if (!auth?.token) return;
    try {
      setLoadingOrder(true);
      const fetchedOrders = (await postFetcher.getOrderByUser(
        auth?.token,
        pageUser,
        limit,
        statusUser
      )) as unknown as OrderListWithPagination;
      setOrdersByUser(fetchedOrders.orders);
      setTotalUserPages(fetchedOrders.totalPages);
    } catch (err) {
      setErrorProduct("Failed to fetch orders");
    } finally {
      setLoadingOrder(false);
    }
  }, [auth?.token, pageUser, statusUser]);

  const fetchOrderBySeller = useCallback(async () => {
    if (!auth?.token) return;
    try {
      setLoadingOrder(true);
      const fetchedOrders = (await postFetcher.getOrderBySeller(
        auth?.token,
        pageSeller,
        limit,
        statusSeller
      )) as unknown as OrderListWithPagination;
      setOrdersBySeller(fetchedOrders.orders);
      setTotalSellerPages(fetchedOrders.totalPages);
    } catch (err) {
      setErrorProduct("Failed to fetch orders");
    } finally {
      setLoadingOrder(false);
    }
  }, [auth?.token, pageSeller, statusSeller]);

  const createOrder = useCallback(
    async (orderInfo: OrderInfo) => {
      if (!auth?.token) return;
      try {
        setLoading(true);
        const result = (await postFetcher.createOrder(
          orderInfo,
          auth?.token
        )) as unknown as OrderWithUserInfo;
        success(lang("create-order-success"));
        setCurrentOrder(result);
        setOrdersByUser((prevOrders) => [...prevOrders, result]);
        return result;
      } catch (err) {
        setErrorProduct("Failed to create order");
        error(lang("create-order-fail"));
      } finally {
        setLoading(false);
      }
    },
    [auth?.token]
  );

  const fetchOrderById = useCallback(
    async (orderId: string) => {
      if (!auth?.token) return;
      try {
        setLoading(true);
        console.log("fetching order");
        const order = (await postFetcher.getOrderById(
          orderId,
          auth?.token
        )) as unknown as OrderWithUserInfo;
        setCurrentOrderDetail(order);
        setCurrentOrderReview(order);
      } catch (err) {
        setErrorProduct("Failed to fetch order");
      } finally {
        setLoading(false);
      }
    },
    [auth?.token]
  );

  const cancelOrder = useCallback(
    async (
      orderId: string,
      reason: string,
      isMyOrder: boolean,
      tab: string
    ) => {
      if (!auth?.token) return;
      try {
        setLoading(true);
        await postFetcher.cancelOrder(orderId, reason, auth?.token);
        if (isMyOrder) {
          if (tab === "All") {
            setOrdersByUser((prevOrders) =>
              prevOrders.map((order) =>
                order._id === orderId
                  ? { ...order, status: "Cancelled By User" }
                  : order
              )
            );
          } else if (tab === "Pending") {
            setOrdersByUser((prevOrders) =>
              prevOrders.filter((order) => order._id !== orderId)
            );
          }
        } else {
          if (tab === "All") {
            setOrdersBySeller((prevOrders) =>
              prevOrders.map((order) =>
                order._id === orderId
                  ? { ...order, status: "Cancelled By Seller" }
                  : order
              )
            );
          } else if (tab === "Pending") {
            setOrdersBySeller((prevOrders) =>
              prevOrders.filter((order) => order._id !== orderId)
            );
          }
        }
        success(lang("cancel-order-success"));
      } catch (err) {
        setErrorProduct("Failed to cancel order");
        error(lang("cancel-order-fail"));
      } finally {
        setLoading(false);
      }
    },
    [auth?.token]
  );

  const updateOrderStatus = useCallback(
    async (orderId: string, status: string, tab: string) => {
      if (!auth?.token) return;
      try {
        setLoading(true);
        await postFetcher.updateOrderStatus(orderId, auth?.token);
        if (tab === "All") {
          setOrdersBySeller((prevOrders) =>
            prevOrders.map((order) =>
              order._id === orderId ? { ...order, status } : order
            )
          );
        } else {
          setOrdersBySeller((prevOrders) =>
            prevOrders.filter((order) => order._id !== orderId)
          );
        }
        success(lang("update-status-success"));
      } catch (err) {
        setErrorProduct("Failed to update order status");
        error(lang("update-status-fail"));
      } finally {
        setLoading(false);
      }
    },
    [auth?.token]
  );

  const createOrderReview = useCallback(
    async (orderId: string, reviews: ReviewCreate[]) => {
      if (!auth?.token) return;
      try {
        setLoading(true);
        const result = await postFetcher.createReviewProduct(
          orderId,
          reviews,
          auth?.token
        );
        success(lang("submit-review-success"));
        setOrdersByUser((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, isReviewed: true } : order
          )
        );
        fetchOrderById(orderId);
      } catch (err) {
        setErrorProduct("Failed to submit reviews");
        error(lang("submit-review-fail"));
      } finally {
        setLoading(false);
      }
    },
    [auth?.token]
  );

  return (
    <ProductContext.Provider
      value={{
        searchTerm,
        setSearchTerm,
        searchProducts,
        totalPages,
        page,
        setPage,
        setLoading,
        currentProduct,
        setCurrentProduct,
        removeProductFromCart,
        addProductToCart,
        removeProduct,
        products,
        loading,
        errorProduct,
        cart,
        setCart,
        fetchProductByPostId,
        selectedCategory,
        setSelectedCategory,
        selectedItems,
        setSelectedItems,
        ordersBySeller,
        setOrdersBySeller,
        ordersByUser,
        setOrdersByUser,
        fetchOrderBySeller,
        fetchOrdersByUser,
        createOrder,
        currentOrder,
        setCurrentOrder,
        statusUser,
        statusSeller,
        limit,
        pageUser,
        pageSeller,
        totalSellerPages,
        totalUserPages,
        setLimit,
        setPageSeller,
        setPageUser,
        setStatusSeller,
        setStatusUser,
        setTotalSellerPages,
        setTotalUserPages,
        currentOrderDetail,
        setCurrentOrderDetail,
        fetchOrderById,
        loadingCart,
        setLoadingCart,
        loadingOrder,
        setLoadingOrder,
        updateOrderStatus,
        cancelOrder,
        alreadyAddToCart,
        setAlreadyAddToCart,
        currentOrderReview,
        setCurrentOrderReview,
        createOrderReview,
      }}
    >
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
