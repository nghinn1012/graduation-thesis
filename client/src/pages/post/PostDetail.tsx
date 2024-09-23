import { useLocation, useNavigate } from "react-router-dom";
import {
  CommentAuthor,
  postFetcher,
  PostInfo,
  PostInfoUpdate,
  PostLikeResponse,
} from "../../api/post";
import {
  AiOutlineHeart,
  AiFillHeart,
  AiOutlineShareAlt,
  AiOutlineCheckCircle,
  AiOutlinePlus,
} from "react-icons/ai";
import {
  FaClipboardList,
  FaRegCalendarCheck,
  FaRegCalendarPlus,
} from "react-icons/fa";
import { IoCameraOutline } from "react-icons/io5";
import { BsFillPencilFill } from "react-icons/bs";
import { useAuthContext } from "../../hooks/useAuthContext";
import { Toaster } from "react-hot-toast";
import CreatePostModal from "../../components/posts/CreatePostModal";
import { usePostContext } from "../../context/PostContext";
import { useSocket } from "../../hooks/useSocketContext";
import PostDetailsSkeleton from "../../components/skeleton/PostDetailsSkeleton";
import { useEffect, useState } from "react";
import { useToastContext } from "../../hooks/useToastContext";
import MadeRecipeModal from "../../components/posts/madeRecipe/MadeRecipeModal";
import MadeSection from "../../components/posts/madeRecipe/MadeSection";
import imageCompression from "browser-image-compression";
import CommentSection from "../../components/posts/comment/CommentSection";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
const PostDetails: React.FunctionComponent = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<"recipe" | "comments" | "made">(
    location?.state.activeTab || "recipe"
  );
  const navigate = useNavigate();
  const [post, setPost] = useState<PostInfo>([] as unknown as PostInfo);
  const postAuthor = location.state?.postAuthor;
  const { account, auth } = useAuthContext();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editPost, setEditPost] = useState<PostInfo | null>(post);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const isMyPost = account?.email === postAuthor?.email;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { socket } = useSocket();
  const [isLiked, setIsLiked] = useState(post.liked);
  const [isSaved, setIsSaved] = useState(post.saved);
  const [isSavedToShoppingList, setIsSavedToShoppingList] = useState<boolean>(
    post.isInShoppingList
  );
  const { success, error } = useToastContext();
  const { toggleLikePost, toggleSavePost } = usePostContext();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [servings, setServings] = useState<number>(post.servings);
  const [isInSchedule, setIsInSchedule] = useState<boolean>(false);
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postId = location.state?.post._id;
        if (!postId || !auth?.token) return;

        const currentPost = (await postFetcher.getPostById(
          postId,
          auth.token
        )) as unknown as PostInfo;

        const isLikedPost = await postFetcher.isLikedPostByUser(
          postId,
          auth.token
        );
        const isSavedPost = await postFetcher.isSavedPostByUser(
          postId,
          auth.token
        );
        const isSavedPostToShoppingList =
          await postFetcher.checkPostInShoppingList(postId, auth.token);
        setIsLiked(isLikedPost as unknown as boolean);
        setIsSaved(isSavedPost as unknown as boolean);
        setIsSavedToShoppingList(
          isSavedPostToShoppingList as unknown as boolean
        );
        currentPost.liked = isLiked as unknown as boolean;
        currentPost.saved = isSaved as unknown as boolean;
        currentPost.isInShoppingList =
          isSavedPostToShoppingList as unknown as boolean;

        setPost(currentPost as unknown as PostInfo);
        setServings(currentPost.servings || 1);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (location.state?.post && auth?.token) {
      fetchPost();
    }
  }, [location.state?.post, auth?.token, isLiked, isSaved]);

  useEffect(() => {
    const fetchUpdatedPostLike = async () => {
      try {
        const updatedPost = await postFetcher.getPostById(
          post._id,
          auth?.token || ""
        );
        const isLikedPost = await postFetcher.isLikedPostByUser(
          post._id,
          auth?.token || ""
        );
        const isSavedPost = await postFetcher.isSavedPostByUser(
          post._id,
          auth?.token || ""
        );
        setIsLiked(isLikedPost as unknown as boolean);
        setIsSaved(isSavedPost as unknown as boolean);
        setPost(updatedPost as unknown as PostInfo);
      } catch (error) {
        console.error("Failed to fetch the updated post:", error);
      }
    };

    if (socket) {
      socket.on("images-updated", async () => {
        await fetchUpdatedPostLike();
        setIsLoading(false);
      });

      return () => {
        socket.off("images-updated");
      };
    }
  }, [socket, post._id, auth?.token]);

  useEffect(() => {
    const isPostScheduled = async () => {
      if (!auth?.token) return;
      try {
        const response = await postFetcher.checkPostInUnscheduledMeal(
          post._id,
          auth.token
        );
        setIsInSchedule(response as unknown as boolean);
      } catch (error) {
        console.error("Failed to check if the post is scheduled", error);
      }
    };
    isPostScheduled();
  }, [auth?.token, post._id]);

  const handleEditClick = () => {
    setIsModalOpen(true);
    setEditPost(post);
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
    isEditing: boolean
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
      if (response.liked == true) {
        setIsLiked(true);
        toggleLikePost(post._id, true);
      } else {
        setIsLiked(false);
        toggleLikePost(post._id, false);
      }
    } catch (err) {
      console.error("An error occurred while liking the post:", err);
      error("An error occurred while liking the post");
    }
  };

  const handleSavedPost = async () => {
    const token = auth?.token;
    if (!token) return;

    try {
      const response = (await postFetcher.postSavedOrUnsaved(
        post._id,
        token
      )) as unknown as PostLikeResponse;
      if (response.saved === true) {
        setIsSaved(true);
        toggleSavePost(post._id, true);
      } else {
        setIsSaved(false);
        toggleSavePost(post._id, false);
      }
    } catch (err) {
      console.error("An error occurred while saving the post:", err);
      error("An error occurred while saving the post");
    }
  };

  const handleImageSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]; // Remove duplicate file declaration

    if (file) {
      try {
        const compressOptions = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
        };

        const compressedFile = await imageCompression(file, compressOptions);
        const reader = new FileReader();
        reader.onload = () => {
          setSelectedImage(reader.result as string);
        };
        reader.readAsDataURL(compressedFile);
        setShowModal(true);
      } catch (error) {
        console.error("Error compressing the image:", error);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  const updateServings = (increment: number) => {
    setServings((prevServings) => Math.max(prevServings + increment, 1));
  };
  const parseQuantity = (quantity: string) => {
    const match = quantity.match(/^(\d+\.?\d*)\s*(.*)$/);
    if (match) {
      return {
        value: parseFloat(match[1]),
        unit: match[2].trim(),
      };
    }
    return { value: 0, unit: "" };
  };

  const calculateNewQuantity = (
    quantity: string,
    servings: number,
    postServings: number
  ) => {
    const { value, unit } = parseQuantity(quantity);
    const newValue = (value / postServings) * servings;
    return { value: newValue, unit };
  };

  const handleSubmitMadeModal = async (
    _id: string,
    review: string,
    rating: number,
    newImage: string | undefined
  ) => {
    const token = auth?.token;
    if (!token) return;
    console.log("Submit image:", selectedImage);
    if (selectedImage == null) {
      error("No image selected");
    }
    const data = {
      image: selectedImage || "",
      review,
      rating,
    };
    try {
      const result = await postFetcher.createMadeRecipe(post._id, token, data);
      success("Created made successfully");
    } catch (err) {
      error("Can't create made", err);
    }
    handleCloseModal();
  };

  const addOrRemoveToShoppingList = async () => {
    if (!auth?.token) return;
    const response = isSavedToShoppingList
      ? await postFetcher.removePostFromShoppingList(post._id, auth.token)
      : await postFetcher.addIngredientToShoppingList(
          auth.token,
          post._id,
          servings
        );
    if (response) {
      setIsSavedToShoppingList(!isSavedToShoppingList);
    } else {
      error("Failed to add/remove post to shopping list");
    }
  };

  const addOrRemoveToPlan = async () => {
    if (!auth?.token) return;
    const response = isInSchedule
      ? await postFetcher.removeMeal({
          postId: post._id,
      }, auth.token)
      : await postFetcher.addMeal(
          {
            postId: post._id,
            is_planned: false,
          },
          auth?.token
        );
    if (response) {
      setIsInSchedule(!isInSchedule);
    } else {
      error("Failed to add/remove post to shopping list");
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

          <div className="px-4 py-2">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-lg font-bold">{post.title}</span>

              <span className="text-sm">⏰ {post.timeToTake}</span>
            </div>

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

            <div className="flex items-center justify-between mt-4 text-gray-600 w-full">
              <div className="flex space-x-4 md:space-x-8 items-center justify-center flex-grow">
                <div className="flex gap-4 md:gap-8 items-center">
                  <button
                    className="flex items-center space-x-1"
                    onClick={handleLikePost}
                  >
                    {isLiked ? (
                      <AiFillHeart className="w-8 h-8 text-pink-500" />
                    ) : (
                      <AiOutlineHeart className="w-8 h-8 text-gray-500" />
                    )}
                    <span>{post.likeCount}</span>
                  </button>

                  <button
                    className="flex items-center space-x-1"
                    onClick={handleSavedPost}
                  >
                    {isSaved ? (
                      <FaBookmark className="w-6 h-6" />
                    ) : (
                      <FaRegBookmark className="w-6 h-6" />
                    )}
                    <span>{post.savedCount}</span>
                  </button>

                  <button className="flex items-center space-x-1">
                    {isSavedToShoppingList ? (
                      <>
                        <FaClipboardList className="w-6 h-6 text-green-500" />{" "}
                        <span>List</span>
                      </>
                    ) : (
                      <>
                        <FaClipboardList className="w-6 h-6 text-gray-500" />{" "}
                        <span>List</span>
                      </>
                    )}
                  </button>

                  <button
                    className="flex items-center space-x-1"
                    onClick={addOrRemoveToPlan}
                  >
                    {isInSchedule ? (
                      <>
                        <FaRegCalendarCheck className="w-6 h-6 text-green-500" />{" "}
                        <span>Plan</span>
                      </>
                    ) : (
                      <>
                        <FaRegCalendarPlus className="w-6 h-6 text-gray-500" />{" "}
                        <span>Plan</span>
                      </>
                    )}
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
                Made
              </a>
            </div>

            {activeTab === "recipe" && (
              <div>
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold uppercase text-lg md:text-xl">
                      Ingredients
                    </span>

                    <div className="flex items-center border border-gray-300 rounded-full">
                      <button
                        className="px-3 py-1.5 text-red-500 border-r border-gray-300 md:px-2.5 md:py-1 md:text-sm sm:px-2 sm:py-0.5 sm:text-xs"
                        onClick={() => updateServings(-1)}
                      >
                        <span className="text-xl md:text-lg sm:text-xs">−</span>
                      </button>
                      <span className="px-4 py-1.5 md:px-3 md:py-1 md:text-sm sm:px-1.5 sm:py-0.5 sm:text-xs">
                        {servings} servings
                      </span>
                      <button
                        className="px-3 py-1.5 text-red-500 border-l border-gray-300 md:px-2.5 md:py-1 md:text-sm sm:px-2 sm:py-0.5 sm:text-xs"
                        onClick={() => updateServings(1)}
                      >
                        <span className="text-xl md:text-lg sm:text-xs">+</span>
                      </button>
                    </div>
                  </div>

                  <ul className="mt-2 mx-4">
                    {post.ingredients.map((ingredient, index) => {
                      const { value, unit } = calculateNewQuantity(
                        ingredient.quantity,
                        servings,
                        post.servings
                      );
                      return (
                        <li
                          key={index}
                          className="flex justify-between py-4 border-b border-gray-300 last:border-b-0"
                        >
                          <span>{ingredient.name}</span>
                          <span>
                            {value} {unit}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="flex flex-col md:flex-row gap-2 md:gap-10 mt-4 justify-center">
                    <button
                      className={`btn btn-md w-full md:w-auto ${
                        isSavedToShoppingList
                          ? "btn-success text-white"
                          : "btn-outline"
                      }`}
                      onClick={addOrRemoveToShoppingList}
                    >
                      {isSavedToShoppingList ? (
                        <>
                          <AiOutlineCheckCircle className="w-6 h-6 mr-2" />{" "}
                          Added to List
                        </>
                      ) : (
                        <>
                          <AiOutlinePlus className="w-6 h-6 mr-2" /> Add to List
                        </>
                      )}
                    </button>
                    <button className="btn btn-md btn-success w-full md:w-auto">
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
                <div className="mt-6 ml-4">
                  <span className="font-semibold uppercase">MADE IT?</span>
                  <div className="flex flex-col gap-2 items-center justify-between">
                    <input
                      type="file"
                      accept="image/*"
                      id="file-input"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                    <button
                      className="btn btn-lg bg-gradient-to-r from-red-500 to-orange-500 text-white flex items-center space-x-2"
                      onClick={() =>
                        document.getElementById("file-input")?.click()
                      }
                    >
                      <IoCameraOutline />
                      <span className="text-base md:text-lg sm:text-md xs:text-sm">
                        Share the finished product!
                      </span>
                    </button>
                  </div>

                  <MadeRecipeModal
                    post={post}
                    postAuthor={postAuthor}
                    isOpen={showModal}
                    image={selectedImage}
                    onClose={handleCloseModal}
                    onSubmit={handleSubmitMadeModal}
                  />
                </div>
              </div>
            )}

            {activeTab === "comments" && (
              <div className="mt-4">
                <CommentSection
                  postId={post._id}
                  token={auth?.token || ""}
                  author={account as unknown as CommentAuthor}
                />
              </div>
            )}

            {activeTab === "made" && (
              <MadeSection post={post} token={auth?.token || ""} />
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
