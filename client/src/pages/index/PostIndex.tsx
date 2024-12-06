import React from "react";
import { Route, Routes } from "react-router-dom";
import PostDetails from "../post/PostDetail";
import ScrollToTop from "../../components/common/ScrollToTop";
import Explore from "../post/Explore";
import ProductPage from "../post/Purchase";
import ProductListPage from "../product/ProductList";
import SavedListPage from "../savePost/SavedListPage";

export default function Food() {
  return (
    <div className="p-4">
      <ScrollToTop />
      <Routes>
        <Route path="/:id" element={<PostDetails />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/productDetails/:productId" element={<ProductPage />} />
        <Route path="/savedList" element={<SavedListPage />} />
      </Routes>
    </div>
  );
}
