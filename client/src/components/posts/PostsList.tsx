import React, { useCallback, useEffect, useRef } from "react";
import PostSkeleton from "../skeleton/PostSkeleton";
import Post from "./PostInfo";
import { usePostContext } from "../../context/PostContext";
import { useLocation } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext";
import { PostInfo } from "../../api/post";

interface PostProps {
  postsSearch?: PostInfo[];
  locationPath?: string;
}

const Posts: React.FC<PostProps> = ({ postsSearch, locationPath }) => {
  const {
    posts,
    isLoading,
    hasMore,
    loadMorePosts,
    setPosts,
    fetchLikedPosts,
    fetchPosts,
    fetchSavedPosts,
    setIsLoading,
  } = usePostContext();

  const observer = useRef<IntersectionObserver | null>(null);
  const location = useLocation();
  const postAuthor = location.state?.postAuthor;
  const updatedPost = location.state?.updatedPost;

  useEffect(() => {
    if (Array.isArray(postsSearch) && setPosts) {
      setPosts((prevPosts) => {
        return postsSearch;
      });
      console.log(posts);
    }
  }, [postsSearch, setPosts]);



  useEffect(() => {
    if (updatedPost && setPosts) {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === updatedPost._id
            ? { ...updatedPost, author: postAuthor }
            : post
        )
      );
    }
  }, [updatedPost, postAuthor, setPosts]);

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

  const lastPostRef = useCallback((node: HTMLDivElement | null) => {
    if (node && observer.current) {
      observer.current.observe(node);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (setIsLoading) {
        setIsLoading(true);
        try {
          await fetchPosts();
          await Promise.all([fetchLikedPosts(), fetchSavedPosts()]);
        } catch (error) {
          console.error("Error loading data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadData();
  }, [fetchPosts, fetchLikedPosts, fetchSavedPosts, setIsLoading]);

  return (
    <>
      {isLoading && posts.length === 0 && (
        <div className="flex justify-center my-4">
          <PostSkeleton />
        </div>
      )}
      {posts.length > 0 && !isLoading && (
        <div>
          {posts.map((post, index) => (
            <div
              key={post._id}
              ref={index === posts.length - 1 ? lastPostRef : null}
            >
              <Post post={post} locationPath={locationPath}/>
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
