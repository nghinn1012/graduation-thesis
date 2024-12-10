import { useEffect, useState } from "react";
import CreatePostBox from "../../components/posts/CreatePostBox";
import React from "react";
import Posts from "../../components/posts/PostsList";
import FollowingHomeTab from "../../components/posts/FollowingHomeTab";
import CreatePostBoxSkeleton from "../../components/skeleton/CreatePostBoxSkeleton";
import { useI18nContext } from "../../hooks/useI18nContext";

const PostSkeleton = () => {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-6 w-1/4 bg-gray-200 rounded"></div>
        <div className="h-6 w-1/4 bg-gray-200 rounded"></div>
      </div>
      <div className="h-64 bg-gray-200 rounded"></div>
      <div className="flex justify-between items-center">
        <div className="h-6 w-1/4 bg-gray-200 rounded"></div>
        <div className="h-6 w-1/4 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const [feedType, setFeedType] = useState("forYou");
  const [loading, setLoading] = useState(true);
	const language = useI18nContext();
	const lang = language.of("HomePage");
  const [isI18nReady, setIsI18nReady] = useState(false);

  useEffect(() => {
    if (lang("for-you") !== "for-you") {
      setIsI18nReady(true);
    }
  }, [lang]);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  if (!isI18nReady) {
    return <></>;
  }

  return (
    <>
      <div className="flex-[4_4_0] mr-auto border-r border-gray-300 min-h-screen">
        {/* Header */}
        <div className="flex w-full border-b border-gray-300">
          <div
            className={
              "flex justify-center flex-1 p-3 hover:bg-slate-200 transition duration-300 cursor-pointer relative"
            }
            onClick={() => setFeedType("forYou")}
          >
            {lang("for-you")}
            {feedType === "forYou" && (
              <div className="absolute bottom-0 w-10 h-1 rounded-full bg-gray-800"></div>
            )}
          </div>
          <div
            className="flex justify-center flex-1 p-3 hover:bg-slate-200 transition duration-300 cursor-pointer relative"
            onClick={() => setFeedType("following")}
          >
            {lang("following")}
            {feedType === "following" && (
              <div className="absolute bottom-0 w-10 h-1 rounded-full bg-gray-800"></div>
            )}
          </div>
        </div>

        {/*  CREATE POST INPUT */}
				{loading ? (
					<CreatePostBoxSkeleton />
				) : (
					<CreatePostBox />
				)}

        {/* POSTS */}
        {loading ? (
          <PostSkeleton />
        ) : (
          <>
            {feedType === "forYou" && <Posts />}
            {feedType === "following" && <FollowingHomeTab />}
          </>
        )}
      </div>
    </>
  );
};

export default HomePage;
