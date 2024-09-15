import React, { useEffect, useState } from 'react';
import MadePostCard from './MadePostCard';
import { MadePostData, MadePostUpdate, postFetcher, PostInfo } from '../../../api/post';
import MadePostSkeleton from '../../skeleton/MadePostSkeleton';
import { useToastContext } from '../../../hooks/useToastContext';
import { useSocket } from '../../../hooks/useSocketContext';

interface MadeSectionProps {
  post: PostInfo;
  token: string;
}

const MadeSection: React.FC<MadeSectionProps> = ({ post, token }) => {
  const [madePosts, setMadePosts] = useState<MadePostData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { success, error } = useToastContext();
  const { socket } = useSocket();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await postFetcher.getMadeRecipeOfPost(post._id, token);
        const posts = response  as unknown as MadePostData[];
        setMadePosts(posts);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [post, token, madePosts]);

  useEffect(() => {
    if (!socket) return;

    const handleMadeUpdate = async (id: string) => {
      try {
        const updatedMadePost = await postFetcher.getMadeRecipeById(id, token) as unknown as MadePostData;
        console.log(post);
        updatedMadePost.author = post.author;

        setMadePosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === id ? updatedMadePost : post
          ) as MadePostData[]
        );
      } catch (error) {
        console.error('Error updating post:', error);
      }
    };

    socket.on('made-update', handleMadeUpdate);

    return () => {
      socket.off('made-update', handleMadeUpdate);
    };
  }, [socket, token]);

  const totalPosts = madePosts.length;
  const averageRating =
    totalPosts > 0
      ? madePosts.reduce((acc, post) => acc + Number(post.rating), 0) / totalPosts
      : 0;

  const handleSubmitMadeModal = async (
    _id: string,
    review: string,
    rating: number,
    newImage: string | null
  ) => {
    const data: MadePostUpdate = {};
    if (review) data.review = review;
    if (rating) data.rating = rating;
    if (newImage) data.image = newImage;

    try {
      if (!socket || !token) return;
      await postFetcher.updateMadeRecipe(_id, data, token);
      success('Updated made successfully');
      madePosts[0].image = 'Test image';

      const handleMadeUpdate = async (id: string) => {
        if (id === _id) {
          try {
            const updatedMadePost = await postFetcher.getMadeRecipeById(_id, token) as unknown as MadePostData;
            const currentPost = madePosts.find((post) => post._id === _id);
            if (!currentPost) return;
            updatedMadePost.author = currentPost.author;
            setMadePosts((prevPosts) =>
              prevPosts.map((post) =>
                post._id === _id ? updatedMadePost : post
              ) as MadePostData[]
            );
            socket.off('made-update', handleMadeUpdate);
          } catch (error) {
            console.error('Error updating post:', error);
          }
        }
      };

      socket.on('made-update', handleMadeUpdate);
    } catch (err) {
      error("Can't update made", (err as Error).message);
    }
  };

  const handleDeleteMadeModal = async (_id: string) => {
    try {
      await postFetcher.deleteMadeRecipe(_id, token);
      setMadePosts((prevPosts) => prevPosts.filter((post) => post._id !== _id));
      success('Deleted made successfully');
    } catch (err) {
      error("Can't delete made", (err as Error).message);
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      {loading ? (
        <div className="flex flex-col gap-4">
          {/* Summary Skeleton */}
          <div className="p-4 flex flex-row items-center justify-center gap-20">
            <div className="flex flex-col items-center">
              <div className="w-24 h-6 bg-gray-300 animate-pulse mb-2"></div>
              <div className="w-16 h-8 bg-gray-300 animate-pulse"></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-24 h-6 bg-gray-300 animate-pulse mb-2"></div>
              <div className="w-16 h-8 bg-gray-300 animate-pulse"></div>
            </div>
          </div>

          {/* Post Skeletons */}
          {[1, 2, 3].map((_, index) => (
            <MadePostSkeleton key={index} />
          ))}
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
                <p className="text-2xl font-bold mr-2">{averageRating.toFixed(1)}</p>
                <div className="flex">
                  {[...Array(5)].map((_, index) => (
                    <svg
                      key={index}
                      className={`w-6 h-6 ${index < Math.round(averageRating) ? 'text-yellow-500' : 'text-gray-300'}`}
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
          {madePosts.map((madePost) =>
            madePost.image === 'Test image' ? (
              <MadePostSkeleton key={madePost._id} />
            ) : (
              <MadePostCard
                key={madePost._id}
                _id={madePost._id}
                post={post}
                author={madePost.author}
                createdAt={new Date(madePost.createdAt)}
                review={madePost.review}
                profileImageUrl={madePost.author.avatar}
                productImageUrl={madePost.image}
                rating={Number(madePost.rating)}
                onSubmit={handleSubmitMadeModal}
                onDelete={handleDeleteMadeModal}
              />
            )
          )}
        </>
      )}
    </div>
  );
};

export default MadeSection;
