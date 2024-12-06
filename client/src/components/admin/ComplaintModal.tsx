// ComplaintModal.tsx
import { ComplaintData } from "../../api/post";
import { useI18nContext } from "../../hooks/useI18nContext";
import { formatDistance } from "date-fns";

interface ComplaintModalProps {
  complaint: ComplaintData | null;
  onClose: () => void;
}

export const ComplaintModal = ({ complaint, onClose }: ComplaintModalProps) => {
  const language = useI18nContext();
  const lang = language.of("ReportSection");

  if (!complaint) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-4xl">
        <h3 className="font-bold text-lg mb-6">Complaint Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Reporter Information</h4>
              <p className="text-sm opacity-70">{complaint.user?.name}</p>
              <p className="text-xs opacity-60">
                {formatDistance(new Date(complaint.createdAt), new Date(), { addSuffix: true })}
              </p>
            </div>
            <div>
              <h4 className="font-medium">Report Reason</h4>
              <p className="text-sm opacity-70">{lang(complaint.reason)}</p>
            </div>
          </div>

          {complaint.post && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium">Recipe Information</h4>
                <p className="font-medium mt-2">{complaint.post.title}</p>
                <p className="text-sm opacity-70 mt-1">{complaint.post.about}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Time:</span> {complaint.post.timeToTake} minutes
                </div>
                <div>
                  <span className="font-medium">Servings:</span> {complaint.post.servings}
                </div>
                <div>
                  <span className="font-medium">Difficulty:</span> {complaint.post.difficulty}
                </div>
                <div>
                  <span className="font-medium">Course:</span> {complaint.post.course?.join(", ")}
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-2">Ingredients</h5>
                <ul className="list-disc pl-4 text-sm space-y-1">
                  {complaint.post.ingredients?.map((ing, idx) => (
                    <li key={idx}>{ing.quantity} {ing.name}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="font-medium mb-2">Instructions</h5>
                <div className="space-y-2">
                  {complaint.post.instructions?.map((inst, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="font-medium">Step {inst.step}:</span> {inst.description}
                      {inst.image && (
                        <img src={inst.image} alt={`Step ${inst.step}`} className="mt-2 rounded" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {complaint.post.images && complaint.post.images.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Recipe Images</h5>
                  <div className="grid grid-cols-2 gap-4">
                    {complaint.post.images.map((img, idx) => (
                      <img key={idx} src={img} alt={`Recipe ${idx + 1}`} className="rounded" />
                    ))}
                  </div>
                </div>
              )}

              <div className="text-sm opacity-70">
                <span className="font-medium">Engagement:</span>
                <span className="ml-2">❤️ {complaint.post.likeCount}</span>
                <span className="ml-2">💾 {complaint.post.savedCount}</span>
                <span className="ml-2">💬 {complaint.post.commentCount}</span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-action">
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};
