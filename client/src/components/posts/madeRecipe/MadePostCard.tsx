import React from 'react';

interface MadePostCardProps {
  author: {
    _id: string;
    name: string;
    avatar: string;
    email: string;
    username: string;
  };
  rating: number;
  createdAt: Date;
  review: string;
  profileImageUrl: string;
  productImageUrl: string;
}

const MadePostCard: React.FC<MadePostCardProps> = ({
  author,
  rating,
  createdAt,
  review,
  profileImageUrl,
  productImageUrl
}) => {
  return (
    <div className="w-full max-w-lg mx-auto p-4 border rounded-lg shadow-lg bg-white">
      {/* User Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <img
            className="w-12 h-12 rounded-full"
            src={profileImageUrl}
            alt={`${author.name}'s avatar`}
          />
          <div>
            <h3 className="font-semibold text-lg">{author.name}</h3>
            {/* <p className="text-xs text-gray-500">@{author.username}</p> */}
            <p className="text-xs text-gray-500">
              {createdAt.toString().split("T")[0]}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-xl ${star <= rating ? "text-yellow-500" : "text-gray-300"}`}
            >
              ★
            </span>
          ))}
        </div>
      </div>


      {/* Image and Caption */}
      <div className="mb-4">
        <img
          className="w-full h-48 object-cover rounded-lg"
          src={productImageUrl}
          alt="Finished product"
        />
        <p className="mt-2 text-sm text-gray-700">{review}</p>
      </div>
    </div>
  );
};

export default MadePostCard;
