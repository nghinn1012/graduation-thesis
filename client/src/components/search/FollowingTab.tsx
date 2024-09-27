import { useEffect } from "react";
import { useSearchContext } from "../../context/SearchContext";
import Post from "../posts/PostInfo";

const FollowingTab: React.FC = () => {
  const {
    posts,
    isLoading,
    loadMorePosts,
    hasMore,
  } = useSearchContext();

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        !== document.documentElement.offsetHeight || isLoading
      ) return;
      loadMorePosts();
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMorePosts, isLoading]);

  return (
    <div>
      <div>
        {posts.map((post) => (
          <Post key={post._id} post={post} />
        ))}
        {isLoading && <p>Loading...</p>}
      </div>
    </div>
  );
};

export default FollowingTab;
