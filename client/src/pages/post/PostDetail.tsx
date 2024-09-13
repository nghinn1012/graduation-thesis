import { useLocation, useNavigate } from "react-router-dom";
import {
  InstructionInfo,
  postFetcher,
  PostInfo,
  PostInfoUpdate,
  PostLikeResponse,
} from "../../api/post";
import {
  AiOutlineHeart,
  AiFillHeart,
  AiOutlineBook,
  AiOutlineOrderedList,
  AiOutlineShareAlt,
} from "react-icons/ai";
import { BsFillPencilFill } from "react-icons/bs";
import { useAuthContext } from "../../hooks/useAuthContext";
import toast, { Toaster } from "react-hot-toast";
import CreatePostModal from "../../components/posts/CreatePostModal";
import { usePostContext } from "../../context/PostContext";
import { useSocket } from "../../hooks/useSocketContext";
import PostDetailsSkeleton from "../../components/skeleton/PostDetailsSkeleton";
import { useEffect, useState } from "react";
import { useToastContext } from "../../hooks/useToastContext";

const PostDetails: React.FunctionComponent = () => {
  const [activeTab, setActiveTab] = useState<"recipe" | "comments" | "made">(
    "recipe"
  );
  const [isLiked, setIsLiked] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostInfo>(location.state?.post as PostInfo);
  const postAuthor = location.state?.postAuthor;
  const { account, auth } = useAuthContext();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editPost, setEditPost] = useState<PostInfo | null>(post);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const isMyPost = account?.email === postAuthor?.email;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { socket } = useSocket();
  const { success, error } = useToastContext();
  const { toggleLikePost } = usePostContext();
  const fetchUpdatedPost = async () => {
    try {
      const updatedPost = await postFetcher.getPostById(
        post._id,
        auth?.token || ""
      );
      setPost(updatedPost as unknown as PostInfo);
    } catch (error) {
      console.error("Failed to fetch the updated post:", error);
    }
  };

  useEffect(() => {

    if (socket) {
      socket.on("images-updated", async () => {
        await fetchUpdatedPost();
        setIsLoading(false);
      });
    }

    return () => {
      if (socket) {
        socket.off("images-updated");
      }
    };
  }, [socket, post._id, auth?.token]);

  useEffect(() => {
    if (post) {
      setEditPost(post);
    }
  }, [post]);

  const handleEditClick = () => {
    setIsModalOpen(true);
  };

  const handleBackClick = () => {
    navigate("/", { state: { updatedPost: post, postAuthor: postAuthor } });
  };

  const handlePostSubmit = async (
    title: string,
    about: string,
    images: string[],
    hashtags: string[],
    timeToTake: string,
    servings: number | string,
    ingredients: { name: string; quantity: string }[],
    instructions: { description: string; image?: string }[],
    isEditing: boolean,
    postId?: string
  ) => {
    const token = auth?.token;

    if (!token) return;

    try {
      setIsSubmitting(true);

      if (isEditing && editPost) {
        const changes: Partial<PostInfoUpdate> = {};
        if (editPost.title !== title) changes.title = title;
        if (editPost.about !== about) changes.about = about;
        if (JSON.stringify(editPost.images) !== JSON.stringify(images))
          changes.images = images;
        if (
          JSON.stringify(editPost.instructions) !== JSON.stringify(instructions)
        )
          changes.instructions = instructions;
        if (
          JSON.stringify(editPost.ingredients) !== JSON.stringify(ingredients)
        )
          changes.ingredients = ingredients;
        if (editPost.timeToTake !== timeToTake) changes.timeToTake = timeToTake;
        if (Number(editPost.servings) !== Number(servings))
          changes.servings = Number(servings);
        if (JSON.stringify(editPost.hashtags) !== JSON.stringify(hashtags))
          changes.hashtags = hashtags;

        await postFetcher.updatePost(editPost._id, changes, token);
        success("Post updated successfully");
      }
      setIsModalOpen(false);
      setIsLoading(true);
    } catch (err) {
      error(
        `Failed to ${isEditing ? "update" : "create"} post: ${
          (err as Error).message || "Unknown error"
        }`
      );
      console.error(
        `Error ${isEditing ? "updating" : "creating"} post:`,
        error
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikePost = async () => {
    const token = auth?.token;
    if (!token) return;

    try {
      const response = (await postFetcher.likeOrUnlikePost(
        post._id,
        token
      )) as unknown as PostLikeResponse;
      if (response.liked === true) {
        success("Post liked successfully");
        setIsLiked(true);
        toggleLikePost(post._id, true);
      } else {
        success("Post unliked successfully");
        setIsLiked(false);
        toggleLikePost(post._id, false);
      }
      fetchUpdatedPost();
    } catch (err) {
      console.error("An error occurred while liking the post:", err);
      error("An error occurred while liking the post");
    }
  };

  return (
    <>
      {isLoading ? (
        <>
          <Toaster />
          <PostDetailsSkeleton />
        </>
      ) : (
        <div className="relative">
          <Toaster />
          <div className="relative">
            <img
              src={post.images[0]}
              alt={post.title}
              className="w-full h-64 object-cover"
            />

            <button
              className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center"
              onClick={handleBackClick}
            >
              ❮
            </button>

            {isMyPost && (
              <div className="absolute top-4 right-4 space-x-2 flex">
                <button className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
                  <BsFillPencilFill onClick={handleEditClick} />
                </button>
              </div>
            )}
          </div>

          {/* Text Content */}
          <div className="px-4 py-2">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-lg font-bold">{post.title}</span>

              <span className="text-sm">⏰ {post.timeToTake}</span>
            </div>

            {/* Tags */}
            <div className="flex mt-2 gap-2">
              {post.hashtags.map((tag, index) => (
                <span
                  key={index}
                  className="badge badge-md badge-success py-4 px-2 font-bold text-white"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex mt-2 gap-2">
              <span className="py-2 px-2">{post.about}</span>
            </div>

            {/* Social Interaction Section */}
            <div className="flex items-center justify-between mt-4 text-gray-600 w-full">
              <div className="flex space-x-4 items-center justify-center flex-grow">
                <div className="flex gap-8 items-center">
                  {/* Like Button */}
                  <button
                    className="flex items-center space-x-1"
                    onClick={handleLikePost}
                  >
                    {isLiked ? (
                      <AiFillHeart className="w-8 h-8 text-pink-500" /> // Màu hồng khi đã like
                    ) : (
                      <AiOutlineHeart className="w-8 h-8 text-gray-500" /> // Màu xám khi chưa like
                    )}
                    <span>{post.likeCount}</span>
                  </button>

                  {/* Bookmark Button */}
                  <button className="flex items-center space-x-1">
                    <AiOutlineBook className="w-8 h-8" />
                    <span>180</span>
                  </button>

                  {/* List Button */}
                  <button className="flex items-center space-x-1">
                    <AiOutlineOrderedList className="w-8 h-8" />
                    <span>List</span>
                  </button>

                  {/* Share Button */}
                  <button className="flex items-center space-x-1">
                    <AiOutlineShareAlt className="w-8 h-8" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="relative z-10 p-4 bg-white rounded-t-lg">
            <div className="flex items-center mb-4">
              <img
                src={postAuthor.avatar}
                alt={postAuthor.name}
                className="w-12 h-12 rounded-full"
              />
              <div className="ml-3">
                <h2 className="font-semibold">{postAuthor.name}</h2>
                <p className="text-sm text-gray-500">{postAuthor.username}</p>
              </div>
              {account?.email !== postAuthor.email && (
                <button className="ml-auto btn btn-sm btn-outline">
                  Follow
                </button>
              )}
            </div>
            <div className="tabs tabs-boxed" role="tablist">
              <a
                className={`tab ${activeTab === "recipe" ? "tab-active" : ""}`}
                role="tab"
                onClick={() => setActiveTab("recipe")}
              >
                Recipe
              </a>
              <a
                className={`tab ${
                  activeTab === "comments" ? "tab-active" : ""
                }`}
                role="tab"
                onClick={() => setActiveTab("comments")}
              >
                Comments
              </a>
              <a
                className={`tab ${activeTab === "made" ? "tab-active" : ""}`}
                role="tab"
                onClick={() => setActiveTab("made")}
              >
                Made (4)
              </a>
            </div>

            {activeTab === "recipe" && (
              <div>
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold uppercase">Ingredients</span>

                    <div className="flex items-center border border-gray-300 rounded-full">
                      <button className="px-3 py-1 text-red-500 border-r border-gray-300">
                        <span className="text-xl">−</span>
                      </button>
                      <span className="px-4 py-1">
                        {post.servings} servings
                      </span>
                      <button className="px-3 py-1 text-red-500 border-l border-gray-300">
                        <span className="text-xl">+</span>
                      </button>
                    </div>
                  </div>

                  <ul className="mt-2 mx-4">
                    {post.ingredients.map((ingredient, index) => (
                      <li
                        key={index}
                        className="flex justify-between py-4 border-b border-gray-300 last:border-b-0"
                      >
                        <span>{ingredient.name}</span>
                        <span>{ingredient.quantity}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-row gap-10 mt-4 justify-center">
                    <button className="btn btn-outline btn-md">
                      Add to List
                    </button>
                    <button className="btn btn-md btn-success">
                      Get Ingredients
                    </button>
                  </div>
                </div>

                <div className="mt-6 ml-4">
                  <h2 className="text-lg font-semibold uppercase">
                    Instructions
                  </h2>
                  <div className="instructions-container mt-4">
                    {post.instructions.map((instruction, index) => (
                      <div
                        key={index}
                        className="card w-full bg-base-100 shadow-md my-4"
                      >
                        <div className="card-body flex items-start gap-4">
                          <div className="flex flex-col w-full">
                            {instruction.image && (
                              <figure>
                                <img
                                  src={instruction.image}
                                  alt={`Instruction ${index + 1}`}
                                  className="w-full h-[300px] rounded"
                                />
                              </figure>
                            )}
                            <div className="flex flex-row gap-4 mt-2 w-full">
                              <div className="flex items-center justify-center w-8 h-8 bg-red-500 text-white rounded-full">
                                {index + 1}
                              </div>
                              <h2 className="font-bold w-full mt-1">
                                {instruction.description}
                              </h2>{" "}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "comments" && (
              <div className="mt-4">
                <p>Comments section content...</p>
              </div>
            )}

            {activeTab === "made" && (
              <div className="mt-4">
                <p>Made section content...</p>
              </div>
            )}
          </div>
          {isModalOpen && (
            <CreatePostModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSubmit={handlePostSubmit}
              post={editPost}
              isEditing={!!editPost}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      )}
    </>
  );
};

export default PostDetails;
