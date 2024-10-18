
import React from 'react';

const PurchaseSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse p-4">
      {/* PurchaseSkeleton for Image */}
      <div className="h-64 bg-gray-300 rounded-lg mb-4"></div>

      {/* PurchaseSkeleton for Buttons */}
      <div className="flex justify-between mb-4">
        <div className="bg-gray-300 rounded-full w-8 h-8"></div>
        <div className="bg-gray-300 rounded-full w-8 h-8"></div>
      </div>

      {/* PurchaseSkeleton for Title and Ratings */}
      <div className="h-6 bg-gray-300 rounded mb-2"></div>
      <div className="flex items-center mb-4">
        <div className="h-6 bg-gray-300 rounded w-16 mr-2"></div>
      </div>

      {/* PurchaseSkeleton for Ingredients */}
      <div className="h-4 bg-gray-300 rounded mb-4"></div>

      {/* PurchaseSkeleton for Total Price */}
      <div className="flex justify-between items-center mb-4">
        <div className="bg-gray-300 rounded w-32 h-8"></div>
        <div className="bg-gray-300 rounded w-20 h-8"></div>
      </div>

      {/* PurchaseSkeleton for Reviews */}
      <h3 className="font-bold text-xl mb-4 h-4 bg-gray-300 rounded"></h3>
      <div className="h-16 bg-gray-300 rounded mb-4"></div>
      <div className="h-16 bg-gray-300 rounded mb-4"></div>
    </div>
  );
};

export default PurchaseSkeleton;
