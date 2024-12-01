import { useEffect, useRef, useState } from "react";
import { useSearchContext } from "../../context/SearchContext";
import { useNavigate } from "react-router-dom";
import Post from "../posts/PostInfo";
import PostSkeleton from "../skeleton/PostSkeleton";
import SearchFilterModal from "./SearchFilterModal";
import { useI18nContext } from "../../hooks/useI18nContext";

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
}

const FollowingTab: React.FC<FollowingTabProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
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
    timeOrder,
    qualityOrder,
    setTimeOrder,
    setQualityOrder,
    posts,
    isLoading,
    loadMorePosts,
    hasMore,
  } = useSearchContext();

  const [filters, setFilters] = useState<Filters>({
    cookingTimeRange: (cookingTimeRange as [number, number]) || [0, 1440],
    minQuality: minQuality || 0,
    difficulty: difficulty || ["easy", "medium", "hard"],
    haveMade: haveMade || false,
    hashtags: hashtagsSearch || [],
  });
  const language = useI18nContext();
  const lang = language.of("RightPanel");

  const toggleSort = (type: "time" | "quality") => {
    if (type === "time") {
      setTimeOrder((prev) => (prev === 1 ? -1 : 1));
    } else {
      setQualityOrder((prev) => (prev === 1 ? -1 : 1));
    }
  };

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
    params.append(
      "cookingTimeRangeMin",
      newFilters.cookingTimeRange[0].toString()
    );
    params.append(
      "cookingTimeRangeMax",
      newFilters.cookingTimeRange[1].toString()
    );
    params.append("minQuality", newFilters.minQuality.toString());
    params.append("haveMade", newFilters.haveMade.toString());
    params.append("timeOrder", timeOrder.toString());
    params.append("qualityOrder", qualityOrder.toString());

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

  const getSortButtonClass = (sortValue: number) => {
    const baseClass = "btn gap-2";
    if (sortValue === 0) return `${baseClass} btn-ghost`;
    return `${baseClass} btn-gray-200`;
  };

  const getSortIcon = (sortValue: number) => {
    if (sortValue === 1) return "↑";
    if (sortValue === -1) return "↓";
    return "↕";
  };

  return (
    <div className="w-full">
      {/* Sort Controls */}
      <div className="grid grid-cols-3 gap-2 border-b">
        <button
          onClick={() => toggleSort("time")}
          className={`${getSortButtonClass(timeOrder)} w-full`}
          aria-label="Sort by time"
        >
          <i className="fas fa-clock" /> {lang("time")} {getSortIcon(timeOrder)}
        </button>

        <button
          onClick={() => toggleSort("quality")}
          className={`${getSortButtonClass(qualityOrder)} w-full`}
          aria-label="Sort by quality"
        >
          <i className="fas fa-star" /> {lang("quality")} {getSortIcon(qualityOrder)}
        </button>

        <button
          onClick={() => {
            setTimeOrder(0);
            setQualityOrder(0);
          }}
          className="btn btn-ghost w-full"
          aria-label="Reset sort"
        >
          <i className="fas fa-undo" /> {lang("reset")}
        </button>
      </div>

      <SearchFilterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApplyFilters={applyFilters}
        initialFilters={filters}
      />

      <div className="space-y-4">
        {!isLoading && posts.map((post) => <Post key={post._id} post={post} />)}

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
