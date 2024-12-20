import React, { useState, useEffect } from "react";
import PostModal from "./CreatePostModal";
import { postFetcher, PostInfo } from "../../api/post";
import { useAuthContext } from "../../hooks/useAuthContext";
import usePostContext from "../../hooks/usePostContext";
import PostSkeleton from "../skeleton/PostSkeleton";
import { useSocket } from "../../hooks/useSocketContext";
import { useToastContext } from "../../hooks/useToastContext";
import { FaVideo, FaImage, FaSmile } from "react-icons/fa";
import { Toaster } from "react-hot-toast";
import { BsPostcardHeart } from "react-icons/bs";
import { BiDish } from "react-icons/bi";
import ProductModal from "../product/CreateProductFromPost";
import { useProductContext } from "../../context/ProductContext";
import { useI18nContext } from "../../hooks/useI18nContext";

const CreatePostBox: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editPost, setEditPost] = useState<any>(null);
  const auth = useAuthContext();
  const { fetchPost, setPosts } = usePostContext();
  const { socket } = useSocket();
  const { success, error } = useToastContext();
  const { setPage } = useProductContext();
  const languageContext = useI18nContext();
  const lang = languageContext.of(CreatePostBox);

  useEffect(() => {
    if (!socket || !auth?.account) return;

    const handleUploadsComplete = async (message: string) => {
      console.log(`Received message: ${message}`);
      setIsLoading(true);
      1;
      try {
        const newPostId = message;
        const newPost = (await fetchPost(newPostId)) as PostInfo;

        if (newPost && setPosts) {
          newPost.author = auth.account as unknown as PostInfo["author"];
          setPosts((prevPosts) => [newPost, ...prevPosts]);
        }
        if (newPost.hasProduct) {
          setPage(1);
        }
      } catch (err) {
        console.error("Failed to fetch new post:", err);
      } finally {
        setIsLoading(false);
      }
    };

    socket.on("food-uploads-complete", handleUploadsComplete);

    return () => {
      socket.off("food-uploads-complete", handleUploadsComplete);
    };
  }, [socket, fetchPost, setPosts, auth?.account]);

  useEffect(() => {
    const accountData = localStorage.getItem("account");
    if (accountData) {
      setData(JSON.parse(accountData));
    }
  }, []);

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
    isEditing: boolean,
    postId?: string
  ) => {
    const token = localStorage.getItem("auth");

    if (!token) {
      return;
    }

    try {
      console.log(
        title,
        about,
        images,
        hashtags,
        timeToTake,
        servings,
        ingredients,
        instructions,
        difficulty,
        course,
        dietary,
        price,
        quantity,
        hasProduct,
        timeToPrepare,
        isEditing,
        postId
      );
      setIsSubmitting(true);
      await postFetcher.createPost(
        {
          title,
          about,
          images,
          instructions,
          ingredients,
          timeToTake,
          servings: Number(servings),
          hashtags,
          difficulty,
          course,
          dietary,
          liked: false,
          likeCount: 0,
          savedCount: 0,
          commentCount: 0,
          isInShoppingList: false,
          hasProduct,
          averageRating: 0,
          isDeleted: false,
        },
        {
          price: Number(price),
          quantity: Number(quantity),
          timeToPrepare: Number(timeToPrepare),
        },
        JSON.parse(token).token
      );
      success(lang("create-post-success"));

      setIsModalOpen(false);
      setIsLoading(true);
      setIsSubmitting(false);
    } catch (err) {
      const errorMessage = isEditing
        ? lang(
            "error-update-post",
            (err as Error)?.message || "Các trường không đúng định dạng"
          )
        : lang(
            "error-create-post",
            (err as Error)?.message || "Các trường không đúng định dạng"
          );

      error(errorMessage);
      console.log(`Error ${isEditing ? "updating" : "creating"} post:`, error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <Toaster />
      <div className="flex p-4 items-start gap-4 border-b border-gray-300">
        <div className="avatar">
          <div className="w-8 rounded-full">
            <img
              src={data?.avatar || "/avatar-placeholder.png"}
              alt="Profile"
            />
          </div>
        </div>
        <textarea
          className="textarea w-full p-0 text-lg resize-none border-none focus:outline-none border-gray-300 cursor-pointer"
          placeholder={lang("placeholder", data?.name)}
          onClick={() => {
            setEditPost(null);
            setIsModalOpen(true);
          }}
        />
      </div>

      {/* Modal */}
      <PostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handlePostSubmit}
        isSubmitting={isSubmitting}
        post={editPost}
        isEditing={!!editPost}
      />
      {isLoading ? (
        <div className="border-b border-gray-300">
          <PostSkeleton />
        </div>
      ) : null}
    </div>
  );
};

export default CreatePostBox;
