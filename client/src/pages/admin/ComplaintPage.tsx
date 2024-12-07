import { useAdminComplaintContext } from "../../context/AdminComplaintContext";
import { formatDistance } from "date-fns";
import { useI18nContext } from "../../hooks/useI18nContext";
import { AiOutlineEye } from "react-icons/ai";
import { useEffect, useState, useMemo } from "react";
import { ComplaintData } from "../../api/post";
import { ComplaintModal } from "../../components/admin/ComplaintModal";
import { StatusUpdateModal } from "../../components/admin/StatusUpdateModal";
import { MdUpdate } from "react-icons/md";
import { enUS, vi } from "date-fns/locale";

const STATUSES = ["all", "pending", "resolved", "rejected"] as const;
type StatusType = typeof STATUSES[number];

const ComplaintPage = () => {
  const { complaints, loading, fetchComplaints } = useAdminComplaintContext();
  const language = useI18nContext();
  const lang = language.of("ReportSection", "AdminSection");
  const langCode = language.language.code;
  const locale = langCode == "en" ? enUS : vi;
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintData | null>(null);
  const [statusUpdateComplaint, setStatusUpdateComplaint] = useState<ComplaintData | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<StatusType>("all");

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

  const filteredComplaints = useMemo(() => {
    if (selectedStatus === "all") return complaints;
    return complaints.filter(complaint => complaint.status === selectedStatus);
  }, [complaints, selectedStatus]);

  useEffect(() => {
    if (complaints.length === 0) {
      fetchComplaints();
    }
  }, [complaints, fetchComplaints]);

  return (
    <>
      <div className="flex flex-col gap-10 w-full">
        <div className="card bg-base-100 shadow-xl">
          {/* Status Filter */}
          <div className="p-4 border-b">
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`btn btn-sm ${
                    selectedStatus === status
                      ? 'btn-primary'
                      : 'btn-ghost'
                  }`}
                >
                  {lang(status)}
                  {status !== 'all' && (
                    <span className="ml-2 badge badge-sm">
                      {complaints.filter(c => c.status === status).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>{lang("complainters")}</th>
                  <th>{lang("complaint-details")}</th>
                  <th>{lang("filed-date")}</th>
                  <th>{lang("status")}</th>
                  <th>{lang("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((complaint, index) => (
                  <tr key={complaint._id || index}>
                    <td>{complaint.user?.name}</td>
                    <td>{lang(complaint.reason)}</td>
                    <td>
                      <div>{new Date(complaint.createdAt).toLocaleDateString(langCode == "en" ? "en-US" : "vi-VN")}</div>
                      <div className="text-xs opacity-60">
                        {formatDistance(new Date(complaint.createdAt), new Date(), { addSuffix: true, locale })}
                      </div>
                    </td>
                    <td>
                      <div className={`badge ${getStatusStyle(complaint.status)}`}>
                        {lang(complaint.status)}
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setSelectedComplaint(complaint)}
                        >
                          <AiOutlineEye size={20} />
                        </button>
                        {complaint.status === "pending" && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setStatusUpdateComplaint(complaint)}
                          >
                            <MdUpdate size={20} />
                          </button>
                        )}
                      </div>
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

          {!loading && filteredComplaints.length === 0 && (
            <div className="text-center p-4 text-gray-500">
              No complaints found for the selected status
            </div>
          )}
        </div>
      </div>

      <ComplaintModal
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
      />

      <StatusUpdateModal
        complaint={statusUpdateComplaint}
        onClose={() => setStatusUpdateComplaint(null)}
      />
    </>
  );
};

export default ComplaintPage;
