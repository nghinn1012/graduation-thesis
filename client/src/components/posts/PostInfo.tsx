import {
  FaRegComment,
  FaRegHeart,
  FaRegBookmark,
  FaTrash,
  FaBookmark,
} from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import React from "react";
import { usePostContext } from "../../context/PostContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import { postFetcher, PostLikeResponse } from "../../api/post";
import { Toaster } from "react-hot-toast";
import { useToastContext } from "../../hooks/useToastContext";
import { useSearchContext } from "../../context/SearchContext";
import { useProfileContext } from "../../context/ProfileContext";

interface Ingredient {
  name: string;
  quantity: string;
}

interface Instruction {
  step: number;
  description: string;
  image?: string;
}

interface PostProps {
  post: {
    _id: string;
    title: string;
    author: {
      _id: string;
      name: string;
      avatar: string;
      username: string;
      email: string;
    };
    images: string[];
    hashtags: string[];
    timeToTake: number;
    servings: number;
    ingredients: Ingredient[];
    instructions: Instruction[];
    createdAt: string;
    updatedAt: string;
    likeCount: number;
    savedCount: number;
    commentCount: number;
    liked: boolean;
    saved: boolean;
  };
  locationPath?: string;
}

const Post: React.FC<PostProps> = ({ post, locationPath }) => {
  const postAuthor = post.author;
  const [isLiked, setIsLiked] = useState(post.liked);
  const [isSaved, setIsSaved] = useState(post.saved);
  const [isMyPost, setIsMyPost] = useState(false);
  const formattedDate = "1h";
  const navigate = useNavigate();
  const auth = useAuthContext();
  const { posts, setPosts, toggleLikePost, toggleSavePost, postCommentCounts } =
    usePostContext();
  const { toggleLikePostSearch, toggleSavePostSearch } = useSearchContext();
  const {toggleLikePostProfile, toggleSavePostProfile} = useProfileContext();
  const { success, error } = useToastContext();
  const [commentCount, setCommentCount] = useState<number>(
    postCommentCounts[post._id] || post.commentCount
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const location = useLocation();
  useEffect(() => {
    setCommentCount(postCommentCounts[post._id] || post.commentCount);
  }, [postCommentCounts, post._id, post.commentCount]);

  const goToPrevious = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const newIndex =
      currentIndex === 0 ? post.images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const newIndex =
      currentIndex === post.images.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const handleDeletePost = async () => {
    const token = auth?.auth?.token;
    if (!token) return;
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmDelete) return;

    try {
      const response = await postFetcher.deletePost(post._id, token);
      if (response) {
        if (setPosts) {
          setPosts(posts.filter((p) => p._id !== post._id));
        }
        success("Post deleted successfully");
      } else {
        error("Failed to delete post");
      }
    } catch (err) {
      error("An error occurred while deleting the post");
    }
  };

  const handleLikePost = async () => {
    const token = auth?.auth?.token;
    if (!token) return;

    try {
      const response = (await postFetcher.likeOrUnlikePost(
        post._id,
        token
      )) as unknown as PostLikeResponse;
      if (response.liked === true) {
        setIsLiked(true);
        toggleLikePost(post._id, true);
        toggleLikePostSearch(post._id, true);
        toggleLikePostProfile(post._id, true);
      } else {
        setIsLiked(false);
        toggleLikePost(post._id, false);
        toggleLikePostSearch(post._id, false);
        toggleLikePostProfile(post._id, false);
      }
    } catch (err) {
      console.error("An error occurred while liking the post:", err);
      error("An error occurred while liking the post");
    }
  };

  const handleSavePost = async () => {
    const token = auth?.auth?.token;
    if (!token) return;

    try {
      const response = (await postFetcher.postSavedOrUnsaved(
        post._id,
        token
      )) as unknown as PostLikeResponse;
      if (response.saved === true) {
        success("Post saved successfully");
        setIsSaved(true);
        toggleSavePost(post._id, true);
        toggleSavePostSearch(post._id, true);
        toggleSavePostProfile(post._id, true);
      } else {
        success("Post unsaved successfully");
        setIsSaved(false);
        toggleSavePost(post._id, false);
        toggleSavePostSearch(post._id, false);
        toggleSavePostProfile(post._id, false);
      }
    } catch (err) {
      console.error("An error occurred while saving the post:", err);
      error("An error occurred while saving the post");
    }
  };

  useEffect(() => {
    const account = auth.account;
    if (!account) return;
    setIsMyPost(account?.email == postAuthor?.email);
  }, [post.author]);

  const handleImageClick = (id: string) => {
    navigate(`/posts/${id}`, {
      state: { post, postAuthor, locationPath: locationPath },
    });
  };

  const handleCommentIconClick = (id: string) => {
    navigate(`/posts/${id}`, {
      state: { post, postAuthor, activeTab: "comments" },
    });
  };

  useEffect(() => {
    setIsLiked(post.liked);
  }, [post.liked]);

  useEffect(() => {
    setIsSaved(post.saved);
  }, [post.saved]);

  return (
    <>
      <Toaster />
      <div className="flex gap-2 items-start p-4 border-b border-gray-300">
        <div className="avatar">
          <Link
            to={`/users/profile/${postAuthor?._id}`}
            className="w-8 h-8 rounded-full overflow-hidden"
          >
            <img src={postAuthor?.avatar || "/boy1.png"} alt="Profile" />
          </Link>
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex gap-2 items-center">
            <Link
              to={`/users/profile/${postAuthor?._id}`}
              state={{ userId: postAuthor?._id }}
              className="font-bold"
            >
              {postAuthor?.name}
            </Link>

            <span className="text-gray-300 flex gap-1 text-sm">
              <Link
                to={`/users/profile/${postAuthor?._id}`}
                state={{ userId: postAuthor?._id }}
              >
                @{postAuthor?.username}
              </Link>
              <span>·</span>
              <span>{formattedDate}</span>
            </span>
            {isMyPost && (
              <span className="flex justify-end flex-1">
                <FaTrash
                  className="cursor-pointer hover:text-red-500"
                  onClick={handleDeletePost}
                />
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3 overflow-hidden">
            <span>{post.title}</span>
            <div className="carousel rounded-box w-full relative">
              {post.images.map((img, index) => (
                <div
                  key={index}
                  className={`carousel-item w-full ${
                    currentIndex === index ? "block" : "hidden"
                  }`}
                  onClick={() => handleImageClick(post._id)}
                >
                  <img
                    src={img}
                    className="h-96 w-full rounded-lg border border-gray-300"
                    alt={`Post Image ${index + 1}`}
                  />
                </div>
              ))}

              {/* Navigation Buttons */}
              {post.images.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute top-1/2 left-2 transform -translate-y-1/2 z-10 bg-white bg-opacity-50 rounded-full p-2 shadow"
                  >
                    ❮
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 z-10 bg-white bg-opacity-50 rounded-full p-2 shadow"
                  >
                    ❯
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-between mt-3">
            <div className="flex gap-4 items-center w-2/3 justify-between">
              <div
                className="flex gap-1 items-center cursor-pointer group"
                onClick={() => handleCommentIconClick(post._id)}
              >
                <FaRegComment className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
                <span className="text-sm text-slate-500 group-hover:text-sky-400">
                  {commentCount}
                </span>
              </div>
              <div className="flex gap-1 items-center group cursor-pointer">
                <BiRepost className="w-6 h-6 text-slate-500 group-hover:text-green-500" />
                <span className="text-sm text-slate-500 group-hover:text-green-500">
                  0
                </span>
              </div>
              <div
                className="flex gap-1 items-center group cursor-pointer"
                onClick={handleLikePost}
              >
                {!isLiked && (
                  <FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
                )}
                {isLiked && (
                  <FaRegHeart className="w-4 h-4 cursor-pointer text-pink-500" />
                )}
                <span
                  className={`text-sm text-slate-500 group-hover:text-pink-500 ${
                    isLiked ? "text-pink-500" : ""
                  }`}
                >
                  {post.likeCount}
                </span>
              </div>
            </div>
            <div
              className="flex w-1/3 justify-end gap-2 items-center"
              onClick={handleSavePost}
            >
              {isSaved ? (
                <FaBookmark className="w-4 h-4 text-blue-500 cursor-pointer" />
              ) : (
                <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer" />
              )}
              <span className="text-sm text-slate-500">{post.savedCount}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Post;
