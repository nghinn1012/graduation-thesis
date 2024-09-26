import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";
import Posts from "../../components/posts/PostsList";
import UserList from "../users/UserList";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { postFetcher, searchPostData } from "../../api/post";
import { useAuthContext } from "../../hooks/useAuthContext";

const SearchPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("following");
  const [searchType, setSearchType] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any>({});
  const navigate = useNavigate();
  const {auth} = useAuthContext();

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (!auth?.token) return;
    if (e.key === "Enter") {
      if (!searchType) return;
      try {
        const response = await postFetcher.searchPost(searchType, auth.token) as unknown as searchPostData;
        setSearchResults(response.posts);
        navigate(`/users/search?searchTerm=${encodeURIComponent(searchType)}`);
      } catch (error) {
        console.error("Search error:", error);
      }
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "following":
      case "recent":
        return <Posts postsSearch={searchResults} locationPath={location.pathname}/>;
      case "users":
        return <UserList />;
      default:
        return <p>Không có nội dung.</p>;
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
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
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
