import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/home/HomePage";
import PostIndex from "../pages/index/PostIndex";
import UserIndex from "../pages/index/UserIndex";
import MessageTab from "../pages/message/MessageTab";
import ProductListPage from "../pages/product/ProductList";
import Cart from "../pages/product/Cart";

export default function AppMainCenter() {
  return (
    <div className="flex-1 overflow-y-auto px-4">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/message" element={<MessageTab />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/posts/*" element={<PostIndex />} />
        <Route path="/users/*" element={<UserIndex />} />
      </Routes>
    </div>
  );
}
