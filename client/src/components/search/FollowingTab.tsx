import React, { useEffect, useRef, useCallback } from "react";
import PostSkeleton from "../skeleton/PostSkeleton";
import { useSearchContext } from "../../context/SearchContext";
import Post from "../posts/PostInfo";

const FollowingTab: React.FC = () => {
  const {
    searchQuery,
    posts,
    isLoading,
    setSearchQuery,
    searchPosts,
    currentPage,
    setCurrentPage,
    totalPages
  } = useSearchContext();

  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const fetchInitialPosts = async () => {
      setSearchQuery(searchQuery); // Clear search query on initial load
      setCurrentPage(1); // Reset to first page
      await searchPosts(1); // Fetch the first page of posts
    };
    fetchInitialPosts();
  }, [setSearchQuery, setCurrentPage, searchPosts]);

  const lastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || !node) return; // Prevent observer if loading or no node

      if (observer.current) observer.current.disconnect(); // Disconnect previous observer

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && currentPage < totalPages) {
          setCurrentPage((prevPage) => prevPage + 1); // Load next page if intersecting
        }
      });

      observer.current.observe(node); // Observe the last post
    },
    [isLoading, currentPage, totalPages, setCurrentPage]
  );

  useEffect(() => {
    if (currentPage > 1) { // Prevent fetching on initial load
      searchPosts(currentPage);
    }
  }, [currentPage, searchPosts]);

  const hasMore = currentPage < totalPages; // Check if there are more pages to load

  if (posts.length === 0 && !isLoading) {
    return <div className="text-center my-4">No posts found.</div>; // Message for no posts
  }

  return (
    <>
      {isLoading && posts.length === 0 && ( // Loading state when no posts
        <div className="flex justify-center my-4">
          <PostSkeleton />
        </div>
      )}
      {posts.length > 0 && ( // Render posts if available
        <div>
          {posts.map((post, index) => (
            <div
              key={post._id}
              ref={index === posts.length - 1 ? lastPostRef : null} // Attach ref to last post
            >
              <Post post={post} />
            </div>
          ))}
        </div>
      )}
      {isLoading && posts.length > 0 && ( // Loading state while posts are being fetched
        <div className="flex justify-center my-4">
          <PostSkeleton />
        </div>
      )}
      {!isLoading && !hasMore && posts.length > 0 && ( // Message for no more posts
        <div className="text-center my-4">No more posts to load.</div>
      )}
    </>
  );
};

export default FollowingTab;
