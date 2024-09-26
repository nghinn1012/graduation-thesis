import React from "react";
import { Route, Routes } from "react-router-dom";
import ShoppingList from "../shoppingList/ShoppingList";
import ScrollToTop from "../../components/common/ScrollToTop";
import MealPlanner from "../meal_planner/MealPlanner";
import SearchPage from "../post/Search";
export default function User() {
  return (
    <>
    <ScrollToTop/>
    <Routes>
      <Route path="/shoppingList" element={<ShoppingList />} />
      <Route path="/mealPlanner" element={<MealPlanner />} />
      <Route path="/search" element={<SearchPage />} />
    </Routes>
    </>
  );
}
