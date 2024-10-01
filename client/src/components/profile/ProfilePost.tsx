import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import PostSkeleton from "../skeleton/PostSkeleton";
import Post from "../posts/PostInfo";
import { PostInfo } from "../../api/post";
import { usePostContext } from "../../context/PostContext";

const ProfilePost: React.FC = () => {
  const {
    posts,
    isLoading,
    setPosts,
    fetchLikedPosts,
    fetchPosts,
    fetchSavedPosts,
    setIsLoading,
    userId,
    loadMorePosts,
    hasMore,
    page,
    setPage
  } = usePostContext();

  const [error, setError] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const location = useLocation();
  const postAuthor = location.state?.postAuthor;
  const updatedPost = location.state?.updatedPost;
  const prevUserIdRef = useRef(userId);

  useEffect(() => {
    if (updatedPost && setPosts) {
      setPosts((prevPosts: PostInfo[]) =>
        prevPosts.map((post) =>
          post._id === updatedPost._id
            ? { ...updatedPost, author: postAuthor }
            : post
        )
      );
    }
  }, [updatedPost, postAuthor, setPosts]);

  useEffect(() => {
    if (prevUserIdRef.current !== userId) {
      if (setPosts) setPosts([]);
      if (setPage) setPage(1);
      prevUserIdRef.current = userId;
    }

    const loadData = async () => {
      if (!setIsLoading) return;

      setIsLoading(true);
      setError(null);

      try {
        await fetchPosts();
        await Promise.all([fetchLikedPosts(), fetchSavedPosts()]);
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Failed to load posts. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [fetchPosts, fetchLikedPosts, fetchSavedPosts, setIsLoading, userId, setPosts, setPage]);

  useEffect(() => {
    if (!observer.current) {
      observer.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isLoading && hasMore) {
            loadMorePosts();
          }
        },
        {
          root: null,
          rootMargin: "20px",
          threshold: 0.1,
        }
      );
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [isLoading, hasMore, loadMorePosts]);

  const lastPostRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;

    if (observer.current) {
      observer.current.disconnect();
    }

    if (node && hasMore) {
      observer.current?.observe(node);
    }
  }, [isLoading, hasMore]);

  if (error) {
    return (
      <div className="text-red-500 text-center my-4 p-4">
        <p>{error}</p>
        <button
          onClick={() => fetchPosts()}
          className="mt-2 px-4 py-2 bg-primary text-white rounded-full hover:bg-opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 my-4">
      {isLoading && posts.length === 0 && (
        <>
          {[...Array(3)].map((_, index) => (
            <PostSkeleton key={index} />
          ))}
        </>
      )}

      {posts.map((post, index) => (
        <div
          key={post._id}
          ref={index === posts.length - 1 ? lastPostRef : null}
        >
          <Post post={post} />
        </div>
      ))}

      {isLoading && posts.length > 0 && <PostSkeleton />}

      {!isLoading && posts.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No posts found
        </div>
      )}
    </div>
  );
};

export default ProfilePost;
