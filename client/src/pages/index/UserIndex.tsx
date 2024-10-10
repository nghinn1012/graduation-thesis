import React from "react";
import { Route, Routes } from "react-router-dom";
import ShoppingList from "../shoppingList/ShoppingList";
import ScrollToTop from "../../components/common/ScrollToTop";
import MealPlanner from "../meal_planner/MealPlanner";
import SearchPage from "../post/Search";
import ProfilePage from "../users/Profile";
import NotificationPage from "../notification/NotificationPage";
export default function User() {
  return (
    <div className="p-4">
      <ScrollToTop />
      <Routes>
        <Route path="/shoppingList" element={<ShoppingList />} />
        <Route path="/mealPlanner" element={<MealPlanner />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationPage />} />
      </Routes>
    </div>
  );
}
