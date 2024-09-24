const MealPlannerSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      <div className="h-20 bg-gray-200 rounded mb-4"></div>
      <div className="h-8 bg-gray-200 rounded mb-4"></div>
      <div className="flex space-x-4">
        <div className="flex-1 h-16 bg-gray-200 rounded"></div>
        <div className="flex-1 h-16 bg-gray-200 rounded"></div>
        <div className="flex-1 h-16 bg-gray-200 rounded"></div>
      </div>
      <div className="flex space-x-4">
        <div className="flex-1 h-16 bg-gray-200 rounded"></div>
        <div className="flex-1 h-16 bg-gray-200 rounded"></div>
        <div className="flex-1 h-16 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export default MealPlannerSkeleton;
