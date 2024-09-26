import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { postFetcher, PostInfo, searchPostData } from "../api/post";
import { useAuthContext } from "../hooks/useAuthContext";

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  posts: PostInfo[];
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  totalPages: number;
  hasMore: boolean; // New state for pagination
  searchPosts: (page: number) => Promise<void>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [posts, setPosts] = useState<PostInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true); // State for checking more pages
  const { auth } = useAuthContext();

  const searchPosts = useCallback(async (page: number) => {
    if (!auth?.token) {
      console.error("User is not authenticated");
      return;
    }

    setIsLoading(true);
    try {
      const fetchedPosts = await postFetcher.searchPost(
        searchQuery,
        page - 1,
        10,
        auth.token
      ) as unknown as searchPostData;

      // Check if there are more posts to load
      setHasMore(page < fetchedPosts.totalPages);

      if (page === 1) {
        setPosts(fetchedPosts.posts);
      } else {
        setPosts((prevPosts) => {
          const newPosts = fetchedPosts.posts.filter(
            (newPost) => !prevPosts.some((prevPost) => prevPost._id === newPost._id)
          );
          return [...prevPosts, ...newPosts];
        });
      }

      console.log("fetchedPosts:", fetchedPosts);
      setTotalPages(fetchedPosts.totalPages);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, auth]);

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
        hasMore, // Expose hasMore
        searchPosts,
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
