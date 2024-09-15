import React, { useEffect, useState } from "react";
import MadePostCard from "./MadePostCard";
import { MadePostData, postFetcher } from "../../../api/post";

interface MadeSectionProps {
  postId: string;
  token: string;
}

const MadeSection: React.FC<MadeSectionProps> = ({ postId, token }) => {
  const [madePosts, setMadePosts] = useState<MadePostData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await postFetcher.getMadeRecipeOfPost(postId, token);
        setMadePosts(response as unknown as MadePostData[]);
        console.log(response);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [postId, token]);

  const totalPosts = madePosts.length;
  const averageRating =
    totalPosts > 0
      ? madePosts.reduce((acc, post) => acc + Number(post.rating), 0) /
        totalPosts
      : 0;

  return (
    <div className="mt-4 flex flex-col gap-4">
      {/* Loading Indicator */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <p className="text-lg font-semibold">Loading...</p>
        </div>
      ) : (
        <>
          {/* Summary Section */}
          <div className="p-4 flex flex-row items-center justify-center gap-20">
            <div className="flex flex-col items-center">
              <p className="text-lg font-semibold">Total Posts</p>
              <p className="text-2xl font-bold mt-1">{totalPosts}</p>
            </div>

            <div className="flex flex-col items-center">
              <p className="text-lg font-semibold">Average Rating</p>
              <div className="flex items-center mt-1">
                <p className="text-2xl font-bold mr-2">
                  {averageRating.toFixed(1)}
                </p>
                <div className="flex">
                  {[...Array(5)].map((_, index) => (
                    <svg
                      key={index}
                      className={`w-6 h-6 ${
                        index < Math.round(averageRating)
                          ? "text-yellow-500"
                          : "text-gray-300"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M12 17.27L18.18 21l-1.45-6.29L22 9.24l-6.36-.55L12 2 8.36 8.69 2 9.24l4.27 5.47L4.82 21z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* List of MadePostCard Components */}
          {madePosts.map((post) => (
            <MadePostCard
              key={post._id}
              author={post.author}
              createdAt={new Date(post.createdAt)} // Ensure proper Date object
              review={post.review}
              profileImageUrl={post.image}
              productImageUrl={post.image}
              rating={Number(post.rating)}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default MadeSection;
