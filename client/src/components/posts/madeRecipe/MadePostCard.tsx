import React, { useState } from "react";
import { IoIosMore } from "react-icons/io";
import { useAuthContext } from "../../../hooks/useAuthContext";
import MadeRecipeModal from "./MadeRecipeModal"; // Import MadeRecipeModal
import { PostInfo } from "../../../api/post";
import { useI18nContext } from "../../../hooks/useI18nContext";
import { format } from "date-fns";

interface MadePostCardProps {
  author: {
    _id: string;
    name: string;
    avatar: string;
    email: string;
    username: string;
  };
  _id: string;
  post: PostInfo;
  rating: number;
  createdAt: Date;
  review: string;
  profileImageUrl: string;
  productImageUrl: string;
  onSubmit: (
    _id: string,
    review: string,
    rating: number,
    newImage: string | undefined
  ) => void;
  onDelete: (_id: string) => void;
  validationErrors?: {
    review?: string;
    rating?: string;
  };
}

const MadePostCard: React.FC<MadePostCardProps> = ({
  _id,
  author,
  post,
  rating,
  createdAt,
  review,
  profileImageUrl,
  productImageUrl,
  onSubmit,
  onDelete,
  validationErrors,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const auth = useAuthContext();
  const currentUser = auth?.account;
  const isMyPostMade = currentUser?.email === author.email;
  const language = useI18nContext();
  const lang = language.of("MadeSection");
  const langCode = language.language.code;

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
    setDropdownOpen(false);
  };

  const handleDelete = () => {
    const isConfirmed = window.confirm(lang("delete-confirm"));

    if (isConfirmed) {
      onDelete(_id);
      setDropdownOpen(false);
    }
  };

  const handleEditSubmit = (
    _id: string,
    newReview: string,
    newRating: number,
    newImage: string | undefined
  ) => {
    onSubmit(_id, newReview, newRating, newImage);
    console.log("Edit submitted", _id);
    setIsEditModalOpen(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 border rounded-lg shadow-lg bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <img
            className="w-12 h-12 rounded-full"
            src={profileImageUrl}
            alt={`${author.name}'s avatar`}
          />
          <div>
            <h3 className="font-semibold text-lg">{author.name}</h3>
            <p className="text-xs text-gray-500">
              {format(
                new Date(createdAt),
                langCode === "vi" ? "HH:mm dd/MM/yyyy" : "MM/dd/yyyy hh:mm a"
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-xl ${
                  star <= rating ? "text-yellow-500" : "text-gray-300"
                }`}
              >
                ★
              </span>
            ))}
          </div>
          {isMyPostMade && (
            <div className="relative ml-4">
              <button className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-md flex items-center justify-center">
                <IoIosMore
                  className="text-lg sm:text-xl"
                  onClick={handleDropdownToggle}
                />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-28 sm:w-32 bg-white border border-gray-300 rounded-lg shadow-lg">
                  <button
                    className="block w-full text-left px-3 py-2 sm:px-4 sm:py-2 text-gray-700 text-sm sm:text-base hover:bg-gray-100"
                    onClick={handleEdit}
                  >
                    {lang("edit")}
                  </button>
                  <button
                    className="block w-full text-left px-3 py-2 sm:px-4 sm:py-2 text-gray-700 text-sm sm:text-base hover:bg-gray-100"
                    onClick={handleDelete}
                  >
                    {lang("delete")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <img
          className="w-full h-48 object-cover rounded-lg"
          src={productImageUrl}
          alt="Finished product"
        />
        <p className="mt-2 text-sm text-gray-700">{review}</p>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <MadeRecipeModal
          post={post}
          postAuthor={author}
          _id={_id}
          image={productImageUrl}
          isOpen={isEditModalOpen}
          isEditing={true}
          initialReview={review}
          initialRating={rating}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
};

export default MadePostCard;
