// CreatePost.tsx
import React, { useState, useEffect } from "react";
import PostModal from "./CreatePostModal";
import { postFetcher } from "../../api/post";
import toast, { Toaster } from "react-hot-toast";
import { useAuthContext } from "../../hooks/useAuthContext";
import usePostContext from "../../hooks/usePostContext";

const CreatePostBox: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = useAuthContext();
  const { fetchPosts } = usePostContext();

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
    instructions: { description: string; image?: string }[]
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
      setIsModalOpen(false);
      toast.success("Created post successfully");

      fetchPosts();
      setIsSubmitting(false);
    } catch (error) {
      toast.error(`Failed to create post: ${(error as Error) || 'Unknown error'}`);
      console.log("Error creating post:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {/* Main Interface */}
      <Toaster/>
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
          onClick={() => setIsModalOpen(true)}
        />
      </div>

      {/* Modal */}
      <PostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handlePostSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default CreatePostBox;
