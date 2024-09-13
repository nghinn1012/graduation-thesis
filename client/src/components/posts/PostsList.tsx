import React, { useCallback, useEffect, useRef } from "react";
import PostSkeleton from "../skeleton/PostSkeleton";
import Post from "./PostInfo";
import { usePostContext } from "../../context/PostContext";
import { useLocation } from "react-router-dom";

const Posts: React.FC = () => {
  const { posts, isLoading, hasMore, loadMorePosts, setPosts } =
    usePostContext();
  const observer = useRef<IntersectionObserver | null>(null);
  const location = useLocation();
  const postAuthor = location.state?.postAuthor;
  const updatedPost = {
    ...location.state?.updatedPost,
    author: postAuthor,
  };
  useEffect(() => {
    if (updatedPost && setPosts) {
      setPosts((prevPosts) =>
        (prevPosts || []).map((post) =>
          post._id === updatedPost._id ? updatedPost : post
        )
      );
    }
  }, [updatedPost, setPosts]);

  const lastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || !hasMore) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting) {
          loadMorePosts();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, loadMorePosts]
  );

  useEffect(() => {
    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, []);

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
    </>
  );
};

export default Posts;
