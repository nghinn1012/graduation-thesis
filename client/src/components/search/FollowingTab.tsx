import React, { useEffect, useRef, useCallback, useState } from "react";
import PostSkeleton from "../skeleton/PostSkeleton";
import { useSearchContext } from "../../context/SearchContext";
import Post from "../posts/PostInfo";

const FollowingTab: React.FC = () => {
  const {
    posts,
    isLoading,
    setSearchQuery,
    searchQuery,
    searchPosts,
    currentPage,
    setCurrentPage,
  } = useSearchContext();
  const observer = useRef<IntersectionObserver | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const prevPostsLengthRef = useRef(0);

  const lastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  useEffect(() => {
    setCurrentPage(0);
    setHasMore(true);
    prevPostsLengthRef.current = 0;
  }, [searchQuery, setCurrentPage]);

  useEffect(() => {
    if (currentPage === 0 || hasMore) {
      searchPosts(currentPage);
    }
  }, [currentPage, searchPosts, hasMore]);

  useEffect(() => {
    if (!isLoading) {
      if (posts.length === prevPostsLengthRef.current) {
        setHasMore(false);
        setSearchQuery("");
      } else {
        prevPostsLengthRef.current = posts.length;
      }
    }
  }, [isLoading, posts]);

  return (
    <>
      {isLoading && posts.length === 0 && (
        <div className="flex justify-center my-4">
          <PostSkeleton />
        </div>
      )}
      {posts.length > 0 && (
        <div>
          {posts.map((post, index) => (
            <div
              key={post._id}
              ref={index === posts.length - 1 ? lastPostRef : null}
            >
              <Post post={post} />
            </div>
          ))}
        </div>
      )}
      {isLoading && posts.length > 0 && (
        <div className="flex justify-center my-4">
          <PostSkeleton />
        </div>
      )}
      {!isLoading && !hasMore && posts.length > 0 && (
        <div className="text-center my-4">No more posts to load.</div>
      )}
    </>
  );
};

export default FollowingTab;
