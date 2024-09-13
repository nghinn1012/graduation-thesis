import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/home/HomePage";
import PostIndex from "../pages/post/PostIndex";
import MyComponent from "../pages/profile/ProfilePage";

export default function AppMainCenter() {
  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/post/*" element={<PostIndex />} />
        <Route path="/profile" element={<MyComponent/>} />
      </Routes>
    </div>
  );
}
