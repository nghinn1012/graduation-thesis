import React, { useState } from "react";
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek } from "date-fns";
import { FiChevronLeft, FiChevronRight, FiMoreHorizontal } from "react-icons/fi";

interface Day {
  name: string;
  meal: string;
  time: string;
}

const ThisWeekTab: React.FC = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const days: Day[] = [
    { name: "Monday", meal: "Shrimp Scampi Pasta", time: "38M" },
    { name: "Tuesday", meal: "Shrimp Scampi Pasta", time: "38M" },
    { name: "Wednesday", meal: "", time: "" },
  ];

  const handlePrevWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
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
            {day.meal && (
              <span className="badge badge-lg badge-success text-white">1</span>
            )}
          </div>

          {day.meal ? (
            <div className="card shadow-lg mt-2">
              <div className="card-body">
                <div className="flex items-center">
                  <img
                    src="https://res.cloudinary.com/dngqemjgu/image/upload/v1726740495/posts/gkhzlzuqzwgip4nvfoab.png"
                    alt="meal"
                    className="rounded-lg w-12 h-12"
                  />
                  <div className="ml-4">
                    <h3 className="font-bold">{day.meal}</h3>
                    <p className="text-sm">{day.time}</p>
                  </div>
                  <button className="ml-auto btn btn-sm">
                    <FiMoreHorizontal />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 italic">No meal planned</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ThisWeekTab;
