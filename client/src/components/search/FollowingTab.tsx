import React, { useEffect, useRef, useCallback } from "react";
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
    totalPages
  } = useSearchContext();

  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const fetchInitialPosts = async () => {
      setSearchQuery("");
      setCurrentPage(1);
      await searchPosts(1);
    };
    fetchInitialPosts();
  }, []);

  const lastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && currentPage < totalPages) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, currentPage, totalPages, setCurrentPage]
  );

  useEffect(() => {
    if (currentPage <= totalPages) {
      searchPosts(currentPage);
    }
  }, [currentPage, searchQuery, searchPosts, totalPages]);

  const hasMore = currentPage < totalPages;

  if (posts.length === 0 && !isLoading) {
    return <div className="text-center my-4">No posts found.</div>;
  }

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
