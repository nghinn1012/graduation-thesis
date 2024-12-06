import { useEffect } from "react";
import Post from "../../components/posts/PostInfo";
import PostSkeleton from "../../components/skeleton/PostSkeleton";
import { useProfileContext } from "../../context/ProfileContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { useI18nContext } from "../../hooks/useI18nContext";

const SavedListPage = () => {
  const { postSaved, fetchSavedPosts, isLoadingSaved } = useProfileContext();
  const { account } = useAuthContext();
  const language = useI18nContext();
  const lang = language.of("SavedListPage");


  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchSavedPosts();
      } catch (error) {
        console.error("Error loading posts:", error);
      }
    };
    loadData();
  }, [fetchSavedPosts, account?._id]);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <BsBookmarkFill className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold">{lang("saved-posts")}</h1>
        </div>
        <p className="text-gray-600">
          {lang("saved-posts-desc")}
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 mb-6"></div>

      {/* Content Section */}
      <div className="space-y-4">
        {isLoadingSaved && (
          <div className="space-y-4">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        )}

        {!isLoadingSaved && postSaved.length === 0 && (
          <div className="text-center py-8">
            <BsBookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{lang("no-saved-posts")}</h2>
            <p className="text-gray-600">
              {lang("no-saved-posts-desc")}
            </p>
          </div>
        )}

        {!isLoadingSaved && postSaved.length > 0 && (
          <div className="space-y-4">
            {postSaved.map((post) => (
              <div key={post?._id} className="bg-white rounded-lg shadow-sm">
                <Post post={post} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedListPage;
