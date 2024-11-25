// FollowContext.tsx
import React, { createContext, useCallback, useContext, useState } from "react";
import { useUserContext } from "./UserContext";
import { FollowData, userFetcher } from "../api/user";
import { useAuthContext } from "../hooks/useAuthContext";
import { useProfileContext } from "./ProfileContext";
import { PiVan } from "react-icons/pi";

interface FollowContextType {
  followers: string[];
  followUser: (userId: string) => void;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export const FollowProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [followers, setFollowers] = useState<string[]>([]);
  const { suggestUsers, setSuggestUsers, setAllUsers } = useUserContext();
  const { user, setUser } = useProfileContext();
  const { auth, account } = useAuthContext();
  const followUser = useCallback(
    async (userId: string) => {
      try {
        if (!userId || !auth?.token) return;
        const response = (await userFetcher.followUser(
          userId,
          auth.token
        )) as unknown as FollowData;

        setSuggestUsers((prev) => prev.filter((user) => user._id !== userId));

        setUser((prevUser) => {
          if (!prevUser) return prevUser;

          const userToFollow = suggestUsers.find((user) => user._id === userId);

          if (response.message === "User followed successfully!") {
            return {
              ...prevUser,
              following: [...(prevUser.following ?? []), userId],
              followingData: userToFollow
                ? [
                    ...(prevUser.followingData || []),
                    { ...userToFollow, followed: true },
                  ]
                : prevUser.followingData,
              followersData: prevUser.followersData?.map((user) =>
                user._id === userId ? { ...user, followed: true } : user
              ),
            };
          } else {
            return {
              ...prevUser,
              following:
                prevUser.following?.filter((id) => id !== userId) ?? [],
              followingData: prevUser.followingData?.filter(
                (user) => user._id !== userId
              ),
              followersData: prevUser.followersData?.map((user) =>
                user._id === userId ? { ...user, followed: false } : user
              ),
            };
          }
        });

        setAllUsers((prev) =>
          prev.map((user) =>
            user._id === userId ? { ...user, followed: !user.followed } : user
          )
        );
      } catch (error) {
        console.error("Failed to follow user:", error);
      }
    },
    [auth?.token, suggestUsers]
  );
  return (
    <FollowContext.Provider value={{ followers, followUser }}>
      {children}
    </FollowContext.Provider>
  );
};

export const useFollowContext = () => {
  const context = useContext(FollowContext);
  if (!context) {
    throw new Error("useFollowContext must be used within a FollowProvider");
  }
  return context;
};
