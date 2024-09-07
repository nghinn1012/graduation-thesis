import React, { useEffect, useState } from "react";
import PostSkeleton from "../skeleton/PostSkeleton";
import Post from "./PostInfo";
import usePostContext from "../../hooks/usePostContext";
import { PostInfo } from "../../api/post";
import toast from "react-hot-toast";

const Posts = () => {
  const { posts, isLoading, fetchPosts } = usePostContext();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth");
    if (token) {
      setIsReady(true);
    } else {
      toast.error("Token not found");
    }
  }, []);

  useEffect(() => {
    if (isReady) {
      fetchPosts();
    }
  }, [isReady]);

  return (
    <>
      {isLoading && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && posts.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {!isLoading && posts.length > 0 && (
        <div>
          {posts.map((post: PostInfo) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};

export default Posts;
