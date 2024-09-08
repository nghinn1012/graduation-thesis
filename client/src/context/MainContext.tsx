import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import Sidebar from "../components/common/Sidebar";
import React from "react";
import RightPanel from "../components/common/RightPanel";
import HomePage from "../pages/home/HomePage";
import PostIndex from "../pages/post/PostIndex";
import PostDetails from "../pages/post/PostDetail";

export default function AppMainCenter() {
  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/post/*" element={<PostIndex />} />
      </Routes>
    </div>
  );
}
