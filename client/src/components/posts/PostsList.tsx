import React, { useCallback, useEffect, useRef } from "react";
import PostSkeleton from "../skeleton/PostSkeleton";
import Post from "./PostInfo";
import { usePostContext } from "../../context/PostContext";
import { useLocation } from "react-router-dom";

const Posts: React.FC = () => {
  const { posts, isLoading, hasMore, loadMorePosts, setPosts } = usePostContext();
  const observer = useRef<IntersectionObserver | null>(null);
  const location = useLocation();
  const postAuthor = location.state?.postAuthor;
  const updatedPost = location.state?.updatedPost;

  // Update posts when updatedPost changes
  useEffect(() => {
    if (updatedPost && setPosts) {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === updatedPost._id ? { ...updatedPost, author: postAuthor } : post
        )
      );
    }
  }, [updatedPost, postAuthor, setPosts]);

  // Infinite scroll setup
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
          rootMargin: "0px",
          threshold: 1.0,
        }
      );
    }

    const loader = document.getElementById("loader");
    if (loader) {
      observer.current.observe(loader);
    }

    return () => {
      if (loader) {
        observer.current?.unobserve(loader);
      }
    };
  }, [isLoading, hasMore, loadMorePosts]);

  // Create a ref for the last post to observe it
  const lastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node && observer.current) {
        observer.current.observe(node);
      }
    },
    [] // Empty dependency array ensures this ref callback only gets created once
  );

  return (
    <>
      {!isLoading && posts.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
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
      <div id="loader" />
    </>
  );
};

export default Posts;
