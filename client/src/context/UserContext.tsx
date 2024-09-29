import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { userFetcher, AccountInfo, searchInfoData } from "../api/user";
import { useAuthContext } from "../hooks/useAuthContext";
import { useSearchContext } from "./SearchContext";
import { useToastContext } from "../hooks/useToastContext";

interface UserContextType {
  allUsers: AccountInfo[];
  loading: boolean;
  loadMoreUsers: () => void;
  hasMore: boolean;
  suggestUsers: AccountInfo[];
  fetchSuggestions: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  setSuggestUsers: React.Dispatch<React.SetStateAction<AccountInfo[]>>;
  setAllUsers: React.Dispatch<React.SetStateAction<AccountInfo[]>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [allUsers, setAllUsers] = useState<AccountInfo[]>([]);
  const [suggestUsers, setSuggestUsers] = useState<AccountInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const { auth, account} = useAuthContext();
  const [limit] = useState<number>(10);
  const { searchQuery } = useSearchContext();
  const [hasMore, setHasMore] = useState<boolean>(true);
  const { error } = useToastContext();
  const [currentPage, setCurrentPage] = useState<number>(1);

  const fetchUsers = useCallback(async () => {
    if (!auth?.token || loading) return;
    setLoading(true);
    try {
      const response = (await userFetcher.search(
        searchQuery || "",
        currentPage,
        limit,
        auth.token
      )) as unknown as searchInfoData;
      console.log("response:", response);
      const usersWithFollowed = response.users.map((user) => {
        return {
          ...user,
          followed: user.followers?.includes(account?._id as string),
        };
      });
      setAllUsers((prevUsers) => {
        const existingUserIds = new Set(prevUsers.map((user) => user._id));
        const newUsers = usersWithFollowed.filter(
          (user) => !existingUserIds.has(user._id)
        );
        return [...prevUsers, ...newUsers];
      });
      if (
        (response as unknown as AccountInfo[]).length < limit ||
        response.totalPages === currentPage
      ) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
      error("Failed to load users: " + (err as Error));
    } finally {
      setLoading(false);
    }
  }, [
    auth?.token,
    searchQuery,
    currentPage,
    limit,
  ]);

  const fetchSuggestions = useCallback(async () => {
    if (!auth || !auth.token) return;
    setLoading(true);
    try {
      const response = (await userFetcher.suggest(auth.token)) as unknown as AccountInfo[];
      if (response.length === 0) {
        setHasMore(false);
      }
      setSuggestUsers((prevUsers) => {
        const existingUserIds = new Set(prevUsers.map((user) => user._id));
        const newUsers = response.filter(
          (user) => !existingUserIds.has(user._id)
        );
        const updatedUsers = [...prevUsers, ...newUsers];
        return updatedUsers;
      });
    } catch (err) {
      console.error("Failed to load suggestions:", err);
      error("Failed to load suggestions: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [auth?.token]);


  useEffect(() => {
    setAllUsers([]);
    setHasMore(true);
    setCurrentPage(1);
  }, [searchQuery, auth?.token]);

  const loadMoreUsers = useCallback(() => {
    if (hasMore && !loading) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  }, [hasMore, loading]);

  useEffect(() => {
    if (auth?.token) {
      setLoading(true);
      const fetchUsersData = async () => {
        await fetchUsers();
        setLoading(false);
      };
      fetchUsersData();
    }
  }, [auth, fetchUsers, currentPage]);

  useEffect(() => {
    if (auth?.token) {
      setLoading(true);
      fetchUsers();
      setLoading(false);
    }
  }, [auth, fetchUsers, currentPage]);


  return (
    <UserContext.Provider value={{ allUsers,
    loading, loadMoreUsers, hasMore,
    suggestUsers, fetchSuggestions, fetchUsers, setSuggestUsers,
    setAllUsers }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("usePostContext must be used within a PostProvider");
  }
  return context;
};

export default UserContext;
