import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useToastContext } from "../hooks/useToastContext";
import { ComplaintData, ComplaintResponse, postFetcher } from "../api/post";

interface AdminComplaintType {
  complaints: ComplaintData[];
  loading: boolean;
  loadMoreComplaints: () => void;
  hasMore: boolean;
  fetchComplaints: () => Promise<void>;
  setComplaints: React.Dispatch<React.SetStateAction<ComplaintData[]>>;
}
const AdminComplaintContext = createContext<AdminComplaintType | undefined>(undefined);
export const AdminComplaintProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [complaints, setComplaints] = useState<ComplaintData[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { auth } = useAuthContext();
  const { error } = useToastContext();
  const limit = 10;

  const fetchComplaints = useCallback(async (page: number) => {
    if (!auth?.token || loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await postFetcher.getComplaints(page, limit, auth.token) as unknown as ComplaintResponse;

      if (page === 1) {
        setComplaints(response.complaints);
      } else {
        setComplaints(prev => [...prev, ...response.complaints]);
      }

      setHasMore(response.complaints.length === limit);
    } catch (err) {
      error("Không thể tải khiếu nại.");
    } finally {
      setLoading(false);
    }
  }, [auth?.token, loading, hasMore]);

  const loadMoreComplaints = useCallback(() => {
    if (!loading && hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  useEffect(() => {
    if (auth?.token) {
      setCurrentPage(1);
      fetchComplaints(1);
    }
  }, [auth?.token]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchComplaints(currentPage);
    }
  }, [currentPage]);

  return (
    <AdminComplaintContext.Provider
      value={{
        complaints,
        loading,
        loadMoreComplaints,
        hasMore,
        fetchComplaints: () => fetchComplaints(1),
        setComplaints,
      }}
    >
      {children}
    </AdminComplaintContext.Provider>
  );
};

export const useAdminComplaintContext = (): AdminComplaintType => {
  const context = useContext(AdminComplaintContext);
  if (!context) {
    throw new Error("useAdminComplaint must be used within AdminComplaintProvider");
  }
  return context;
};

export default AdminComplaintContext;
