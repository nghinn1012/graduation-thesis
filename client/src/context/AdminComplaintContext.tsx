import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useToastContext } from "../hooks/useToastContext";
import { ComplaintData, ComplaintResponse, postFetcher } from "../api/post";

interface AdminComplaintType {
  complaints: ComplaintData[];
  loading: boolean;
  fetchComplaints: () => Promise<void>;
  setComplaints: React.Dispatch<React.SetStateAction<ComplaintData[]>>;
  updateComplaintStatus: (complaintId: string, newStatus: string) => Promise<void>;
}

const AdminComplaintContext = createContext<AdminComplaintType | undefined>(undefined);

export const AdminComplaintProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [complaints, setComplaints] = useState<ComplaintData[]>([]);
  const [loading, setLoading] = useState(false);
  const { auth } = useAuthContext();
  const { error, success } = useToastContext();
  const limit = 10;

  const fetchComplaints = useCallback(async () => {
    if (!auth?.token || loading) return;

    setLoading(true);
    try {
      const response = await postFetcher.getComplaints(auth.token) as unknown as ComplaintData[];
      setComplaints(response);
    } catch (err) {
      error("Không thể tải khiếu nại.");
    } finally {
      setLoading(false);
    }
  }, [auth?.token, loading]);

  const updateComplaintStatus = useCallback(async (complaintId: string, newStatus: string) => {
    if (!auth?.token) return;

    setLoading(true);
    try {
      await postFetcher.updateComplaintStatus(complaintId, newStatus, auth.token);

      setComplaints(prevComplaints =>
        prevComplaints.map(complaint =>
          complaint._id === complaintId
            ? { ...complaint, status: newStatus }
            : complaint
        )
      );

      success("Cập nhật trạng thái khiếu nại thành công.");
    } catch (err) {
      error("Không thể cập nhật trạng thái khiếu nại.");
    } finally {
      setLoading(false);
    }
  }, [auth?.token]);

  useEffect(() => {
    if (auth?.token) {
      fetchComplaints();
    }
  }, [auth?.token]);

  return (
    <AdminComplaintContext.Provider
      value={{
        complaints,
        loading,
        fetchComplaints,
        setComplaints,
        updateComplaintStatus,
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
