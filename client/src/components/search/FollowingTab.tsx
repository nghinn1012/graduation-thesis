import { useEffect, useRef, useState } from "react";
import { useSearchContext } from "../../context/SearchContext";
import Post from "../posts/PostInfo";
import PostSkeleton from "../skeleton/PostSkeleton";

const FollowingTab: React.FC = () => {
  const {
    posts,
    isLoading,
    loadMorePosts,
    hasMore,
    searchQuery
  } = useSearchContext();
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoading) {
          loadMorePosts();
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) observer.disconnect();
    };
  }, [loadMorePosts, isLoading, hasMore]);

  return (
    <div>
      <div>
        {!isLoading && posts.map((post) => (
          <Post key={post._id} post={post} />
        ))}
        {isLoading && (
          <>
          <PostSkeleton />
          <PostSkeleton />
          </>
        )}
      </div>

      {posts.length === 0 && !isLoading && !hasMore && (
        <p>No posts found for "{searchQuery}".</p>
      )}

      <div ref={observerRef} style={{ height: 20 }}></div>
    </div>
  );
};

export default FollowingTab;
