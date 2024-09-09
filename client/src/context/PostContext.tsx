// PostContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { postFetcher, PostInfo, PostResponse } from "../api/post";
import { AccountInfo, userFetcher } from "../api/user";
import toast from "react-hot-toast";

interface PostContextType {
  posts: PostInfo[];
  isLoading: boolean;
  fetchPosts: () => void;
  authors: Map<string, AccountInfo>; 
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<PostInfo[]>([]);
  const [authors, setAuthors] = useState<Map<string, AccountInfo>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    const token = localStorage.getItem("auth");
    if (!token) {
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

  const fetchAllUsers = async () => {
    const token = localStorage.getItem("auth");
    if (!token) return;

    try {
      const response = await userFetcher.getAllUsers(JSON.parse(token).token);
      const users = response as unknown as AccountInfo[];
      const userMap = new Map<string, AccountInfo>();
      users.forEach(user => userMap.set(user._id, user));
      setAuthors(userMap);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users: " + (error as Error).message);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchAllUsers();
  }, []);

  return (
    <PostContext.Provider value={{ posts, isLoading, fetchPosts, authors }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePostContext = (): PostContextType => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error("usePostContext must be used within a PostProvider");
  }
  return context;
};

export default PostContext;
