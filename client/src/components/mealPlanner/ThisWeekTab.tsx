import React, { useState } from "react";
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek } from "date-fns";
import {
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";

interface Day {
  name: string;
  meals: { meal: string; time: string }[];
}

const ThisWeekTab: React.FC = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [expandedDays, setExpandedDays] = useState<{ [key: string]: boolean }>(
    {}
  );

  const days: Day[] = [
    {
      name: "Monday",
      meals: [
        { meal: "Shrimp Scampi Pasta", time: "38M" },
        { meal: "Salad", time: "15M" },
      ],
    },
    {
      name: "Tuesday",
      meals: [{ meal: "Shrimp Scampi Pasta", time: "38M" }],
    },
    {
      name: "Wednesday",
      meals: [],
    },
  ];

  const handlePrevWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const toggleExpand = (dayName: string) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayName]: !prev[dayName],
    }));
  };

  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

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
      {days.map((day, index) => (
        <div key={index} className="my-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">{day.name}</h2>
            <span className="badge badge-lg badge-success text-white">
              {day.meals.length}
              <button
                className="text-sm ml-2"
                onClick={() => toggleExpand(day.name)}
              >
                {expandedDays[day.name] ? <FaAngleUp /> : <FaAngleDown />}
              </button>
            </span>
          </div>

          {/* Show meals if the day is expanded */}
          {expandedDays[day.name] && day.meals.length > 0 && (
            <div className="space-y-4 mt-2">
              {day.meals.map((meal, mealIndex) => (
                <div key={mealIndex} className="card shadow-lg">
                  <div className="card-body">
                    <div className="flex items-center">
                      <img
                        src="https://res.cloudinary.com/dngqemjgu/image/upload/v1726740495/posts/gkhzlzuqzwgip4nvfoab.png"
                        alt="meal"
                        className="rounded-lg w-12 h-12"
                      />
                      <div className="ml-4">
                        <h3 className="font-bold">{meal.meal}</h3>
                        <p className="text-sm">{meal.time}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {day.meals.length === 0 && (
            <div className="text-gray-500 italic mt-2">No meal planned</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ThisWeekTab;
