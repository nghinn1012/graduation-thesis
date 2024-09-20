import React from "react";
import { Route, Routes } from "react-router-dom";
import ShoppingList from "../shoppingList/ShoppingList";
import ScrollToTop from "../../components/common/ScrollToTop";
export default function User() {
  return (
    <>
    <ScrollToTop/>
    <Routes>
      <Route path="/shoppingList" element={<ShoppingList />} />
    </Routes>
    </>
  );
}
