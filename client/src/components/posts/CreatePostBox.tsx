// CreatePostBox.tsx
import React, { useState, useEffect } from "react";
import PostModal from "./CreatePostModal";
import { postFetcher } from "../../api/post";
import toast, { Toaster } from "react-hot-toast";
import { useAuthContext } from "../../hooks/useAuthContext";
import usePostContext from "../../hooks/usePostContext";
import PostSkeleton from "../skeleton/PostSkeleton";
import { useSocket } from "../../hooks/useSocketContext";

const CreatePostBox: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editPost, setEditPost] = useState<any>(null);
  const auth = useAuthContext();
  const { fetchPosts } = usePostContext();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on("uploads-complete", (message: string) => {
      console.log(`Received message: ${message}`);
      fetchPosts();
      setIsLoading(false);
    });

    return () => {
      socket.off("uploads-complete");
    };
  }, [socket, fetchPosts]);

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
    timeToTake: string,
    servings: number | string,
    ingredients: { name: string; quantity: string }[],
    instructions: { description: string; image?: string }[],
    isEditing: boolean,
    postId?: string
  ) => {
    const token = localStorage.getItem("auth");

    if (!token) {
      return;
    }

    try {
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
        },
        JSON.parse(token).token
      );
      toast.success("Created post successfully");

      setIsModalOpen(false);
      setIsLoading(true);
      setIsSubmitting(false);
    } catch (error) {
      toast.error(
        `Failed to ${isEditing ? "update" : "create"} post: ${
          (error as Error) || "Unknown error"
        }`
      );
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
          placeholder="What is happening?!"
          onClick={() => {
            setEditPost(null); // Reset edit state when creating a new post
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
