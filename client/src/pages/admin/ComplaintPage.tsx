import { useAdminComplaintContext } from "../../context/AdminComplaintContext";
import { formatDistance } from "date-fns";
import { useI18nContext } from "../../hooks/useI18nContext";
import { AiOutlineEye } from "react-icons/ai";
import { useEffect, useState } from "react";
import { ComplaintData } from "../../api/post";
import { ComplaintModal } from "../../components/admin/ComplaintModal";

const ComplaintPage = () => {
  const { complaints, loading, loadMoreComplaints, hasMore, fetchComplaints } = useAdminComplaintContext();
  const language = useI18nContext();
  const lang = language.of("ReportSection");
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintData | null>(null);

  useEffect(() => {
    if (complaints.length === 0) {
      fetchComplaints();
    }
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending":
        return "badge-warning";
      case "resolved":
        return "badge-success";
      case "rejected":
        return "badge-error";
      default:
        return "badge-primary";
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100 &&
        hasMore &&
        !loading
      ) {
        loadMoreComplaints();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading, loadMoreComplaints]);

  return (
    <>
      <div className="flex flex-col gap-10 w-full">
        <div className="card bg-base-100 shadow-xl">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Complainter</th>
                  <th>Complaint Details</th>
                  <th>Filed Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint, key) => (
                  <tr key={complaint._id || key}>
                    <td>{complaint.user?.name}</td>
                    <td>{lang(complaint.reason)}</td>
                    <td>
                      <div>{new Date(complaint.createdAt).toLocaleDateString()}</div>
                      <div className="text-xs opacity-60">
                        {formatDistance(new Date(complaint.createdAt), new Date(), { addSuffix: true })}
                      </div>
                    </td>
                    <td>
                      <div className={`badge ${getStatusStyle(complaint.status)}`}>
                        {complaint.status}
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setSelectedComplaint(complaint)}
                      >
                        <AiOutlineEye size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {loading && (
            <div className="flex justify-center p-4">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          )}
        </div>
      </div>

      <ComplaintModal
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
      />
    </>
  );
};

export default ComplaintPage;
