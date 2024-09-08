import React from "react";
import { Route, Routes } from "react-router-dom";
import PostDetails from "./PostDetail";
export default function Food() {
  return (
    <Routes>
      <Route path="/:id" element={<PostDetails />} />
    </Routes>
  );
}
