import React, { useCallback, useEffect, useRef } from "react";
import PostSkeleton from "../skeleton/PostSkeleton";
import Post from "./PostInfo";
import { usePostContext } from "../../context/PostContext";
import { useLocation } from "react-router-dom";
const FollowingHomeTab: React.FC = () => {
  const {
    followingPosts,
    isLoadingFollowing,
    fetchFollowingPosts,
    setFollowingPosts,
    fetchLikedPosts,
    fetchSavedPosts,
    setIsLoadingFollowing,
    hasMoreFollowing,
    loadMoreFollowingPosts,
  } = usePostContext();

  const observer = useRef<IntersectionObserver | null>(null);
  const location = useLocation();
  const postAuthor = location.state?.postAuthor;
  const updatedPost = location.state?.updatedPost;

  useEffect(() => {
    if (updatedPost && setFollowingPosts) {
      setFollowingPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === updatedPost._id
            ? { ...updatedPost, author: postAuthor }
            : post
        )
      );
    }
  }, [updatedPost, postAuthor, setFollowingPosts]);

  useEffect(() => {
    if (!observer.current) {
      observer.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isLoadingFollowing && hasMoreFollowing) {
            loadMoreFollowingPosts();
          }
        },
        {
          root: null,
          rootMargin: "0px",
          threshold: 1.0,
        }
      );
    }

    const loader = document.getElementById("followingHomeLoader");
    if (loader) {
      observer.current.observe(loader);
    }

    return () => {
      if (loader) {
        observer.current?.unobserve(loader);
      }
    };
  }, [isLoadingFollowing, hasMoreFollowing, loadMoreFollowingPosts]);

  const lastPostRef = useCallback((node: HTMLDivElement | null) => {
    if (node && observer.current) {
      observer.current.observe(node);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (setIsLoadingFollowing) {
        setIsLoadingFollowing(true);
        try {
          await fetchFollowingPosts();
        } catch (error) {
          console.error("Error loading data:", error);
        } finally {
          setIsLoadingFollowing(false);
        }
      }
    };
    loadData();
  }, [fetchFollowingPosts, fetchLikedPosts, fetchSavedPosts, setIsLoadingFollowing]);


  return (
    <>
      {isLoadingFollowing && followingPosts.length === 0 && (
        <div className="flex justify-center my-4">
          <PostSkeleton />
        </div>
      )}
      {followingPosts.length > 0 && !isLoadingFollowing && (
        <div>
          {followingPosts.map((post, index) => (
            <div
              key={post._id}
              ref={index === followingPosts.length - 1 ? lastPostRef : null}
            >
              <Post post={post}/>
            </div>
          ))}
        </div>
      )}
      {isLoadingFollowing && followingPosts.length > 0 && (
        <div className="flex justify-center my-4">
          <PostSkeleton />
        </div>
      )}
      <div id="followingHomeLoader" />
    </>
  );
};

export default FollowingHomeTab;
