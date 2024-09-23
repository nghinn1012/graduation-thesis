import React, { useState } from "react";
import {
  format,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { Meal } from "../../api/post";

interface ThisWeekTabProps {
  scheduledMeals: Meal[];
}

const ThisWeekTab: React.FC<ThisWeekTabProps> = ({ scheduledMeals }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [expandedDays, setExpandedDays] = useState<{ [key: string]: boolean }>(
    {}
  );

  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

  const daysOfWeek = eachDayOfInterval({
    start: currentWeekStart,
    end: currentWeekEnd,
  });

  const getMealsForDate = (date: Date) => {
    if (!scheduledMeals) return [];

    return scheduledMeals.filter((meal) =>
      meal?.plannedDate?.some((plannedDate: string) => {
        const plannedDateObj = new Date(plannedDate);

        const plannedDateFormatted = `${plannedDateObj.getFullYear()}-${(
          plannedDateObj.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${plannedDateObj
          .getDate()
          .toString()
          .padStart(2, "0")}`;
        const dateFormatted = `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
        console.log(plannedDateFormatted, dateFormatted);
        return plannedDateFormatted === dateFormatted;
      })
    );
  };

  const toggleExpand = (dayName: string) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayName]: !prev[dayName],
    }));
  };

  const handlePrevWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  return (
    <div>
      {/* Date Navigation */}
      <div className="p-4 rounded-lg shadow-md flex justify-between items-center my-4">
        <button
          className="btn btn-circle btn-sm bg-white text-gray-600"
          onClick={handlePrevWeek}
        >
          <FiChevronLeft className="h-5 w-5" />
        </button>

        <span className="text-lg font-bold text-gray-800">
          {format(currentWeekStart, "dd MMM")} –{" "}
          {format(currentWeekEnd, "dd MMM")}
        </span>

        <button
          className="btn btn-circle btn-sm bg-white text-gray-600"
          onClick={handleNextWeek}
        >
          <FiChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Days and Meals */}
      {daysOfWeek.map((day) => {
        const mealsForDay = getMealsForDate(day);
        const dayName = format(day, "EEEE");

        return (
          <div key={day.toString()} className="my-10">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">{dayName}</h2>
              <span className="badge badge-lg badge-success text-white">
                {mealsForDay.length}
                <button
                  className="text-sm ml-2"
                  onClick={() => toggleExpand(dayName)}
                >
                  {expandedDays[dayName] ? <FaAngleUp /> : <FaAngleDown />}
                </button>
              </span>
            </div>

            {expandedDays[dayName] && mealsForDay.length > 0 && (
              <div className="space-y-4 mt-2">
                {mealsForDay.map((meal, mealIndex) => (
                  <div key={mealIndex} className="card shadow-lg">
                    <div className="card-body">
                      <div className="flex items-center">
                        <img
                          src={
                            meal.imageUrl || "https://via.placeholder.com/50"
                          }
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
            {expandedDays[dayName] && mealsForDay.length === 0 && (
              <div className="text-gray-500 italic mt-2">No meal planned</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ThisWeekTab;
