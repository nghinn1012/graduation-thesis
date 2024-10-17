import { Link, useLocation, useNavigate } from "react-router-dom";
import RightPanelSkeleton from "../skeleton/RightPanelSkeleton";
import React, { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { Range } from "react-range";
import { useSearchContext } from "../../context/SearchContext";
import { useUserContext } from "../../context/UserContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useFollowContext } from "../../context/FollowContext";
import { useProfileContext } from "../../context/ProfileContext";
import { AccountInfo } from "../../api/user";

interface User {
  _id: string;
  username: string;
  name: string;
  avatar?: string;
}

const RightPanel: React.FC = () => {
  const isLoading = false;
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const {
    searchQuery,
    cookingTimeRange,
    setCookingTimeRange,
    setMinQuality,
    minQuality,
    setCurrentPage,
    setPosts,
    haveMade,
    setHaveMade,
    difficulty,
    setDifficulty,
    hashtagsSearch,
    setHashtagsSearch,
  } = useSearchContext();
  const { suggestUsers, fetchSuggestions, setSuggestUsers } = useUserContext();
  const { followUser } = useFollowContext();
  const [localCookingTimeRange, setLocalCookingTimeRange] = useState<
    (number | string)[]
  >([0, 1440]);
  const [rating, setRating] = useState<number | null>(minQuality);
  const [selectedDifficulties, setSelectedDifficulties] = useState({
    easy: difficulty.includes("easy"),
    medium: difficulty.includes("medium"),
    hard: difficulty.includes("hard"),
  });
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [haveMadeOn, setHaveMadeOn] = useState(false);
  const { auth } = useAuthContext();
  const navigate = useNavigate();
  const { user, setUser } = useProfileContext();

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleHashtagKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter" && hashtagInput.trim() !== "") {
      setHashtags((prev) => [...prev, hashtagInput.trim()]);
      setHashtagInput("");
    }
  };

  const handleRemoveHashtag = (hashtagToRemove: string) => {
    setHashtags((prev) =>
      prev.filter((hashtag) => hashtag !== hashtagToRemove)
    );
    console.log(hashtags);
  };

  const handleCheckboxChange = (event: any) => {
    const { name, checked } = event.target;
    setSelectedDifficulties((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };
  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  useEffect(() => {
    setLocalCookingTimeRange(cookingTimeRange);
    setRating(minQuality);
    setHaveMadeOn(haveMade);
    setSelectedDifficulties({
      easy: difficulty.includes("easy"),
      medium: difficulty.includes("medium"),
      hard: difficulty.includes("hard"),
    });
    setHashtags(hashtagsSearch);
  }, [cookingTimeRange, minQuality, haveMade, difficulty, hashtagsSearch]);

  const handleInputChange = (index: number, value: string) => {
    const newCookingTimeRange = [...cookingTimeRange];
    if (value === "") {
      newCookingTimeRange[index] = "";
    } else {
      newCookingTimeRange[index] = Number(value);
    }
    setLocalCookingTimeRange(newCookingTimeRange);
  };

  const handleArrayOfDifficulties = () => {
    const difficulties = [];
    if (selectedDifficulties.easy) {
      difficulties.push("easy");
    }
    if (selectedDifficulties.medium) {
      difficulties.push("medium");
    }
    if (selectedDifficulties.hard) {
      difficulties.push("hard");
    }
    return difficulties;
  };

  const handleFilterSubmit = () => {
    console.log(hashtags, hashtagsSearch);

    const params = new URLSearchParams();
    params.append("searchQuery", searchQuery);
    if (localCookingTimeRange)
      params.append("cookingTimeRangeMin", localCookingTimeRange[0].toString());
    if (localCookingTimeRange)
      params.append("cookingTimeRangeMax", localCookingTimeRange[1].toString());
    if (rating !== null && rating !== undefined)
      params.append("minQuality", rating.toString());
    if (haveMadeOn !== null && haveMadeOn !== undefined)
      params.append("haveMade", haveMadeOn.toString());
    if (handleArrayOfDifficulties())
      params.append("difficulty", difficulty.join(","));
    if (hashtags?.length > 0) params.append("hashtags", hashtags.join(","));

    if (
      localCookingTimeRange !== cookingTimeRange ||
      minQuality !== rating ||
      haveMade !== haveMadeOn ||
      handleArrayOfDifficulties() !== difficulty ||
      hashtags !== hashtagsSearch
    ) {
      setCurrentPage(1);
      setPosts([]);
    }

    setCookingTimeRange(localCookingTimeRange);
    setMinQuality(rating || 0);
    setHaveMade(haveMadeOn);
    setDifficulty(handleArrayOfDifficulties());
    setHashtagsSearch(hashtags || []);

    const newUrl = `/users/search?${params.toString()}`;
    navigate(newUrl);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours} hour${hours > 1 ? "s" : ""}` : ""} ${
      mins > 0 ? `${mins} minute${mins > 1 ? "s" : ""}` : ""
    }`;
  };

  const handleFollowUser = (userId: string, event: any) => {
    event.preventDefault();
    followUser(userId);
    setSuggestUsers(suggestUsers.filter((user: User) => user._id !== userId));
    setUser({
      ...user,
      following: [...(user?.following || []), userId],
    } as unknown as AccountInfo);
  };

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
        <div className="rounded-md border border-gray-300 p-6 mt-12 bg-white shadow-md">
          <h2 className="text-lg font-bold mb-4">Search Filters</h2>

          <div className="mb-4">
            <label className="block text-gray-600 font-medium mb-2">
              Cooking Time (in minutes)
            </label>

            {/* Range Slider */}
            <Range
              step={1}
              min={0}
              max={1440}
              values={localCookingTimeRange.map((value) =>
                typeof value === "string" ? 0 : value
              )}
              onChange={(newCookingTimeRange) =>
                setLocalCookingTimeRange(newCookingTimeRange)
              }
              renderTrack={({ props, children }) => (
                <div
                  {...props}
                  style={{
                    ...props.style,
                    height: "6px",
                    width: "100%",
                    backgroundColor: "#ccc",
                  }}
                >
                  {children}
                </div>
              )}
              renderThumb={({ props }) => {
                const { key, ...otherProps } = props;

                return (
                  <div
                    {...otherProps}
                    key={key}
                    style={{
                      ...otherProps.style,
                      height: "20px",
                      width: "20px",
                      backgroundColor: "#007bff",
                      borderRadius: "50%",
                    }}
                  />
                );
              }}
            />

            <div className="flex justify-between mt-2">
              <div className="flex flex-col gap-1">
                <input
                  type="number"
                  placeholder="From"
                  className="w-20 text-sm px-2 py-1 border border-gray-300 rounded-md"
                  min={0}
                  max={1440}
                  value={
                    localCookingTimeRange[0] === ""
                      ? ""
                      : localCookingTimeRange[0]
                  }
                  onChange={(e) => handleInputChange(0, e.target.value)}
                />
                <span
                  className="text-sm text-gray-500"
                  style={{ width: "80px" }}
                >
                  {localCookingTimeRange[0] !== ""
                    ? formatTime(Number(localCookingTimeRange[0]))
                    : "0 minute"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <input
                  type="number"
                  placeholder="To"
                  className="w-20 text-sm px-2 py-1 border border-gray-300 rounded-md"
                  min={0}
                  max={1440}
                  value={
                    localCookingTimeRange[1] === ""
                      ? ""
                      : localCookingTimeRange[1]
                  }
                  onChange={(e) => handleInputChange(1, e.target.value)}
                />
                <span
                  className="text-sm text-gray-500 text-right"
                  style={{ width: "80px" }}
                >
                  {localCookingTimeRange[1] !== ""
                    ? formatTime(Number(localCookingTimeRange[1]))
                    : "0 minute"}
                </span>
              </div>
            </div>

            <hr className="my-2 border-gray-300" />

            {/* Search by Rating */}
            <div className="mb-4">
              <label className="block text-gray-600 font-medium mb-2">
                Min Rating
              </label>
              <div className="flex items-center">
                <div className="flex items-center">
                  {Array.from({ length: 5 }, (_, index) => (
                    <span
                      key={index}
                      className={`cursor-pointer text-3xl mx-2 ${
                        index < (rating || 0)
                          ? "text-yellow-500"
                          : "text-gray-300"
                      }`}
                      onClick={() => handleRatingClick(index + 1)}
                    >
                      ★
                    </span>
                  ))}
                  <button
                    className={`btn ${
                      rating === 0
                        ? "bg-blue-300 border-blue-300"
                        : "bg-gray-300 border-gray-300"
                    } btn-sm cursor-pointer px-3 py-1 text-sm mx-2`}
                    onClick={() => handleRatingClick(0)}
                  >
                    All
                  </button>
                </div>
              </div>
            </div>

            <hr className="my-2 border-gray-300" />

            <div className="mb-4">
              <label className="block text-gray-600 font-medium mb-2">
                Difficulty Level
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  className={`btn btn-ghost h-8 text-sm ${
                    selectedDifficulties.easy ? "bg-blue-300" : "bg-gray-200"
                  }`}
                  onClick={() =>
                    handleCheckboxChange({
                      target: {
                        name: "easy",
                        checked: !selectedDifficulties.easy,
                      },
                    })
                  }
                >
                  Easy
                </button>
                <button
                  type="button"
                  className={`btn btn-ghost h-8 text-sm ${
                    selectedDifficulties.medium ? "bg-blue-300" : "bg-gray-200"
                  }`}
                  onClick={() =>
                    handleCheckboxChange({
                      target: {
                        name: "medium",
                        checked: !selectedDifficulties.medium,
                      },
                    })
                  }
                >
                  Medium
                </button>
                <button
                  type="button"
                  className={`btn btn-ghost h-8 text-sm ${
                    selectedDifficulties.hard ? "bg-blue-300" : "bg-gray-200"
                  }`}
                  onClick={() =>
                    handleCheckboxChange({
                      target: {
                        name: "hard",
                        checked: !selectedDifficulties.hard,
                      },
                    })
                  }
                >
                  Hard
                </button>
              </div>
            </div>

            <hr className="my-2 border-gray-300" />

            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="block text-gray-600 font-medium">
                  Haved made this recipe
                </span>
                <input
                  type="checkbox"
                  className="toggle"
                  checked={haveMadeOn}
                  onChange={() => setHaveMadeOn(!haveMadeOn)}
                />
              </label>
            </div>

            <hr className="my-2 border-gray-300" />

            <div className="mt-4">
              <label className="block text-gray-600 font-medium mb-2">
                Filter by Hashtags
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Enter a hashtag"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyDown={handleHashtagKeyDown}
                  className="input input-bordered mr-2"
                />
              </div>
              <div className="mt-2 flex flex-wrap max-w-[230px]">
                {hashtags.map((hashtag, index) => (
                  <div
                    key={index}
                    className="badge badge-success text-white mr-2 mb-2 cursor-pointer"
                    onClick={() => handleRemoveHashtag(hashtag)}
                  >
                    {hashtag} ✕
                  </div>
                ))}
              </div>
            </div>

            {/* Filter Button */}
            <div className="mt-4">
              <button
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={handleFilterSubmit}
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {location.pathname !== "/message" && location.pathname !== "/products" && (
        <div className="mt-8 p-4 rounded-md border border-gray-300">
          <p className="font-bold my-4">Who to follow</p>
          <div className="flex flex-col gap-6">
            {/* Loading State */}
            {isLoading ||
              (!suggestUsers && (
                <>
                  <RightPanelSkeleton />
                  <RightPanelSkeleton />
                  <RightPanelSkeleton />
                  <RightPanelSkeleton />
                </>
              ))}

            {/* User List */}
            {!isLoading &&
              suggestUsers.slice(0, 5).map((user: User) => (
                <div
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
                      <Link
                        to={`/users/profile/${user._id}`}
                        className="font-semibold tracking-tight truncate w-40"
                      >
                        {user.name}
                      </Link>
                      <span className="text-sm text-slate-500">
                        @{user.username}
                      </span>
                    </div>
                  </div>
                  <div>
                    <button
                      className="btn btn-neutral text-white hover:bg-white hover:opacity-90 rounded-full btn-sm"
                      onClick={(event) => handleFollowUser(user._id, event)}
                    >
                      Follow
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RightPanel;
