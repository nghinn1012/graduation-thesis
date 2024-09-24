import React, { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight, FiMinus, FiPlus } from "react-icons/fi";
import { addWeeks, subWeeks, startOfWeek, endOfWeek, addDays } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { postFetcher } from "../../api/post";
import { useAuthContext } from "../../hooks/useAuthContext";

interface ScheduleRecipeModalProps {
  recipe: {
    _id: string;
    title: string;
    imageUrl: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onScheduleComplete: () => void;
  plannedDates?: string[];
}

const ScheduleRecipeModal: React.FC<ScheduleRecipeModalProps> = ({
  recipe,
  isOpen,
  onClose,
  onScheduleComplete,
  plannedDates = [],
}) => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [pickedDates, setPickedDates] = useState<Date[]>([]);

  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const { auth } = useAuthContext();

  useEffect(() => {
    if (plannedDates && plannedDates.length > 0) {
      setPickedDates(plannedDates.map((dateStr) => new Date(dateStr)));
    }
  }, [plannedDates]);

  const handlePrevWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const toggleDate = (date: Date) => {
    setPickedDates((prevDates) =>
      prevDates.some((d) => d.getTime() === date.getTime())
        ? prevDates.filter((d) => d.getTime() !== date.getTime())
        : [...prevDates, date]
    );
  };

  const daysOfWeek = Array.from({ length: 7 }).map((_, index) =>
    addDays(currentWeekStart, index)
  );

  const handleSubmitSchedule = async () => {
    if (!auth?.token) return;
    const response = await postFetcher.scheduleMeal(
      auth.token,
      recipe._id,
      pickedDates.map((pickDate) => pickDate.toString())
    );
    console.log(response);

    onScheduleComplete();
    onClose();
    setPickedDates([]);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-start justify-center z-10">
          <div className="modal-overlay fixed inset-0 bg-black opacity-10"></div>

          <div className="responsive top-10 modal-content absolute justify-center items-center bg-white p-6 rounded-lg w-full max-w-lg z-50 overflow-y-auto max-h-[800px]">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-2xl"
            >
              &times;
            </button>

            <h2 className="text-2xl font-semibold mb-2">Schedule Recipe</h2>
            <p className="mb-4">
              Choose which day(s) to schedule this recipe for.
            </p>

            <div className="flex items-center bg-gray-100 rounded-lg p-4 mb-4">
              <img
                src={recipe.imageUrl}
                alt="Recipe"
                className="w-16 h-16 rounded-full object-cover mr-4"
              />
              <div>
                <h3 className="text-lg font-semibold">{recipe.title}</h3>
              </div>
            </div>

            <div className="p-4 rounded-lg shadow-md flex justify-between items-center my-4">
              <button
                className="btn btn-circle btn-sm bg-white text-gray-600"
                onClick={handlePrevWeek}
              >
                <FiChevronLeft className="h-5 w-5" />
              </button>

              <span className="text-lg font-bold text-gray-800">
                {formatInTimeZone(
                  currentWeekStart,
                  "Asia/Ho_Chi_Minh",
                  "dd MMM"
                )}{" "}
                –{" "}
                {formatInTimeZone(currentWeekEnd, "Asia/Ho_Chi_Minh", "dd MMM")}
              </span>

              <button
                className="btn btn-circle btn-sm bg-white text-gray-600"
                onClick={handleNextWeek}
              >
                <FiChevronRight className="h-5 w-5" />
              </button>
            </div>

            <ul className="mb-6">
              {daysOfWeek.map((date) => (
                <li
                  key={date.getTime()}
                  className="flex items-center justify-between mb-2"
                >
                  <span>
                    {formatInTimeZone(date, "Asia/Ho_Chi_Minh", "EEEE, dd MMM")}
                  </span>
                  <button
                    className="btn btn-circle"
                    onClick={() => toggleDate(date)}
                  >
                    {pickedDates.some((d) => d.getTime() === date.getTime()) ? (
                      <FiMinus className="text-red-500 h-5 w-5" />
                    ) : (
                      <FiPlus className="text-green-500 h-5 w-5" />
                    )}
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex justify-center">
              <button
                onClick={handleSubmitSchedule}
                className="btn btn-primary w-full"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ScheduleRecipeModal;
