import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/home/HomePage";
import PostIndex from "../pages/index/PostIndex";
import UserIndex from "../pages/index/UserIndex";
import MessageTab from "../pages/message/MessageTab";
import ProductListPage from "../pages/product/ProductList";
import CartPage from "../pages/product/Cart";
import OrderInfoPage from "../pages/product/OrderInfoPage";
import PaymentSuccess from "../pages/product/PaymentSuccess";
import OrdersPage from "../pages/product/OrderList";
import OrderDetails from "../pages/product/OrderDetail";
import ForgotPasswordPage from "../pages/auth/verify/ForgotPassword";
import ResetPasswordPage from "../pages/auth/verify/ResetPasswordPage";
import NotFoundPage from "../common/auth/NotFoundPage";

export default function AppMainCenter() {
  return (
    <div className="flex-1 overflow-y-auto px-4">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/message" element={<MessageTab />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/checkout" element={<OrderInfoPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/posts/*" element={<PostIndex />} />
        <Route path="/users/*" element={<UserIndex />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:orderId" element={<OrderDetails />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}
