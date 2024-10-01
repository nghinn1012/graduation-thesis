import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  postFetcher,
  PostInfo,
  PostResponse,
  PostShoppingList,
  ShoppingListData,
} from "../api/post";
import { useAuthContext } from "../hooks/useAuthContext";
import { useToastContext } from "../hooks/useToastContext";

interface ProfileContextType {
  posts: PostInfo[];
  isLoading: boolean;
  hasMore: boolean;
  page: number;
  limit: number;
  postCommentCounts: Record<string, number>;
  userId?: string;
  fetchPost: (postId: string) => Promise<PostInfo | void>;
  fetchPosts: (id: string) => void;
  loadMorePosts: () => void;
  fetchSavedPosts: () => Promise<void>;
  fetchLikedPosts: () => Promise<void>;
  toggleLikePostProfile: (postId: string, liked: boolean) => void;
  toggleSavePostProfile: (postId: string, saved: boolean) => void;
  updateCommentCount: (postId: string, count: number) => void;
  fetchSavePostToShoppingList: () => Promise<void>;
  setUserId: React.Dispatch<React.SetStateAction<string | undefined>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  postUpdated: string;
  setPostUpdated: React.Dispatch<React.SetStateAction<string>>;
  setPosts: React.Dispatch<React.SetStateAction<PostInfo[]>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setHasMore: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [posts, setPosts] = useState<PostInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [postCommentCounts, setPostCommentCounts] = useState<
    Record<string, number>
  >({});
  const [userId, setUserId] = useState<string | undefined>();
  const [postUpdated, setPostUpdated] = useState<string>("");

  const { auth } = useAuthContext();
  const { error } = useToastContext();

  const fetchPosts = useCallback(
    async (id: string) => {
      if (!auth?.token || isLoading) return;
      if (id !== userId && id !== posts[0]?.author._id) {
        setPosts([]);
        setPage(1);
        setHasMore(true);
      }
      setIsLoading(true);
      console.log(id);
      try {
        const response = (await postFetcher.getAllPosts(
          auth.token,
          page,
          limit,
          id
        )) as unknown as PostInfo[];
        console.log(response);
        setPosts((prevPosts) => {
          const existingPostIds = new Set(prevPosts.map((post) => post._id));
          const newPosts = response.filter(
            (post) => !existingPostIds.has(post._id) && post.author._id === id
          );
          return [...prevPosts, ...newPosts];
        });
        if (response.length < limit) {
          setHasMore(false);
        }
      } catch (err) {
        console.error("Failed to load posts:", err);
        error(`Failed to load posts: ${(err as Error).message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [auth?.token, page, limit, userId, isLoading]
  );

  const loadMorePosts = useCallback(() => {
    if (hasMore) setPage((prevPage) => prevPage + 1);
  }, [hasMore]);

  const fetchPost = async (postId: string): Promise<PostInfo | void> => {
    if (!auth?.token) return;
    try {
      const updatedPost = (await postFetcher.getPostById(
        postId,
        auth.token
      )) as unknown as PostInfo;
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post._id === postId ? {
          ...updatedPost,
          author: post.author,
        } : post))
      );
      return updatedPost;
    } catch (err) {
      console.error("Failed to fetch post:", err);
      error(`Failed to fetch post: ${(err as Error).message}`);
    }
  };

  const fetchLikedPosts = useCallback(async () => {
    if (!auth?.token) return;
    try {
      const likedPosts = await postFetcher.postLikesByUser(auth.token);
      setPosts((prevPosts) =>
        prevPosts.map((post) => ({
          ...post,
          liked: likedPosts.includes(post._id.toString()),
        }))
      );
    } catch (err) {
      console.error("Failed to fetch liked posts:", err);
      error(`Failed to fetch liked posts: ${(err as Error).message}`);
    }
  }, [auth?.token]);

  const fetchSavedPosts = useCallback(async () => {
    if (!auth?.token) return;
    try {
      const savedPosts = await postFetcher.postSavedByUser(auth.token);
      setPosts((prevPosts) =>
        prevPosts.map((post) => ({
          ...post,
          saved: savedPosts.includes(post._id.toString()),
        }))
      );
    } catch (err) {
      console.error("Failed to fetch saved posts:", err);
      error(`Failed to fetch saved posts: ${(err as Error).message}`);
    }
  }, [auth?.token]);

  const toggleLikePostProfile = (postId: string, liked: boolean) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId
          ? {
              ...post,
              liked,
              likeCount: liked ? post.likeCount + 1 : post.likeCount - 1,
            }
          : post
      )
    );
  };

  const toggleSavePostProfile = (postId: string, saved: boolean) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId
          ? {
              ...post,
              saved,
              savedCount: saved ? post.savedCount + 1 : post.savedCount - 1,
            }
          : post
      )
    );
  };

  const updateCommentCount = (postId: string, count: number) => {
    setPostCommentCounts((prevCounts) => ({ ...prevCounts, [postId]: count }));
  };

  const fetchSavePostToShoppingList = useCallback(async () => {
    if (!auth?.token) return;
    try {
      const response = (await postFetcher.getShoppingList(
        auth.token
      )) as unknown as ShoppingListData;
      setPosts((prevPosts) =>
        prevPosts.map((post) => ({
          ...post,
          isInShoppingList: response.posts
            .map((postItem) => postItem.postId)
            .includes(post._id),
        }))
      );
    } catch (err) {
      console.error("Failed to fetch shopping list posts:", err);
      error(`Failed to fetch shopping list posts: ${(err as Error).message}`);
    }
  }, [auth?.token]);

  useEffect(() => {
    if (auth?.token) {
      setIsLoading(true);
      fetchPosts(userId || "");
      setIsLoading(false);
    }
  }, [auth, page, userId]);

  useEffect(() => {
    if (postUpdated) {
      fetchPost(postUpdated);
      setPostUpdated("");
    }
  }, [postUpdated]);

  return (
    <ProfileContext.Provider
      value={{
        posts,
        isLoading,
        hasMore,
        page,
        limit,
        postCommentCounts,
        userId,
        fetchPost,
        fetchPosts,
        loadMorePosts,
        fetchSavedPosts,
        fetchLikedPosts,
        toggleLikePostProfile,
        toggleSavePostProfile,
        updateCommentCount,
        fetchSavePostToShoppingList,
        setPage,
        setUserId,
        setIsLoading,
        postUpdated,
        setPostUpdated,
        setPosts,
        setHasMore,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileContext = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (!context)
    throw new Error("useProfileContext must be used within a ProfileProvider");
  return context;
};

export default ProfileContext;
