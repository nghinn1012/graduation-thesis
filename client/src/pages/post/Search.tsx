// SearchPage.tsx
import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";
import UserList from "../users/UserList";
import FollowingTab from "../../components/search/FollowingTab";
import { useSearchContext } from "../../context/SearchContext";

const SearchPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("following");
  const { searchQuery, setSearchQuery } = useSearchContext();
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchQuery(e.currentTarget.value);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "following":
      case "recent":
        return <FollowingTab />;
      case "users":
        return <UserList />;
      default:
        return <p>No content available.</p>;
    }
  };

  return (
    <div className="mx-auto p-4">
      <div className="relative my-4">
        <input
          type="text"
          placeholder="Search posts, users, ingredients..."
          className="w-full pl-10 pr-4 py-3 rounded-md border border-gray-300 bg-gray-100 focus:outline-none
          focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out hover:bg-white"
          onKeyDown={handleKeyDown} 
        />
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <FiSearch className="w-5 h-5 text-gray-400" />
        </span>
      </div>

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

      <div className="mt-4">{renderContent()}</div>
    </div>
  );
};

export default SearchPage;
