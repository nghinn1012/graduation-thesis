// SearchContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import { postFetcher, PostInfo, searchPostData } from "../api/post";
import { useAuthContext } from "../hooks/useAuthContext";

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  posts: PostInfo[];
  isLoading: boolean;
  searchPosts: (page: number) => Promise<void>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [posts, setPosts] = useState<PostInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { auth } = useAuthContext();

  const searchPosts = async (page: number) => {
    setIsLoading(true);
    try {
      if (!searchQuery) {
        setPosts([]);
        setIsLoading(false);
        return;
      }
      if (!auth?.token) {
        console.error("User is not authenticated");
        return;
      }
      const fetchedPosts = (await postFetcher.searchPost(
        searchQuery,
        10,
        page * 10,
        auth?.token
      )) as unknown as searchPostData;
      setPosts((prevPosts) => [...prevPosts, ...fetchedPosts.posts]);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
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
