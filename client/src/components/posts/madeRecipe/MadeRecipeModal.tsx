import React, { useState, useEffect, useRef } from "react";
import { PostInfo } from "../../../api/post";

interface MadeRecipeModalProps {
  post: PostInfo;
  postAuthor: any;
  image: string | null;
  isOpen: boolean;
  isEditing?: boolean;
  initialReview?: string;
  initialRating?: number;
  _id?: string;
  onClose: () => void;
  onSubmit: (id: string, review: string, rating: number, newImage: string | undefined) => void; // Adjusted parameter types
}

const MadeRecipeModal: React.FC<MadeRecipeModalProps> = ({
  post,
  postAuthor,
  image,
  isOpen,
  isEditing = false,
  initialReview = "",
  initialRating = 0,
  _id = "",
  onClose,
  onSubmit,
}) => {
  const [review, setReview] = useState<string>(initialReview);
  const [rating, setRating] = useState<number>(initialRating);
  const [newImage, setNewImage] = useState<string | null>(image);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setReview(initialReview);
      setRating(initialRating);
      setNewImage(image);
    }
  }, [isOpen, initialReview, initialRating, image]);

  if (!isOpen) return null;

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setNewImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!newImage) {
      alert("Please select an image.");
      return;
    }
    onSubmit(_id, review, rating, newImage);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-2">
          {isEditing ? "EDIT YOUR WORK." : "SHARE YOUR WORK."}
        </h2>
        <p className="text-gray-600 mb-4">
          {isEditing
            ? "Update your review and rating."
            : "Masterpiece! Feel free to add a review too."}
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
              <p className="mt-2 text-base font-semibold">{post.title}</p>
              <div className="flex items-center mt-2">
                <img
                  src={postAuthor.avatar || "/boy1.png"}
                  alt={postAuthor.name}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <div>
                  <span className="text-sm font-semibold">
                    {postAuthor.name}
                  </span>
                  <p className="text-xs text-gray-500">
                    @{postAuthor.username}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex flex-col items-center bg-gray-100 rounded-lg overflow-hidden">
            <h3 className="font-bold text-lg">YOURS.</h3>
            <img
              src={newImage || "path-to-original-image.jpg"}
              alt="Yours"
              className="w-full h-[200px] object-cover"
            />
          </div>
          {isEditing && (
              <div className="flex flex-col gap-4 justify-center items-center">
                <button
                  type="button"
                  className="w-full py-3 bg-red-500 text-white font-semibold rounded-lg mb-6"
                  onClick={handleClick}
                >
                  Change photo
                </button>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden mt-2"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                />
              </div>
            )}
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
            {isEditing ? "Save" : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MadeRecipeModal;
