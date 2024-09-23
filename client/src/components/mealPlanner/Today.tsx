import React, { useState } from "react";
import { format, addDays, subDays } from "date-fns";
import { Meal } from "../../api/post";
import {
  FaAngleLeft,
  FaAngleRight,
  FaAngleDown,
  FaAngleUp,
} from "react-icons/fa";

interface TodayTabProps {
  scheduledMeals: Meal[];
}

const TodayTab: React.FC<TodayTabProps> = ({ scheduledMeals }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const getMealsForDate = (date: Date) => {
    return scheduledMeals.filter((meal) =>
      meal?.plannedDate?.some((plannedDate: string) => {
        const plannedDateObj = new Date(plannedDate);
        const plannedDateFormatted = format(plannedDateObj, "yyyy-MM-dd");
        const selectedDateFormatted = format(date, "yyyy-MM-dd");
        return plannedDateFormatted === selectedDateFormatted;
      })
    );
  };

  const mealsForSelectedDate = getMealsForDate(selectedDate);

  const handlePrevDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  return (
    <div>
      {/* Date Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevDay} className="btn btn-circle btn-sm">
          <FaAngleLeft />
        </button>
        <h2 className="text-lg font-semibold">
          {format(selectedDate, "EEEE, MMMM d")}
        </h2>
        <button onClick={handleNextDay} className="btn btn-circle btn-sm">
          <FaAngleRight />
        </button>
      </div>

      {mealsForSelectedDate.length > 0 && (
        <div className="space-y-4 mt-2">
          {mealsForSelectedDate.map((meal, mealIndex) => (
            <div key={mealIndex} className="card shadow-lg">
              <div className="card-body">
                <div className="flex items-center">
                  <img
                    src={meal.imageUrl || "https://via.placeholder.com/50"}
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
      )}
      {mealsForSelectedDate.length === 0 && (
        <div className="text-gray-500 italic mt-2">
          No meals planned for this date
        </div>
      )}
    </div>
  );
};

export default TodayTab;
