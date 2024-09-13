import React from "react";
import { Route, Routes } from "react-router-dom";
import PostDetails from "./PostDetail";
import ScrollToTop from "../../components/common/ScrollToTop";
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
