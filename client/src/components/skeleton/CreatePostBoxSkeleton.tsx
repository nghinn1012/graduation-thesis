import React from 'react';

const CreatePostBoxSkeleton: React.FC = () => {
  return (
    <div className="relative animate-pulse">
      <div className="flex p-4 items-start gap-4 border-b border-gray-300">
        <div className="avatar">
          <div className="w-8 rounded-full bg-gray-200"></div>
        </div>
        <div className="w-full">
          <div className="h-6 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostBoxSkeleton;
