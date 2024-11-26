const NetworkSkeleton = ({ count = 3 }) => {
  return (
    <div className="p-4 w-full mx-auto bg-white rounded-lg shadow-sm">
      {Array(count)
        .fill(0)
        .map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 rounded-lg border border-gray-100 mb-4"
          >
            <div className="flex items-center w-full">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
              </div>
              <div className="mx-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
              </div>
            </div>
            <div className="w-20 h-8 bg-gray-200 rounded-full animate-pulse" />
          </div>
        ))}
    </div>
  );
};

export default NetworkSkeleton;
