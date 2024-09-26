import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { postFetcher, PostInfo, PostResponse, PostLikesByUser, PostShoppingList, ShoppingListData, searchPostData } from "../api/post";
import toast from "react-hot-toast";
import { useAuthContext } from "../hooks/useAuthContext";
import { useToastContext } from "../hooks/useToastContext";

interface PostContextType {
  posts: PostInfo[];
  setPosts?: React.Dispatch<React.SetStateAction<PostInfo[]>>;
  isLoading: boolean;
  setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  fetchPost: (postId: string) => Promise<PostInfo | void>;
  fetchPosts: (searchTerm?: string) => void;
  hasMore: boolean;
  setHasMore?: React.Dispatch<React.SetStateAction<boolean>>;
  loadMorePosts: () => void;
  fetchSavedPosts: () => Promise<void>;
  fetchLikedPosts: () => Promise<void>;
  toggleLikePost: (postId: string, liked: boolean) => void;
  toggleSavePost: (postId: string, saved: boolean) => void;
  updateCommentCount: (postId: string, count: number) => void;
  postCommentCounts: Record<string, number>;
  fetchSavePostToShoppingList: () => Promise<void>;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  limit: number;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<PostInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [limit] = useState<number>(10);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const { auth } = useAuthContext();
  const { error } = useToastContext();
  const [postCommentCounts, setPostCommentCounts] = useState<Record<string, number>>({});

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
    } catch (err) {
      console.error("Failed to load posts:", err);
      error("Failed to load posts: " + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [auth?.token, page, limit]);

  const loadMorePosts = useCallback(() => {
    if (hasMore && !isLoading) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [hasMore, isLoading]);

  useEffect(() => {
    if (auth?.token) {
      setIsLoading(true);
      fetchPosts();
      setIsLoading(false);
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
    } catch (err) {
      console.error("Failed to fetch the updated post:", error);
      error("Failed to fetch the updated post: " + (err as Error).message);
    }
  };

  const fetchLikedPosts = useCallback(async () => {
    if (!auth?.token) return;

    try {
      const likedPosts = await postFetcher.postLikesByUser(auth.token);
      if (Array.isArray(likedPosts)) {
        setPosts((prevPosts) => {
          return prevPosts.map((post) => ({
            ...post,
            liked: likedPosts.includes(post._id.toString()),
          }));
        });
      } else {
        console.error("Fetched liked posts is not an array");
        error("Failed to process liked posts data.");
      }
    } catch (err) {
      console.error("Failed to fetch liked posts:", err);
      error("Failed to fetch liked posts: " + (err as Error).message);
    }
  }, [auth?.token]);

  const fetchSavedPosts = useCallback(async () => {
    if (!auth?.token) return;

    try {
      const savedPosts = await postFetcher.postSavedByUser(auth.token);
      if (Array.isArray(savedPosts)) {
        setPosts((prevPosts) =>
          prevPosts.map((post) => ({
            ...post,
            saved: savedPosts.includes(post._id.toString()),
          })));
      } else {
        console.error("Fetched saved posts is not an array");
        error("Failed to process saved posts data.");
      }
    } catch (err) {
      console.error("Failed to fetch saved posts:", err);
      error("Failed to fetch saved posts: " + (err as Error).message);
    }
  }, [auth?.token]);

  const toggleLikePost = (postId: string, isLiked: boolean) => {
    if (setPosts) {
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p._id === postId
            ? { ...p, liked: isLiked, likeCount: isLiked ? p.likeCount + 1 : p.likeCount - 1 }
            : p
        )
      );
    }
  };

  const toggleSavePost = (postId: string, isSaved: boolean) => {
    if (setPosts) {
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p._id === postId
            ? { ...p, saved: isSaved, savedCount: isSaved ? p.savedCount + 1 : p.savedCount - 1 }
            : p
        )
      );
    }
  }

  const updateCommentCount = (postId: string, count: number) => {
    setPostCommentCounts(prevState => ({
      ...prevState,
      [postId]: count
    }));
    console.log("postCommentCounts:", postCommentCounts);
  };

  const fetchSavePostToShoppingList = useCallback(async () => {
    if (!auth?.token) return;

    try {
      const response = await postFetcher.getShoppingList(auth.token) as unknown as ShoppingListData;
      console.log(response.posts.map((responsePost: PostShoppingList) => responsePost.postId));
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          response.posts.map((responsePost: PostShoppingList) => responsePost.postId).includes(post._id)
            ? { ...post, isInShoppingList: true }
            : post
        )
      );

    } catch (err) {
      console.error("Failed to fetch post of user's shopping list:", err);
      error("Failed to fetch post of user's shopping list: " + (err as Error).message);
    }
  }, [auth?.token]);


  return (
    <PostContext.Provider value={{ fetchSavePostToShoppingList,
     postCommentCounts, updateCommentCount, setIsLoading,
     fetchSavedPosts, toggleSavePost, toggleLikePost, setPosts,
     fetchPosts, loadMorePosts, hasMore, posts, isLoading,
     fetchPost, fetchLikedPosts,
     page, setPage, limit, setHasMore }}>
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
