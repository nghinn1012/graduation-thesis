import React, { createContext, useState, useEffect, useContext } from 'react';
import { userFetcher, AccountInfo } from '../api/user';
import { useAuthContext } from '../hooks/useAuthContext';

interface UserContextType {
  allUsers: AccountInfo[];
  loading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<AccountInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {auth} = useAuthContext();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (!auth?.token) return;
        const users = await userFetcher.getAllUsers(auth.token);
        setAllUsers(users as unknown as AccountInfo[]);
        setLoading(false);
      } catch (err) {
        console.log('Failed to fetch users:', err);
        setError('Failed to fetch users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, [auth?.token]);

  return (
    <UserContext.Provider value={{ allUsers, loading, error }}>
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
