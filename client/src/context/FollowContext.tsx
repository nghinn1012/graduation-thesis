// FollowContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { useUserContext } from './UserContext';
import { userFetcher } from '../api/user';
import { useAuthContext } from '../hooks/useAuthContext';

interface FollowContextType {
  followers: string[];
  followUser: (userId: string) => void;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export const FollowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [followers, setFollowers] = useState<string[]>([]);
  const { suggestUsers, setSuggestUsers, setAllUsers } = useUserContext();
  const { auth } = useAuthContext();

  const followUser = async (userId: string) => {
    try {
      if (!userId || !auth?.token) return;
      const response = await userFetcher.followUser(userId, auth.token);
      setSuggestUsers((prev) => prev.filter((user) => user._id !== userId));
      setAllUsers((prev) =>
        prev.map((user) => {
          if (user._id === userId) {
            return { ...user, followed: !user.followed };
          }
          return user;
        })
      );
    }
    catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  return (
    <FollowContext.Provider value={{ followers, followUser }}>
      {children}
    </FollowContext.Provider>
  );
};

export const useFollowContext = () => {
  const context = useContext(FollowContext);
  if (!context) {
    throw new Error('useFollowContext must be used within a FollowProvider');
  }
  return context;
};
