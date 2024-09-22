import React from "react";
import { Meal } from "../../api/post";

interface UnscheduledTabProps {
  unscheduledMeals: Meal[];
}

const UnscheduledTab: React.FC<UnscheduledTabProps> = ({
  unscheduledMeals,
}) => {
  return (
    <div>
      <h2 className="text-lg font-semibold">Unscheduled Meals</h2>
      {unscheduledMeals.length > 0 ? (
        <div className="space-y-4 mt-2">
          {unscheduledMeals.map((meal, mealIndex) => (
            <div key={mealIndex} className="card shadow-lg">
              <div className="card-body">
                <div className="flex items-center">
                  <img
                    src={meal.imageUrl}
                    alt="meal"
                    className="rounded-lg w-12 h-12"
                  />
                  <div className="ml-4">
                    <h3 className="font-bold">{meal.title}</h3>
                    <p className="text-sm">{meal.timeToTake}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>No unscheduled meals!</div>
      )}
    </div>
  );
};

export default UnscheduledTab;
