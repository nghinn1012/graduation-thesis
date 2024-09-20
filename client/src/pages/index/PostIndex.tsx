import React from "react";
import { Route, Routes } from "react-router-dom";
import PostDetails from "../post/PostDetail";
import ScrollToTop from "../../components/common/ScrollToTop";
import ShoppingList from "../shoppingList/ShoppingList";
export default function Food() {
  return (
    <>
    <ScrollToTop/>
    <Routes>
      <Route path="/:id" element={<PostDetails />} />
    </Routes>
    </>
  );
}
