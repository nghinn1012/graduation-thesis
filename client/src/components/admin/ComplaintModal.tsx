// ComplaintModal.tsx
import { enUS, vi } from "date-fns/locale";
import { ComplaintData } from "../../api/post";
import { useI18nContext } from "../../hooks/useI18nContext";
import { formatDistance } from "date-fns";

interface ComplaintModalProps {
  complaint: ComplaintData | null;
  onClose: () => void;
}

export const ComplaintModal = ({ complaint, onClose }: ComplaintModalProps) => {
  const language = useI18nContext();
  const lang = language.of("ReportSection", "PostDetails", "AdminSection");
  const langCode = language.language.code;
  const locale = langCode === "en" ? enUS : vi;
  if (!complaint) return null;

  const handleShowTimeToTake = (timeToTake: number) => {
    if (!timeToTake) return lang("unknown");
    if (Number(timeToTake) < 60) return lang("minutes", timeToTake);
    const hours = Math.floor(Number(timeToTake) / 60);
    const minutes = Number(timeToTake) % 60;
    const modifiedHours = hours > 0 ? lang("hours", hours) : "";
    const modifiedMinutes = minutes > 0 ? lang("minutes", minutes) : "";
    return `${modifiedHours} ${modifiedMinutes}`;
  };

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-4xl">
        <h3 className="font-bold text-lg mb-6"></h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">{lang("complaint-details")}</h4>
              <p className="text-sm opacity-70">{complaint.user?.name}</p>
              <p className="text-xs opacity-60">
                {formatDistance(new Date(complaint.createdAt), new Date(), {
                  addSuffix: true,
                  locale,
                })}
              </p>
            </div>
            <div>
              <h4 className="font-medium">{lang("report-reason")}</h4>
              <p className="text-sm opacity-70">{lang(complaint.reason)}</p>
            </div>
          </div>

          {complaint.post && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium">{lang("recipe-info")}</h4>
                <p className="font-medium mt-2">{complaint.post.title}</p>
                <p className="text-sm opacity-70 mt-1">
                  {complaint.post.about}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">⏰</span>{" "}
                  {handleShowTimeToTake(complaint.post.timeToTake)}
                </div>
                <div>
                  <span className="font-medium">
                    {lang("servings", complaint.post.servings)}
                  </span>{" "}
                </div>
                <div>
                  <span className="font-medium">{lang("difficulty")}:</span>{" "}
                  {lang(complaint.post.difficulty)}
                </div>
                <div>
                  <span className="font-medium">{lang("courses")}:</span>{" "}
                  {complaint.post.course?.join(", ")}
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-2">{lang("ingredients")}</h5>
                <ul className="list-disc pl-4 text-sm space-y-1">
                  {complaint.post.ingredients?.map((ing, idx) => (
                    <li key={idx}>
                      {ing.quantity} {ing.name}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="font-medium mb-2">{lang("instructions")}</h5>
                <div className="space-y-2">
                  {complaint.post.instructions?.map((inst, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="font-medium">
                        {lang("step")} {inst.step}:
                      </span>{" "}
                      {inst.description}
                      {inst.image && (
                        <img
                          src={inst.image}
                          alt={`${lang("step")} ${inst.step}`}
                          className="mt-2 rounded"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {complaint.post.images && complaint.post.images.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">{lang("recipe-images")}</h5>
                  <div className="grid grid-cols-2 gap-4">
                    {complaint.post.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Recipe ${idx + 1}`}
                        className="rounded"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="text-sm opacity-70">
                <span className="font-medium">{lang("engagement")}:</span>
                <span className="ml-2">❤️ {complaint.post.likeCount}</span>
                <span className="ml-2">💾 {complaint.post.savedCount}</span>
                <span className="ml-2">💬 {complaint.post.commentCount}</span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            {lang("close")}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};
