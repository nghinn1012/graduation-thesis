import React from "react";

const CommentSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="flex items-start space-x-3 border-b border-gray-200 pb-3">
        <div className="bg-gray-200 h-12 w-12 rounded-full"></div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex flex-col">
              <div className="bg-gray-200 h-4 rounded mb-2 w-full"></div>
              <div className="bg-gray-200 h-4 rounded mb-2 w-3/4"></div>
            </div>
            <div className="bg-gray-200 h-4 rounded mb-2 w-16"></div>
          </div>
          <div className="mt-2">
            <div className="bg-gray-200 h-4 rounded mb-2 w-full"></div>
            <div className="bg-gray-200 h-4 rounded mb-2 w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentSkeleton;
