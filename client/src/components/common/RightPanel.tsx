import { Link, useLocation } from "react-router-dom";
import RightPanelSkeleton from "../skeleton/RightPanelSkeleton";
import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";

const USERS_FOR_RIGHT_PANEL = [
  {
    _id: "1",
    username: "user1",
    name: "John Doe",
    avatar: "https://random.imagecdn.app/500/150",
  },
  {
    _id: "2",
    username: "user2",
    name: "VnExpress",
    avatar: "https://random.imagecdn.app/500/150",
  },
  {
    _id: "3",
    username: "user3",
    name: "Neil deGrasse Tyson",
    avatar: "https://random.imagecdn.app/500/150",
  },
  {
    _id: "4",
    username: "user4",
    name: "Elon Musk",
    avatar: "https://random.imagecdn.app/500/150",
  },
];

interface User {
  _id: string;
  username: string;
  name: string;
  avatar?: string;
}

const RightPanel = () => {
  const isLoading = false;
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();

  const filteredUsers = USERS_FOR_RIGHT_PANEL.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="hidden lg:block">
      {location.pathname === "/" && (
        <div className="relative mt-4">
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
      )}

      {location.pathname === "/users/search" && (
      <div className="rounded-md border border-gray-300 p-6 mt-12">
      <h2 className="text-lg font-bold mb-4">Search filters</h2>
    </div>)}

      <div className="mt-8 p-4 rounded-md border border-gray-300">
        <p className="font-bold my-4">Who to follow</p>
        <div className="flex flex-col gap-6">
          {/* Loading State */}
          {isLoading && (
            <>
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
            </>
          )}

          {/* User List */}
          {!isLoading &&
            filteredUsers.map((user: User) => (
              <Link
                to={`/profile/${user.username}`}
                className="flex items-center justify-between gap-4"
                key={user._id}
              >
                <div className="flex gap-2 items-center">
                  <div className="avatar">
                    <div className="w-8 rounded-full">
                      <img src={user.avatar || "/avatar-placeholder.png"} />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold tracking-tight truncate w-40">
                      {user.name}
                    </span>
                    <span className="text-sm text-slate-500">
                      @{user.username}
                    </span>
                  </div>
                </div>
                <div>
                  <button
                    className="btn btn-neutral text-white hover:bg-white hover:opacity-90 rounded-full btn-sm"
                    onClick={(e) => e.preventDefault()}
                  >
                    Follow
                  </button>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
