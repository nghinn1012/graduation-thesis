import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import UserList from "../users/UserList";
import FollowingTab from "../../components/search/FollowingTab";
import { useSearchContext } from "../../context/SearchContext";
import { useNavigate } from "react-router-dom";
import { useI18nContext } from "../../hooks/useI18nContext";
import { IoSettingsOutline } from "react-icons/io5";

const SearchPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("posts");
  const { searchQuery, setSearchQuery, setCurrentPage, fetchPosts } =
    useSearchContext();
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const language = useI18nContext();
  const lang = language.of("RightPanel");

  const handleSearch = () => {
    setSearchQuery(localSearchQuery);
    console.log("Searching for:", searchQuery);
    setCurrentPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
      navigate("/users/search?query=" + localSearchQuery);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "posts":
        return (
          <FollowingTab
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
          />
        );
      case "users":
        return <UserList />;
      default:
        return <p>No content available.</p>;
    }
  };

  const handleOpenFilters = () => {
    setIsModalOpen(true);
  };

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  return (
    <div className="mx-auto p-4">
      <div className="flex items-center gap-2 my-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={lang("search-placeholder")}
            className="truncate text-sm w-full pl-10 pr-4 py-3 rounded-md border border-gray-300 bg-gray-100 focus:outline-none
      focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out hover:bg-white"
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <FiSearch className="w-5 h-5 text-gray-400" />
          </span>
        </div>

        <div className="dropdown dropdown-end md:hidden">
          <label tabIndex={0} className="btn btn-ghost btn-circle">
            <IoSettingsOutline className="w-5 h-5" />
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <button className="w-full text-left" onClick={handleOpenFilters}>
                Filter options
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="tabs tabs-bordered" role="tablist">
        <a
          className={`tab ${activeTab === "posts" ? "tab-active" : ""}`}
          role="tab"
          onClick={() => setActiveTab("posts")}
        >
          {lang("posts")}
        </a>
        <a
          className={`tab ${activeTab === "users" ? "tab-active" : ""}`}
          role="tab"
          onClick={() => setActiveTab("users")}
        >
          {lang("users")}
        </a>
      </div>

      <div className="mt-4">{renderContent()}</div>
    </div>
  );
};

export default SearchPage;
