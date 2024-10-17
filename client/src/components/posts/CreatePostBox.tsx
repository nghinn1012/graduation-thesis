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

  useEffect(() => {
    if (!socket || !auth?.account) return;

    const handleUploadsComplete = async (message: string) => {
      console.log(`Received message: ${message}`);
      setIsLoading(true);

      try {
        const newPostId = message;
        const newPost = (await fetchPost(newPostId)) as PostInfo;

        if (newPost && setPosts) {
          newPost.author = auth.account as unknown as PostInfo["author"];
          setPosts((prevPosts) => [newPost, ...prevPosts]);
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
        },
        {
          price: Number(price),
          quantity: Number(quantity),
          timeToPrepare: Number(timeToPrepare),
        },
        JSON.parse(token).token
      );
      success("Created post successfully");

      setIsModalOpen(false);
      setIsLoading(true);
      setIsSubmitting(false);
    } catch (err) {
      error(
        `Failed to ${isEditing ? "update" : "create"} post: ${
          (err as Error) || "Unknown error"
        }`
      );
      console.log(`Error ${isEditing ? "updating" : "creating"} post:`, error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative border-b border-gray-300">
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
        <input
          type="text"
          className="flex-grow text-white rounded-full px-4 py-2 focus:outline-none"
          placeholder={`${data?.name} ơi, bạn đang nghĩ gì?`}
          readOnly
        />
      </div>
      <div className="flex my-3">
        <div className="flex-1 flex justify-center">
          <button
            className="flex items-center gap-2"
            onClick={() => {
              setEditPost(null);
              setIsModalOpen(true);
            }}
          >
            <BsPostcardHeart size={20} className="text-red-400" />
            <span>New post</span>
          </button>
        </div>
        <div className="flex-1 flex justify-center">
          <button
            className="flex items-center gap-2"
            onClick={() => setIsProductModalOpen(true)}
          >
            <BiDish size={20} className="text-yellow-500" />
            <span>Product from post</span>
          </button>
        </div>
      </div>

      <PostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handlePostSubmit}
        isSubmitting={isSubmitting}
        post={editPost}
        isEditing={!!editPost}
      />
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSubmit={() => {}}
        isSubmitting={isSubmitting}
        // selectedPost={selectedPost}
        // setSelectedPost={setSelectedPost}
      />
      {isLoading && (
        <div className="mt-4">
          <PostSkeleton />
        </div>
      )}
    </div>
  );
};

export default CreatePostBox;
