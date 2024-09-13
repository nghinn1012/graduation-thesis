import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { postFetcher, PostInfo, PostResponse } from "../api/post";
import toast from "react-hot-toast";
import { useAuthContext } from "../hooks/useAuthContext";

interface PostContextType {
  posts: PostInfo[];
  setPosts?: React.Dispatch<React.SetStateAction<PostInfo[]>>;
  isLoading: boolean;
  fetchPost: (postId: string) => Promise<PostInfo | void>;
  fetchPosts: () => void;
  hasMore: boolean;
  loadMorePosts: () => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<PostInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [limit] = useState<number>(10);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const { auth } = useAuthContext();

  const fetchPosts = useCallback(async () => {
    if (!auth?.token || isLoading) return;

    setIsLoading(true);
    try {
      const response: PostResponse<PostInfo[]> = await postFetcher.getAllPosts(auth.token, page, limit);

      setPosts((prevPosts) => {
        const existingPostIds = new Set(prevPosts.map(post => post._id));
        const newPosts = (response as unknown as PostInfo[]).filter(post => !existingPostIds.has(post._id));
        return [...prevPosts, ...newPosts];
      });

      if ((response as unknown as PostInfo[]).length < limit) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load posts:", error);
      toast.error("Failed to load posts: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [auth?.token, page, limit]);

  // Only change page if more posts are available and not loading
  const loadMorePosts = useCallback(() => {
    if (hasMore && !isLoading) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [hasMore, isLoading]);

  // Fetch posts whenever page changes
  useEffect(() => {
    if (auth?.token) {
      fetchPosts();
    }
  }, [auth, fetchPosts, page]);

  const fetchPost = async (postId: string): Promise<PostInfo | void> => {
    if (!auth?.token) return;

    try {
      const updatedPost = await postFetcher.getPostById(postId, auth.token);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? (updatedPost as unknown as PostInfo) : post
        )
      );
      return updatedPost as unknown as PostInfo;
    } catch (error) {
      console.error("Failed to fetch the updated post:", error);
      toast.error("Failed to fetch the updated post: " + (error as Error).message);
    }
  };


  return (
    <PostContext.Provider value={{ setPosts, fetchPosts, loadMorePosts, hasMore, posts, isLoading, fetchPost }}>
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
