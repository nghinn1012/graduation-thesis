import { useEffect, useRef, useState } from "react";
import { useSearchContext } from "../../context/SearchContext";
import { useNavigate } from "react-router-dom";
import Post from "../posts/PostInfo";
import PostSkeleton from "../skeleton/PostSkeleton";
import SearchFilterModal from "./SearchFilterModal";

interface Filters {
  cookingTimeRange: [number, number];
  minQuality: number;
  difficulty: string[];
  haveMade: boolean;
  hashtags: string[];
}

interface FollowingTabProps {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const FollowingTab: React.FC<FollowingTabProps> = ({isModalOpen, setIsModalOpen}) => {
  const navigate = useNavigate();
  const observerRef = useRef<HTMLDivElement | null>(null);
  const {
    searchQuery,
    cookingTimeRange,
    setCookingTimeRange,
    setMinQuality,
    minQuality,
    setCurrentPage,
    setPosts,
    haveMade,
    setHaveMade,
    difficulty,
    setDifficulty,
    hashtagsSearch,
    setHashtagsSearch,
    posts,
    isLoading,
    loadMorePosts,
    hasMore,
  } = useSearchContext();

  const [filters, setFilters] = useState<Filters>({
    cookingTimeRange: cookingTimeRange as [number, number] || [0, 1440],
    minQuality: minQuality || 0,
    difficulty: difficulty || ["easy", "medium", "hard"],
    haveMade: haveMade || false,
    hashtags: hashtagsSearch || [],
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoading) {
          loadMorePosts();
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.disconnect();
      }
    };
  }, [loadMorePosts, isLoading, hasMore]);

  const applyFilters = async (newFilters: Filters) => {
    setFilters(newFilters);

    const shouldResetPosts =
      newFilters.cookingTimeRange[0] !== cookingTimeRange[0] ||
      newFilters.cookingTimeRange[1] !== cookingTimeRange[1] ||
      newFilters.minQuality !== minQuality ||
      newFilters.haveMade !== haveMade ||
      JSON.stringify(newFilters.difficulty) !== JSON.stringify(difficulty) ||
      JSON.stringify(newFilters.hashtags) !== JSON.stringify(hashtagsSearch);

    if (shouldResetPosts) {
      setCurrentPage(1);
      setPosts([]);
    }

    setCookingTimeRange(newFilters.cookingTimeRange);
    setMinQuality(newFilters.minQuality);
    setHaveMade(newFilters.haveMade);
    setDifficulty(newFilters.difficulty);
    setHashtagsSearch(newFilters.hashtags);

    const params = new URLSearchParams();
    params.append("searchQuery", searchQuery);
    params.append("cookingTimeRangeMin", newFilters.cookingTimeRange[0].toString());
    params.append("cookingTimeRangeMax", newFilters.cookingTimeRange[1].toString());
    params.append("minQuality", newFilters.minQuality.toString());
    params.append("haveMade", newFilters.haveMade.toString());

    if (newFilters.difficulty.length > 0) {
      params.append("difficulty", newFilters.difficulty.join(","));
    }

    if (newFilters.hashtags.length > 0) {
      params.append("hashtags", newFilters.hashtags.join(","));
    }

    const newUrl = `/users/search?${params.toString()}`;
    navigate(newUrl);

    setIsModalOpen(false);
  };

  return (
    <div className="w-full">
      <SearchFilterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApplyFilters={applyFilters}
        initialFilters={filters}
      />

      <div className="space-y-4">
        {!isLoading && posts.map((post) => (
          <Post key={post._id} post={post} />
        ))}

        {isLoading && (
          <div className="space-y-4">
            <PostSkeleton />
            <PostSkeleton />
          </div>
        )}

        {posts.length === 0 && !isLoading && !hasMore && (
          <p className="text-center text-gray-500">
            No posts found for "{searchQuery}".
          </p>
        )}
      </div>

      <div ref={observerRef} className="h-5" />
    </div>
  );
};

export default FollowingTab;
