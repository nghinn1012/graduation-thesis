// PostContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { postFetcher, PostInfo, PostResponse } from "../api/post";
import { AccountInfo, userFetcher } from "../api/user";
import toast from "react-hot-toast";
import { useAuthContext } from "../hooks/useAuthContext";

interface PostContextType {
  posts: PostInfo[];
  isLoading: boolean;
  fetchPosts: () => void;
  fetchPostById: (postId: string) => Promise<PostInfo>;
  authors: Map<string, AccountInfo>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<PostInfo[]>([]);
  const [authors, setAuthors] = useState<Map<string, AccountInfo>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const { auth } = useAuthContext();

  const fetchPosts = async () => {
    const token = auth?.token;
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response: PostResponse<PostInfo[]> = await postFetcher.getAllPosts(token);
      setPosts(response as unknown as PostInfo[]);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load posts: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    const token = auth?.token;
    if (!token) return;

    try {
      const response = await userFetcher.getAllUsers(token);
      const users = response as unknown as AccountInfo[];
      const userMap = new Map<string, AccountInfo>();
      users.forEach(user => userMap.set(user._id, user));
      setAuthors(userMap);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users: " + (error as Error).message);
    }
  };

  const fetchPostById = async (postId: string) => {
    try {
      const post = await postFetcher.getPostById(postId); // Assuming you have an API function like this
      return post;
    } catch (error) {
      console.error("Failed to fetch post:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (auth) {
      fetchPosts();
      fetchAllUsers();
    }
  }, [auth]);

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
