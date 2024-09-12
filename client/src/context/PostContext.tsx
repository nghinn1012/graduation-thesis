import React, { createContext, useContext, useState, useEffect } from "react";
import { postFetcher, PostInfo, PostInfoUpdate, PostResponse } from "../api/post";
import toast from "react-hot-toast";
import { useAuthContext } from "../hooks/useAuthContext";

interface PostContextType {
  posts: PostInfo[];
  isLoading: boolean;
  fetchPosts: () => void;
  fetchPost: (postId: string) => Promise<void>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<PostInfo[]>([]);
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

  const fetchPost = async (postId: string) => {
    const token = auth?.token;
    if (!token) return;

    try {
      const updatedPost = await postFetcher.getPostById(postId, token);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? (updatedPost as unknown as PostInfo) : post
        )
      );
      return updatedPost;
    } catch (error) {
      console.error("Failed to fetch the updated post:", error);
      toast.error("Failed to fetch the updated post: " + (error as Error).message);
    }
  };

  useEffect(() => {
    if (auth) {
      fetchPosts();
    }
  }, [auth]);

  return (
      <PostContext.Provider
        value={{ posts, isLoading, fetchPosts, fetchPost: async (postId: string) => { await fetchPost(postId); } }}
      >
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
