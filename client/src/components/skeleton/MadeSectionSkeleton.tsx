import MadePostSkeleton from "./MadePostSkeleton";

export const MadeSectionSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 flex flex-row items-center justify-center gap-20">
        <div className="flex flex-col items-center">
          <div className="w-24 h-6 bg-gray-300 animate-pulse mb-2"></div>
          <div className="w-16 h-8 bg-gray-300 animate-pulse"></div>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-24 h-6 bg-gray-300 animate-pulse mb-2"></div>
          <div className="w-16 h-8 bg-gray-300 animate-pulse"></div>
        </div>
      </div>

      {/* Post Skeletons */}
      {[1, 2, 3].map((_, index) => (
        <MadePostSkeleton key={index} />
      ))}
    </div>
  );
};
