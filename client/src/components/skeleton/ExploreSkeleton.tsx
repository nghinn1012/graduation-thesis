const PostSkeleton = () => {
  return (
    <div className="relative animate-pulse">
      <div className="w-full aspect-square bg-gray-200 rounded" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-5 h-5 bg-gray-300 rounded-full mr-1" />
            <div className="w-8 h-4 bg-gray-300 rounded" />
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 bg-gray-300 rounded-full mr-1" />
            <div className="w-8 h-4 bg-gray-300 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ExploreSkeleton = () => {
  return (
    <>
      {[...Array(6)].map((_, index) => (
        <PostSkeleton key={index} />
      ))}
    </>
  );
};
