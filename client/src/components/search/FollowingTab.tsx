import { useEffect, useRef, useState } from "react";
import { useSearchContext } from "../../context/SearchContext";
import Post from "../posts/PostInfo";

const FollowingTab: React.FC = () => {
  const {
    posts,
    isLoading,
    loadMorePosts,
    hasMore,
    searchQuery
  } = useSearchContext();
  const observerRef = useRef<HTMLDivElement | null>(null);
  const { cookingTimeRange, setCookingTimeRange } = useSearchContext();
  const [filteredPosts, setFilteredPosts] = useState(posts);

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
      if (observerRef.current) observer.disconnect();
    };
  }, [loadMorePosts, isLoading, hasMore]);

  const parseTime = (time: string) => {
    const timeParts = time.match(/(\d+)(h|m)/g);
    let totalMinutes = 0;

    if (timeParts) {
      timeParts.forEach(part => {
        const value = parseInt(part.slice(0, -1));
        const unit = part.slice(-1);

        if (unit === 'h') {
          totalMinutes += value * 60;
        } else if (unit === 'm') {
          totalMinutes += value;
        }
      });
    }

    return totalMinutes;
  };

  useEffect(() => {
    if (cookingTimeRange[0] === "" || cookingTimeRange[1] === "") return;
    const filtered = posts.filter((post) => {
      const timeToTake = parseTime(post.timeToTake);
      return (
        timeToTake >= Number(cookingTimeRange[0]) && timeToTake <= Number(cookingTimeRange[1])
      );
    });

    setFilteredPosts(filtered);
  }, [cookingTimeRange, posts]);

  useEffect(() => {
    setCookingTimeRange([0, 1440]);
    setFilteredPosts(posts);
  }
  , [searchQuery]);

  return (
    <div>
      {/* Posts */}
      <div>
        {filteredPosts.map((post) => (
          <Post key={post._id} post={post} />
        ))}
        {isLoading && <p>Loading...</p>}
      </div>

      {/* Observer element */}
      <div ref={observerRef} style={{ height: 20 }}></div>
    </div>
  );
};

export default FollowingTab;
