import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";
import Posts from "../../components/posts/PostsList";
import UserList from "../users/UserList";

const SearchPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("following");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const renderContent = () => {
    console.log("Rendering content for tab: ", activeTab);
    switch (activeTab) {
      case "following":
        return <Posts/>;
      case "recent":
        return <Posts/>;
      case "users":
        return <UserList/>;
      default:
        return <p>Không có nội dung.</p>;
    }
  };

  return (
    <div className="mx-auto p-4">
      {/* Khung tìm kiếm */}
      <div className="relative my-4">
        <input
          type="text"
          placeholder="Search posts, users, ingredients..."
          className="w-full pl-10 pr-4 py-3 rounded-md border border-gray-300 bg-gray-100 focus:outline-none
          focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out hover:bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <FiSearch className="w-5 h-5 text-gray-400" />
        </span>
      </div>

      {/* Khung với các tab */}
      <div className="tabs tabs-bordered" role="tablist">
        <a
          className={`tab ${activeTab === "following" ? "tab-active" : ""}`}
          role="tab"
          onClick={() => setActiveTab("following")}
        >
          Following
        </a>
        <a
          className={`tab ${activeTab === "recent" ? "tab-active" : ""}`}
          role="tab"
          onClick={() => setActiveTab("recent")}
        >
          Recent
        </a>
        <a
          className={`tab ${activeTab === "users" ? "tab-active" : ""}`}
          role="tab"
          onClick={() => setActiveTab("users")}
        >
          Users
        </a>
      </div>

      {/* Nội dung của tab */}
      <div className="mt-4">{renderContent()}</div>
    </div>
  );
};

export default SearchPage;
