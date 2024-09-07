// PostContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { postFetcher, PostInfo, PostResponse } from "../api/post";
import toast from "react-hot-toast";

interface PostContextType {
  posts: PostInfo[];
  isLoading: boolean;
  fetchPosts: () => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<PostInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    const token = localStorage.getItem("auth");
    if (!token) {
      toast.error("Token not found");
      setIsLoading(false);
      return;
    }

    try {
      const response: PostResponse<PostInfo[]> = await postFetcher.getAllPosts(JSON.parse(token).token);
      setPosts(response as unknown as PostInfo[]);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load posts: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PostContext.Provider value={{ posts, isLoading, fetchPosts }}>
      {children}
    </PostContext.Provider>
  );
};

export default PostContext;
