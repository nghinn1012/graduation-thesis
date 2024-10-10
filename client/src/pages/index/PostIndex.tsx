import React from "react";
import { Route, Routes } from "react-router-dom";
import PostDetails from "../post/PostDetail";
import ScrollToTop from "../../components/common/ScrollToTop";
import Explore from "../post/Explore";
import OrderDishPage from "../post/Purchase";
export default function Food() {
  return (
    <>
    <ScrollToTop/>
    <Routes>
      <Route path="/:id" element={<PostDetails />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/order-dish" element={<OrderDishPage />} />
    </Routes>
    </>
  );
}
