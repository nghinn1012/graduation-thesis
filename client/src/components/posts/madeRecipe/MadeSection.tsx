import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
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
  const [loadingPosts, setLoadingPosts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { success, error } = useToastContext();
  const { socket } = useSocket();

  // State để lưu lỗi xác thực
  const [validationError, setValidationError] = useState<{rating?: string, review?: string}>({});

  // Schema xác thực với yup
  const madePostSchema = yup.object().shape({
    review: yup.string().required('Review is required'),
    rating: yup
      .number()
      .required('Rating is required')
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating cannot exceed 5'),
  });

  useEffect(() => {
    if (!socket || !token) return;
    const fetchPosts = async () => {
      try {
        const response = await postFetcher.getMadeRecipeOfPost(post._id, token);
        const posts = response as unknown as MadePostData[];
        setMadePosts(posts);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };
    socket.on("made-create", () => {
      fetchPosts();
      return;
    });
    fetchPosts();
    return () => {
      socket.off('made-create', () => {});
    };
  }, [post, token]);

  useEffect(() => {
    if (!socket) return;

    const handleMadeUpdate = async (id: string) => {
      try {
        const updatedMadePost = await postFetcher.getMadeRecipeById(id, token) as unknown as MadePostData;
        const author = madePosts.find((post) => post._id === id)?.author;
        if (!author) return;
        updatedMadePost.author = author;

        setMadePosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === id ? updatedMadePost : post
          ) as MadePostData[]
        );

        setLoadingPosts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      } catch (error) {
        console.error('Error updating post:', error);
      }
    };

    socket.on('made-update', handleMadeUpdate);

    return () => {
      socket.off('made-update', handleMadeUpdate);
    };
  }, [socket, token, madePosts]);

  const handleSubmitMadeModal = async (
    _id: string,
    review: string,
    rating: number,
    newImage: string | undefined
  ) => {
    const data: MadePostUpdate = {};
    if (review) data.review = review;
    if (rating) data.rating = rating;

    if (newImage) {
      if (newImage === madePosts.find((post) => post._id === _id)?.image) {
        data.image = undefined;
      } else {
        data.image = newImage;
      }
    }

    try {
      // Xác thực dữ liệu với yup
      await madePostSchema.validate({ review, rating });
      setValidationError({}); // Xóa lỗi trước đó nếu xác thực thành công

      if (!socket || !token) return;

      setLoadingPosts((prev) => new Set(prev).add(_id));

      await postFetcher.updateMadeRecipe(_id, data, token);
      success('Updated made successfully');

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

            setLoadingPosts((prev) => {
              const newSet = new Set(prev);
              newSet.delete(_id);
              return newSet;
            });

            socket.off('made-update', handleMadeUpdate);
          } catch (error) {
            console.error('Error updating post:', error);
          }
        }
      };

      socket.on('made-update', handleMadeUpdate);
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setValidationError({
          review: err.path === 'review' ? err.message : undefined,
          rating: err.path === 'rating' ? err.message : undefined,
        });
      } else {
        error("Can't update made", (err as Error).message);
      }

      setLoadingPosts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(_id);
        return newSet;
      });
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

  const totalPosts = madePosts.length;
  const averageRating =
    totalPosts > 0
      ? madePosts.reduce((acc, post) => acc + Number(post.rating), 0) / totalPosts
      : 0;

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
            (loadingPosts.has(madePost._id) || madePost.image === "Test image") ? (
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
                validationErrors={validationError}
              />
            )
          )}
        </>
      )}
    </div>
  );
};

export default MadeSection;
