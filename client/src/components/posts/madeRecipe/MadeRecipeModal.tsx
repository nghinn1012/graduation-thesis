import React, { useState } from "react";
import { PostInfo } from "../../../api/post";

interface MadeRecipeModalProps {
  post: PostInfo;
  postAuthor: any;
  image: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: string, rating: number) => void;
}

const MadeRecipeModal: React.FC<MadeRecipeModalProps> = ({
  post,
  postAuthor,
  image,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [review, setReview] = useState<string>("");
  const [rating, setRating] = useState<number>(0);

  if (!isOpen) return null;

  const handleSubmit = () => {
    console.log("Submitting review:", image, review, rating);
    onSubmit(review, rating);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-2">SHARE YOUR WORK.</h2>
        <p className="text-gray-600 mb-4">
          Masterpiece! Feel free to add a review too
        </p>

        {/* Original and Your Image Section */}
        <div className="flex flex-col gap-4">
          <div className="overflow-y-auto w-full flex items-center bg-gray-100 rounded-lg overflow-hidden">
            <div className="w-1/2">
              <img
                src={post.images[0]}
                alt="Original"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-1/2 p-4">
              <h3 className="font-bold text-lg">ORIGINAL.</h3>
              <p className="mt-2 text-base font-semibold">
                {post.title}
              </p>
              <div className="flex items-center mt-2">
                <img
                  src={postAuthor.avatar || "/boy1.png"}
                  alt="Bella Reep"
                  className="w-8 h-8 rounded-full mr-2"
                />
                <div>
                  <span className="text-sm font-semibold">{postAuthor.name}</span>
                  <p className="text-xs text-gray-500">@{postAuthor.username}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex flex-col items-center bg-gray-100 rounded-lg overflow-hidden">
            <h3 className="font-bold text-lg">YOURS.</h3>
              <img
                src={image || "path-to-original-image.jpg"}
                alt="Yours"
                className="w-full h-[200px] object-cover"
              />
          </div>
        </div>

        {/* Rating Section */}
        <div className="my-4 flex flex-col items-center justify-center">
          <h3 className="font-bold">REVIEW.</h3>
          <div className="flex items-center mb-2 gap-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`text-4xl ${
                  star <= rating ? "text-yellow-500" : "text-gray-300"
                }`}
                onClick={() => setRating(star)}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Tell us what you thought of this recipe and anything you changed"
            value={review}
            onChange={(e) => setReview(e.target.value)}
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4">
          <button className="btn bg-gray-300 text-black" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn bg-gradient-to-r from-red-500 to-orange-500 text-white"
            onClick={handleSubmit}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default MadeRecipeModal;
