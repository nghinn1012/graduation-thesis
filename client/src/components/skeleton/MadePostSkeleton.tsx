import React from "react";

const MadePostSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-lg mx-auto p-4 border rounded-lg shadow-lg bg-white animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
          <div>
            <div className="w-24 h-4 bg-gray-300 mb-2 rounded"></div>
            <div className="w-16 h-3 bg-gray-300 rounded"></div>
          </div>
        </div>
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className="text-xl text-gray-300">
              ★
            </span>
          ))}
        </div>
      </div>

      {/* Image and Caption Skeleton */}
      <div className="mb-4">
        <div className="w-full h-48 bg-gray-300 rounded-lg"></div>
        <div className="mt-2 w-3/4 h-3 bg-gray-300 rounded"></div>
        <div className="mt-1 w-1/2 h-3 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
};

export default MadePostSkeleton;
