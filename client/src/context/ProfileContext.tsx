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
  PostProfile,
  PostResponse,
  PostShoppingList,
  ShoppingListData,
} from "../api/post";
import { useAuthContext } from "../hooks/useAuthContext";
import { useToastContext } from "../hooks/useToastContext";
import { AccountInfo, userFetcher } from "../api/user";
import { set } from "date-fns";
import { se } from "date-fns/locale";

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
  user: AccountInfo | undefined;
  setUser: React.Dispatch<React.SetStateAction<AccountInfo | undefined>>;
  postLikes: PostInfo[];
  isLoadingLike: boolean;
  hasMoreLike: boolean;
  fetchPostsLikeInProfile: (id: string) => Promise<void>;
  setPostLikes: React.Dispatch<React.SetStateAction<PostInfo[]>>;
  fetchSavedPostInProfile: () => Promise<void>;
  pageLike: number;
  setPageLike: React.Dispatch<React.SetStateAction<number>>;
  postSaved: PostInfo[];
  setPostSaved: React.Dispatch<React.SetStateAction<PostInfo[]>>;
  loadMorePostsLike: () => void;
  fetchUserFollowers: () => Promise<void>;
  fetchUserFollowing: () => Promise<void>;
  isLoadingNetwork: boolean;
  setIsLoadingNetwork: React.Dispatch<React.SetStateAction<boolean>>;
  isLoadingSaved: boolean;
  setIsLoadingSaved: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [posts, setPosts] = useState<PostInfo[]>([]);
  const [postLikes, setPostLikes] = useState<PostInfo[]>([]);
  const [postSaved, setPostSaved] = useState<PostInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNetwork, setIsLoadingNetwork] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingLike, setIsLoadingLike] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [hasMoreSave, setHasMoreSave] = useState(true);
  const [hasMoreLike, setHasMoreLike] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pageLike, setPageLike] = useState(1);
  const [pageSaved, setPageSaved] = useState(1);
  const [postCommentCounts, setPostCommentCounts] = useState<
    Record<string, number>
  >({});
  const [userId, setUserId] = useState<string | undefined>();
  const [postUpdated, setPostUpdated] = useState<string>("");
  const [user, setUser] = useState<AccountInfo | undefined>();

  const { auth, account } = useAuthContext();
  const { error } = useToastContext();

  const fetchPosts = useCallback(
    async (id: string) => {
      console.log("chay qua fetch");
      setIsLoading(true);
      if (!auth?.token) return;
      if (id !== userId) {
        setPosts([]);
        setPage(1);
        setUserId(id);
        setUser(undefined);
        setHasMore(true);
      }

      try {
        const response = (await postFetcher.getAllPosts(
          auth.token,
          page,
          limit,
          id
        )) as unknown as PostProfile;

        if (response?.authors)
          setUser({
            ...response.authors,
            followed: response.authors.followers?.includes(
              account?._id as string
            ),
          });
        setPosts((prevPosts) => {
          const existingPostIds = new Set(prevPosts.map((post) => post._id));

          const newPosts =
            response?.posts?.filter((post) => !existingPostIds.has(post._id)) ||
            [];

          const postsWithAuthors = newPosts.map((post) => ({
            ...post,
            author: response.authors,
          })) as PostInfo[];

          return [...prevPosts, ...postsWithAuthors];
        });

        if (response?.posts?.length < limit) {
          setHasMore(false);
        }
      } catch (err) {
        console.error("Failed to load posts:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [page, limit, auth?.token, userId]
    // [page, limit, userId, auth?.token, posts]
  );

  const loadMorePosts = useCallback(() => {
    if (hasMore) setPage((prevPage) => prevPage + 1);
  }, [hasMore]);

  const loadMorePostsLike = useCallback(() => {
    if (hasMoreLike) setPageLike((prevPage) => prevPage + 1);
  }, [hasMoreLike]);

  const fetchPost = async (postId: string): Promise<PostInfo | void> => {
    if (!auth?.token) return;
    try {
      const updatedPost = (await postFetcher.getPostById(
        postId,
        auth.token
      )) as unknown as PostInfo;
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...updatedPost,
                author: post.author,
              }
            : post
        )
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
      setPostSaved((prevPosts) =>
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
      setIsLoadingSaved(true);
      const savedPosts = (await postFetcher.postSavedByUser(
        auth.token
      )) as unknown as PostInfo[];
      setPosts((prevPosts) =>
        prevPosts.map((post) => ({
          ...post,
          saved: savedPosts
            .map((savedPost) => savedPost?._id)
            .includes(post?._id.toString()),
        }))
      );
      setPostLikes((prevPosts) =>
        prevPosts.map((post) => ({
          ...post,
          saved: savedPosts
            .map((savedPost) => savedPost?._id)
            .includes(post?._id.toString()),
        }))
      );
      setPostSaved(
        savedPosts.map((post) => ({
          ...post,
          saved: true,
        }))
      );
      setIsLoadingSaved(false);
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
    setPostLikes((prevPosts) =>
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
    setPostSaved((prevPosts) =>
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
    setPostLikes((prevPosts) =>
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
    setPostSaved((prevPosts) =>
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

  const fetchPostsLikeInProfile = useCallback(
    async (id: string) => {
      if (!auth?.token) return;
      console.log("id", id);
      console.log("userId", userId);
      if (id !== userId) {
        setPostLikes([]);
        setPageLike(1);
        setUserId(id);
        setHasMoreLike(true);
      }
      console.log(userId);
      setIsLoadingLike(true);
      try {
        const response = (await postFetcher.postLikesByUser(
          auth.token,
          id || "",
          pageLike,
          limit
        )) as unknown as PostInfo[];
        const likedPostIds = await postFetcher.postLikesByUser(auth.token);

        setPostLikes((prevPosts) => {
          const existingPostIds = new Set(prevPosts.map((post) => post._id));

          const newPosts =
            response.filter((post) => !existingPostIds.has(post._id)) || [];

          return [
            ...prevPosts,
            ...newPosts.map((post) => ({
              ...post,
              liked: likedPostIds.includes(post._id.toString()),
            })),
          ];
        });
        if (response.length < limit) {
          setHasMore(false);
        }
      } catch (err) {
        console.error("Failed to load posts:", err);
      } finally {
        setIsLoadingLike(false);
      }
    },
    [pageLike, limit, auth?.token, userId]
  );

  const fetchSavedPostInProfile = useCallback(async () => {
    if (!auth?.token) return;
    try {
      const savedPosts = (await postFetcher.postSavedByUser(
        auth.token
      )) as unknown as PostInfo[];
      setPostLikes((prevPosts) =>
        prevPosts.map((post) => ({
          ...post,
          saved: savedPosts
            .map((savedPost) => savedPost?._id)
            .includes(post?._id.toString()),
        }))
      );
    } catch (err) {
      console.error("Failed to fetch saved posts:", err);
      error(`Failed to fetch saved posts: ${(err as Error).message}`);
    }
  }, [auth?.token]);

  const fetchUserFollowers = useCallback(async () => {
    if (!auth?.token) return;
    try {
      setIsLoadingNetwork(true);
      const response = (await userFetcher.getFollowers(
        userId || "",
        auth.token
      )) as unknown as AccountInfo[];
      const followersWithFollowed = response.map((user) => ({
        ...user,
        followed: user.followers?.includes(account?._id as string),
      }));
      setUser((prevUser) =>
        prevUser
          ? {
              ...prevUser,
              followersData: followersWithFollowed,
            }
          : prevUser
      );
      setIsLoadingNetwork(false);
    } catch (err) {
      console.error("Failed to fetch followers:", err);
      error(`Failed to fetch followers: ${(err as Error).message}`);
    }
  }, [auth?.token, userId]);

  const fetchUserFollowing = useCallback(async () => {
    if (!auth?.token) return;
    try {
      setIsLoadingNetwork(true);
      const response = (await userFetcher.getFollowing(
        userId || "",
        auth.token
      )) as unknown as AccountInfo[];
      const followingWithFollowed = response.map((user) => ({
        ...user,
        followed: user.followers?.includes(account?._id as string),
      }));

      setUser((prevUser) =>
        prevUser
          ? {
              ...prevUser,
              followingData: followingWithFollowed,
            }
          : prevUser
      );
      setIsLoadingNetwork(false);
    } catch (err) {
      console.error("Failed to fetch following:", err);
      error(`Failed to fetch following: ${(err as Error).message}`);
    }
  }, [auth?.token, userId]);

  useEffect(() => {
    if (auth?.token) {
      fetchPosts(userId || "");
    }
  }, [auth?.token, page]);

  useEffect(() => {
    if (auth?.token) {
      fetchPostsLikeInProfile(userId || "");
    }
  }, [pageLike, auth?.token]);

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
        user,
        setUser,
        postLikes,
        postSaved,
        setPostSaved,
        isLoadingLike,
        hasMoreLike,
        fetchPostsLikeInProfile,
        setPostLikes,
        fetchSavedPostInProfile,
        pageLike,
        setPageLike,
        loadMorePostsLike,
        fetchUserFollowers,
        fetchUserFollowing,
        isLoadingNetwork,
        setIsLoadingNetwork,
        isLoadingSaved,
        setIsLoadingSaved,
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
