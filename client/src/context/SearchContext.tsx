import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { postFetcher, PostInfo, searchPostData } from "../api/post";
import { useAuthContext } from "../hooks/useAuthContext";
import { useToastContext } from "../hooks/useToastContext";
import { useLocation } from "react-router-dom";

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  posts: PostInfo[];
  setPosts: React.Dispatch<React.SetStateAction<PostInfo[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  totalPages: number;
  hasMore: boolean;
  fetchLikedPosts: () => Promise<void>;
  fetchSavedPosts: () => Promise<void>;
  toggleLikePostSearch: (postId: string, isLiked: boolean) => void;
  toggleSavePostSearch: (postId: string, isSaved: boolean) => void;
  fetchPosts: () => Promise<void>;
  loadMorePosts: () => void;
  cookingTimeRange: (number | string)[];
  setCookingTimeRange: React.Dispatch<
    React.SetStateAction<(number | string)[]>
  >;
  minQuality: number;
  setMinQuality: React.Dispatch<React.SetStateAction<number>>;
  haveMade: boolean;
  setHaveMade: React.Dispatch<React.SetStateAction<boolean>>;
  difficulty: string[];
  setDifficulty: React.Dispatch<React.SetStateAction<string[]>>;
  hashtagsSearch: string[];
  setHashtagsSearch: React.Dispatch<React.SetStateAction<string[]>>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [posts, setPosts] = useState<PostInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const { auth } = useAuthContext();
  const { error } = useToastContext();
  const [cookingTimeRange, setCookingTimeRange] = useState<(number | string)[]>(
    [0, 1440]
  );
  const [minQuality, setMinQuality] = useState<number>(0);
  const [haveMade, setHaveMade] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<string[]>([]);
  const [hashtagsSearch, setHashtagsSearch] = useState<string[]>([]);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/users/search" && searchQuery !== "" && searchQuery !== undefined) {
      setSearchQuery("");
      setPosts([]);
      setCurrentPage(1);
      setCookingTimeRange([0, 1440]);
      setMinQuality(0);
      setHaveMade(false);
      setDifficulty([]);
      setHashtagsSearch([]);
      setHasMore(true);
    }
  }, [location.pathname]);

  const fetchPosts = useCallback(async () => {
    if (!auth?.token || isLoading) return;
    setIsLoading(true);
    try {
      const response = (await postFetcher.searchPost(
        searchQuery,
        cookingTimeRange[1] as string,
        cookingTimeRange[0] as string,
        minQuality as unknown as string,
        haveMade ? "true" : "",
        difficulty,
        hashtagsSearch as string[],
        currentPage,
        10,
        auth.token
      )) as unknown as searchPostData;
      if (response.totalPosts === 0) {
        setHasMore(false);
      }
      await setPosts((prevPosts) => {
        const existingPostIds = new Set(prevPosts.map((post) => post._id));
        const newPosts = response.posts.filter(
          (post) => !existingPostIds.has(post._id)
        );
        return [...prevPosts, ...newPosts];
      });
      await Promise.all([fetchLikedPosts(), fetchSavedPosts()]);
      if (
        (response as unknown as PostInfo[]).length < limit ||
        response.totalPages === currentPage
      ) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setIsLoading(false);
    }
  }, [
    searchQuery,
    currentPage,
    limit,
    cookingTimeRange,
    minQuality,
    haveMade,
    difficulty,
    hashtagsSearch,
  ]);

  useEffect(() => {
    setPosts([]);
    setHasMore(true);
    setCurrentPage(1);
  }, [
    searchQuery,
    cookingTimeRange,
    minQuality,
    haveMade,
    difficulty,
    hashtagsSearch,
  ]);

  useEffect(() => {
    setCurrentPage(1);
    setCookingTimeRange([0, 1440]);
    setMinQuality(0);
    setHaveMade(false);
    setDifficulty([]);
    setHashtagsSearch([]);
    setHasMore(true);
  }, [searchQuery, auth?.token]);

  const loadMorePosts = useCallback(() => {
    if (hasMore && !isLoading) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  }, [hasMore, isLoading]);

  useEffect(() => {
    if (auth?.token) {
      setIsLoading(true);
      const fetchPostsData = async () => {
        await fetchPosts();
        setIsLoading(false);
      };
      fetchPostsData();
    }
  }, [auth, fetchPosts, currentPage]);

  useEffect(() => {
    if (auth?.token) {
      setIsLoading(true);
      fetchPosts();
      setIsLoading(false);
    }
  }, [auth, fetchPosts, currentPage]);

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
          }))
        );
      } else {
        console.error("Fetched saved posts is not an array");
        error("Failed to process saved posts data.");
      }
    } catch (err) {
      console.error("Failed to fetch saved posts:", err);
      error("Failed to fetch saved posts: " + (err as Error).message);
    }
  }, [auth?.token]);

  const toggleLikePostSearch = (postId: string, isLiked: boolean) => {
    if (setPosts) {
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p._id === postId
            ? {
                ...p,
                liked: isLiked,
                likeCount: isLiked ? p.likeCount + 1 : p.likeCount - 1,
              }
            : p
        )
      );
    }
  };

  const toggleSavePostSearch = (postId: string, isSaved: boolean) => {
    if (setPosts) {
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p._id === postId
            ? {
                ...p,
                saved: isSaved,
                savedCount: isSaved ? p.savedCount + 1 : p.savedCount - 1,
              }
            : p
        )
      );
    }
  };

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        currentPage,
        setCurrentPage,
        posts,
        isLoading,
        setIsLoading,
        totalPages,
        hasMore,
        fetchLikedPosts,
        fetchSavedPosts,
        toggleLikePostSearch,
        toggleSavePostSearch,
        fetchPosts,
        loadMorePosts,
        cookingTimeRange,
        setCookingTimeRange,
        minQuality,
        setPosts,
        setMinQuality,
        haveMade,
        setHaveMade,
        difficulty,
        setDifficulty,
        hashtagsSearch,
        setHashtagsSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearchContext = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearchContext must be used within a SearchProvider");
  }
  return context;
};
