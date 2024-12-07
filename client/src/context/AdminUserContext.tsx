import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useToastContext } from "../hooks/useToastContext";
import { userFetcher } from "../api/user";

interface UserData {
  _id: string;
  name: string;
  email: string;
  username: string;
  avatar?: string;
  verify: number;
  createdAt: string;
  role: string;
}

interface AdminUserType {
  users: UserData[];
  loading: boolean;
  fetchUsers: () => Promise<void>;
  setUsers: React.Dispatch<React.SetStateAction<UserData[]>>;
  updateUserStatus: (userId: string, isBanned: boolean) => Promise<void>;
}

const AdminUserContext = createContext<AdminUserType | undefined>(undefined);

export const AdminUserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const { auth } = useAuthContext();
  const { error, success } = useToastContext();

  const fetchUsers = useCallback(async () => {
    if (!auth?.token || loading) return;

    setLoading(true);
    try {
      const response = await userFetcher.getAllUsers(auth.token) as unknown as UserData[];
      if (!response) throw new Error('Failed to fetch users');
      setUsers(response);
    } catch (err) {
      error("Could not load users.");
    } finally {
      setLoading(false);
    }
  }, [auth?.token, loading]);

  const updateUserStatus = useCallback(async (userId: string) => {
    if (!auth?.token) return;

    setLoading(true);
    try {
      const response = await userFetcher.banned(userId, auth.token) as unknown as UserData;
      if (!response) throw new Error('Failed to fetch users');

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId
            ? { ...user, verify: user.verify == 2 ? 1 : 2 }
            : user
        )
      );

      success(`User has been ${response.verify == 2 ? 'banned' : 'unbanned'} successfully.`);
    } catch (err) {
      error("Could not update user status.");
    } finally {
      setLoading(false);
    }
  }, [auth?.token]);

  useEffect(() => {
    if (auth?.token) {
      fetchUsers();
    }
  }, [auth?.token]);

  return (
    <AdminUserContext.Provider
      value={{
        users,
        loading,
        fetchUsers,
        setUsers,
        updateUserStatus,
      }}
    >
      {children}
    </AdminUserContext.Provider>
  );
};

export const useAdminUserContext = (): AdminUserType => {
  const context = useContext(AdminUserContext);
  if (!context) {
    throw new Error("useAdminUser must be used within AdminUserProvider");
  }
  return context;
};

export default AdminUserContext;
