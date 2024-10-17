import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  CommentAuthor,
  postFetcher,
  PostInfo,
  PostInfoUpdate,
  PostLikeResponse,
  ProductInfo,
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
import * as yup from "yup";
import { useProfileContext } from "../../context/ProfileContext";
import { useFollowContext } from "../../context/FollowContext";
import { AccountInfo, PostAuthor, userFetcher } from "../../api/user";

const validationSchema = yup.object({
  title: yup.string().required("Title is required"),
  about: yup.string().required("About is required"),
  timeToTake: yup.number().required("Time to take is required"),
  servings: yup
    .number()
    .required("Servings are required")
    .min(1, "Servings must be at least 1"),
  ingredients: yup
    .array()
    .of(
      yup.object({
        name: yup.string().required("Ingredient name is required"),
        quantity: yup.string().required("Quantity is required"),
      })
    )
    .min(1, "At least one ingredient is required"),
  instructions: yup
    .array()
    .of(
      yup.object({
        description: yup
          .string()
          .required("Instruction description is required"),
        image: yup.string().nullable(),
      })
    )
    .min(1, "At least one instruction is required"),
  hasProduct: yup.boolean().required("Product is required"),
  price: yup.string().when("hasProduct", {
    is: true,
    then: (schema) =>
      schema
        .required("Price is required")
        .test("is-positive", "Price must be a positive number", (value) =>
          value ? parseFloat(value) > 0 : false
        ),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),

  quantity: yup.string().when("hasProduct", {
    is: true,
    then: (schema) =>
      schema
        .required("Quantity is required")
        .test("is-positive", "Quantity must be at least 1", (value) =>
          value ? parseInt(value, 10) >= 1 : false
        ),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),

  timeToPrepare: yup.string().when("hasProduct", {
    is: true,
    then: (schema) =>
      schema
        .required("Time to prepare is required")
        .test(
          "is-positive",
          "Time to prepare must be at least 1 minute",
          (value) => (value ? parseInt(value, 10) >= 1 : false)
        ),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
});

const PostDetails: React.FunctionComponent = () => {
  const location = useLocation();
  const [locationPath, setLocationPath] = useState<string | null>(
    location?.state?.locationPath || ""
  );
  const [activeTab, setActiveTab] = useState<"recipe" | "comments" | "made">(
    location?.state?.activeTab || "recipe"
  );
  const navigate = useNavigate();
  const [post, setPost] = useState<PostInfo>([] as unknown as PostInfo);
  const [postAuthor, setPostAuthor] = useState<PostAuthor>({} as PostAuthor);
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
  const { setPostUpdated, postUpdated } = useProfileContext();
  const { success, error } = useToastContext();
  const {
    toggleLikePost,
    toggleSavePost,
    postUpdatedHome,
    setPostUpdatedHome,
  } = usePostContext();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [servings, setServings] = useState<number>(post.servings);
  const [isInSchedule, setIsInSchedule] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const { followUser } = useFollowContext();
  const { posts, setPosts } = usePostContext();
  const { user, setUser } = useProfileContext();
  const [product, setProduct] = useState<ProductInfo>(
    [] as unknown as ProductInfo
  );

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postId = location.state?.post._id;
        if (!postId || !auth?.token) return;

        const result = (await postFetcher.getPostById(
          postId,
          auth.token
        )) as unknown as PostInfo;

        if (!result) return;
        const currentPost = result as PostInfo;
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
        console.log(updatedPost);
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
        console.log(post);
      } catch (error) {
        console.error("Failed to fetch the updated post:", error);
      }
    };

    if (socket) {
      socket.on("food-updated-complete", async () => {
        console.log("Post updated");
        await fetchUpdatedPostLike();
        setIsLoading(false);
      });

      return () => {
        socket.off("food-updated-complete");
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
    console.log(postAuthor);
  }, [auth?.token, post._id]);

  useEffect(() => {
    const fetchPostAuthor = async () => {
      if (location.state?.post) {
        try {
          const foundPost = await userFetcher.getUserById(
            location.state.post.author._id || location.state.postAuthor._id,
            auth?.token || ""
          );
          if (foundPost) {
            setPostAuthor(foundPost as unknown as PostAuthor);
          }
        } catch (error) {
          console.error("Error fetching post author:", error);
        }
      }
    };

    fetchPostAuthor();
  }, [location.state?.post, auth?.token]);

  const handleEditClick = () => {
    setIsModalOpen(true);
    setEditPost(post);
  };

  const handleBackClick = () => {
    navigate(`${locationPath || "/"}`, {
      state: { updatedPost: post, postAuthor: postAuthor },
    });
  };

  const validateData = async ({
    title,
    about,
    images,
    hashtags,
    timeToTake,
    servings,
    ingredients,
    instructions,
    hasProduct,
    price,
    quantity,
    timeToPrepare,
  }: {
    title: string;
    about: string;
    images: string[];
    hashtags: string[];
    timeToTake: number;
    servings: string | number;
    ingredients: { name: string; quantity: string }[];
    instructions: { description: string; image?: string }[];
    hasProduct: boolean;
    price: string | number;
    quantity: string | number;
    timeToPrepare: string | number;
  }) => {
    try {
      await validationSchema.validate(
        {
          title,
          about,
          images,
          hashtags,
          timeToTake,
          servings,
          ingredients,
          instructions,
          hasProduct,
          price,
          quantity,
          timeToPrepare,
        },
        { abortEarly: false }
      );
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errors: { [key: string]: string } = {};
        error.inner.forEach((err) => {
          if (err.path) {
            errors[err.path] = err.message;
          }
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  const handlePostSubmit = async (
    title: string,
    about: string,
    images: string[],
    hashtags: string[],
    timeToTake: number,
    servings: number | string,
    ingredients: { name: string; quantity: string }[],
    instructions: { description: string; image?: string }[],
    difficulty: string,
    course: string[],
    dietary: string[],
    hasProduct: boolean,
    price: string | number,
    quantity: string | number,
    timeToPrepare: string | number,
    isEditing: boolean
  ) => {
    const token = auth?.token;

    if (!token) return;

    try {
      const isValid = await validateData({
        title,
        about,
        images,
        hashtags,
        timeToTake,
        servings,
        ingredients,
        instructions,
        hasProduct,
        price,
        quantity,
        timeToPrepare,
      });
      if (!isValid) return;
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
        if (editPost.timeToTake !== Number(timeToTake))
          changes.timeToTake = Number(timeToTake);
        if (Number(editPost.servings) !== Number(servings))
          changes.servings = Number(servings);
        if (JSON.stringify(editPost.hashtags) !== JSON.stringify(hashtags))
          changes.hashtags = hashtags;
        if (editPost.difficulty !== difficulty) changes.difficulty = difficulty;
        if (JSON.stringify(editPost.course) !== JSON.stringify(course)) {
          changes.course = course;
        }
        if (JSON.stringify(editPost.dietary) !== JSON.stringify(dietary)) {
          changes.dietary = dietary;
        }
        if (editPost.hasProduct !== hasProduct) changes.hasProduct = hasProduct;
        if (!changes.product) {
          changes.product = {
          };
        }

        if (editPost.product?.price !== Number(price)) {
          changes.product.price = Number(price);
        }

        if (editPost.product?.quantity !== Number(quantity)) {
          changes.product.quantity = Number(quantity);
        }

        if (editPost.product?.timeToPrepare !== Number(timeToPrepare)) {
          changes.product.timeToPrepare = Number(timeToPrepare);
        }

        console.log(changes);

        await postFetcher.updatePost(editPost._id, changes, token);
        await setPostUpdated(editPost._id);
        await setPostUpdatedHome(editPost._id);
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
    const file = event.target.files?.[0];

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
      ? await postFetcher.removeMeal(
          {
            postId: post._id,
          },
          auth.token
        )
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

  const handleShowTimeToTake = (timeToTake: number) => {
    if (!timeToTake) return "Unknown";
    if (Number(timeToTake) < 60) return `${timeToTake} minutes`;
    const hours = Math.floor(Number(timeToTake) / 60);
    const minutes = Number(timeToTake) % 60;
    const modifiedHours = hours > 0 ? `${hours}` : "";
    const modifiedMinutes = minutes > 0 ? `${minutes}` : "";
    return `${modifiedHours} hours ${modifiedMinutes} minutes`;
  };

  const handleFollowOrUnfollow = async (
    userId: string,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (!setPosts) return;
    event.preventDefault();
    followUser(userId);
    setPostAuthor({
      ...postAuthor,
      followed: !postAuthor.followed,
    });
    location.state.postAuthor.followed = !postAuthor.followed;
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.author._id === userId) {
          return {
            ...post,
            followers: post.author?.followers?.includes(account?._id || "")
              ? post.author?.followers?.filter((id) => id !== account?._id)
              : [...(post.author?.followers || []), account?._id || ""],
            followed: !post.author?.followed,
          };
        }
        return post;
      })
    );
    setUser({
      ...user,
      followed: !postAuthor.followed,
    } as AccountInfo);
  };

  const handleOrderNow = () => {
    if (!post.hasProduct) return;
    navigate(`/posts/productDetails/${post?.product?._id}`, {
      state: {
        recipeId: post._id,
        _id: post?.product?._id,
        title: post.title,
        description: post.about,
        quantity: post?.product?.quantity,
        price: post?.product?.price,
        preparationTime: post?.product?.timeToPrepare,
        images: post.images,
        chef: {
          name: post.author.name,
          avatar: post.author.avatar,
        },
        ingredients: post.ingredients,
        hashtags: post.hashtags,
      },
    });
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

              <span className="text-sm">
                ⏰ {handleShowTimeToTake(post.timeToTake)}
              </span>
            </div>

            <div className="flex mt-2 gap-2">
              {[
                ...post.hashtags,
                post.difficulty,
                ...post.course,
                ...post.dietary,
              ].map((tag, index) => (
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
                <Link
                  to={`/users/profile/${postAuthor._id}`}
                  className="font-semibold"
                >
                  {postAuthor.name}
                </Link>
                <p className="text-sm text-gray-500">{postAuthor.username}</p>
              </div>
              {account?.email !== postAuthor.email && (
                <button
                  className="ml-auto btn btn-sm btn-outline"
                  onClick={(event) =>
                    handleFollowOrUnfollow(postAuthor._id, event)
                  }
                >
                  {postAuthor.followed ? "Unfollow" : "Follow"}
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
                    {post.hasProduct && (
                      <button
                        className="btn btn-md btn-success w-full md:w-auto"
                        onClick={handleOrderNow}
                      >
                        Order Now
                      </button>
                    )}
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
