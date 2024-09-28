import React, { useState, useRef, useEffect } from "react";
import { format, addDays, subDays } from "date-fns";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FaRegClock } from "react-icons/fa";
import { IoIosMore } from "react-icons/io";
import { Meal, MealPlannedDate, postFetcher } from "../../api/post";
import { useToastContext } from "../../hooks/useToastContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import ScheduleRecipeModal from "./SchedulePost";
import SetTime from "./SetTime";
import { toZonedTime } from "date-fns-tz";

interface TodayTabProps {
  scheduledMeals: Meal[];
  fetchScheduledMeals: () => void;
}

const TodayTab: React.FC<TodayTabProps> = ({ scheduledMeals, fetchScheduledMeals }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [isModalScheduleOpen, setIsModalScheduleOpen] = useState(false);
  const [isModalTimeOpen, setIsModalTimeOpen] = useState(false);
  const { auth } = useAuthContext();
  const { success } = useToastContext();

  const getMealsForDate = (date: Date) => {
    return scheduledMeals?.filter((meal) =>
      meal?.plannedDate?.some((plannedDate: MealPlannedDate) => {
        const plannedDateObj = new Date(plannedDate.date);
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

  const toggleDropdown = (index: number) => {
    setActiveDropdown(index === activeDropdown ? null : index);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRefs.current.some(
        (ref) => ref && ref.contains(event.target as Node)
      )
    ) {
      return;
    }
    setActiveDropdown(null);
  };

  const handleDropdownAction = async (
    action: string,
    meal: Meal,
    formattedDate?: Date
  ) => {
    if (!auth?.token) return;

    const mealIndex = scheduledMeals.findIndex(
      (scheduledMeal) => scheduledMeal.postId === meal.postId
    );

    if (mealIndex === -1) {
      console.error("Meal not found in scheduledMeals");
      return;
    }

    switch (action) {
      case "edit":
        setSelectedMeal(scheduledMeals[mealIndex]);
        setIsModalScheduleOpen(true);
        break;
      case "time":
        if (!formattedDate) {
          console.error("Failed to set meal time, no date available");
          return;
        }
        setSelectedMeal(scheduledMeals[mealIndex]);
        setIsModalTimeOpen(true);
        setSelectedDate(formattedDate);
        break;
      case "remove":
        if (!formattedDate) {
          console.error("Failed to remove meal from date");
          return;
        }
        const today = format(formattedDate, "yyyy-MM-dd");
        const updatedPlannedDates = scheduledMeals[
          mealIndex
        ]?.plannedDate?.filter(
          (plannedDate) => format(new Date(plannedDate.date), "yyyy-MM-dd") !== today?.toString()
        );
        if (updatedPlannedDates?.length === 0) {
          console.log(
            `Meal index ${mealIndex} has no more planned dates, consider removing it from schedule`
          );
        }
        if (!updatedPlannedDates) {
          console.error("Failed to remove today's date from meal");
          return;
        }
        await postFetcher.scheduleMeal(
          auth.token,
          scheduledMeals[mealIndex]._id,
          updatedPlannedDates
        );
        await fetchScheduledMeals();
        console.log(`Removed meal index ${mealIndex} from today's date`);
        break;
      default:
        console.log("Unknown action");
    }

    setActiveDropdown(null);
  };

  const handleSubmitSetTime = async (time: string) => {
    if (!auth?.token || !selectedMeal) return;

    const timeZone = "Asia/Ho_Chi_Minh";

    const plannedDate = toZonedTime(new Date(time), timeZone);
    const plannedDateString = format(plannedDate, "yyyy-MM-dd");

    const existingMeal = scheduledMeals.find(
      (meal) => meal.postId === selectedMeal.postId
    );

    console.log(existingMeal);

    if (existingMeal) {
      const updatedPlannedDates = existingMeal?.plannedDate?.map((planned) => {
        const plannedMealDate = toZonedTime(new Date(planned.date), timeZone);
        return format(plannedMealDate, "yyyy-MM-dd") === plannedDateString
          ? { ...planned, date: plannedDate as unknown as string, mealTime: true }
          : planned;
      });

      if (!updatedPlannedDates) {
        console.error("Failed to update meal time");
        return;
      }

      console.log("true", updatedPlannedDates);

      const response = await postFetcher.scheduleMeal(
        auth.token,
        existingMeal._id,
        updatedPlannedDates as MealPlannedDate[]
      );

      if (response) {
        success("Meal time updated successfully");
      }
    } else {
      console.log("false", plannedDateString);
      const response = await postFetcher.scheduleMeal(
        auth.token,
        selectedMeal._id,
        [
          ...(selectedMeal.plannedDate || []),
          { date: plannedDateString, mealTime: true },
        ]
      );

      if (response) {
        success("Meal time set successfully");
      }
    }

    await fetchScheduledMeals();
    setIsModalTimeOpen(false);
  };


  const getMealTimeInfo = (meal: Meal, formattedDate: string) => {
    if (!meal?.plannedDate) {
      return "";
    }
    const mealSingleIndex = meal.plannedDate.find(
      (plannedDate) => format(new Date(plannedDate.date), "yyyy-MM-dd") === formattedDate
    );

    if (mealSingleIndex && mealSingleIndex.mealTime) {
      const plannedDateTime = new Date(mealSingleIndex.date);
      return format(plannedDateTime, "HH:mm");
    }
    return "";
  };

  const handleShowTimeToTake = (timeToTake: string) => {
    if (!timeToTake) return "No time to take";
    if (Number(timeToTake) > 60) {
      const hours = Math.floor(Number(timeToTake) / 60);
      const minutes = Number(timeToTake) % 60;
      if (minutes === 0) return `${hours} hours`;
      return `${hours} hours ${minutes} minutes`;
    }
    return `${timeToTake} minutes`;
  };


  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div>
      {/* Date Navigation */}
      <div className="flex p-4 rounded-lg shadow-md justify-between items-center mb-4">
        <button
          onClick={handlePrevDay}
          className="btn btn-circle btn-sm bg-white text-gray-600"
        >
          <FiChevronLeft />
        </button>
        <h2 className="text-lg font-semibold">
          {format(selectedDate, "EEEE, MMMM d")}
        </h2>
        <button
          onClick={handleNextDay}
          className="btn btn-circle btn-sm bg-white text-gray-600"
        >
          <FiChevronRight />
        </button>
      </div>

      {mealsForSelectedDate?.length > 0 && (
        <div className="space-y-4 mt-2">
          {mealsForSelectedDate.map((meal, mealIndex) => (
            <div key={mealIndex} className="card shadow-lg relative">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={meal.imageUrl || "https://via.placeholder.com/50"}
                      alt="meal"
                      className="rounded-lg w-12 h-12"
                    />
                    <div className="ml-4">
                      <h3 className="font-bold">{meal.title}</h3>
                      <div className="flex items-center mt-2">
                        <div className="badge badge-success text-white gap-2 p-3">
                          <FaRegClock className="w-4 h-4" />
                          <span>
                            {getMealTimeInfo(meal, format(selectedDate, "yyyy-MM-dd"))
                              ? `${getMealTimeInfo(meal, format(selectedDate, "yyyy-MM-dd"))}
                              - ${handleShowTimeToTake(meal.timeToTake || "")}`
                              : `${handleShowTimeToTake(meal.timeToTake || "")}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      className="cursor-pointer"
                      onClick={() => toggleDropdown(mealIndex)}
                    >
                      <IoIosMore className="h-6 w-6" />
                    </button>
                    {activeDropdown === mealIndex && (
                      <div
                        ref={(el) => (dropdownRefs.current[mealIndex] = el)}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10"
                      >
                        <ul className="py-2">
                          <li
                            className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                            onClick={() => {
                              handleDropdownAction("edit", meal);
                            }}
                          >
                            Edit Schedule
                          </li>
                          <li
                            className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                            onClick={() =>
                              handleDropdownAction("time", meal, selectedDate)
                            }
                          >
                            Set Meal Time
                          </li>
                          <li
                            className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                            onClick={() =>
                              handleDropdownAction("remove", meal, selectedDate)
                            }
                          >
                            Remove
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!mealsForSelectedDate ||
        (mealsForSelectedDate.length === 0 && (
          <div className="text-gray-500 italic mt-2">
            No meals planned for this date
          </div>
        ))}

      {selectedMeal && isModalTimeOpen && (
        <SetTime
          meal={selectedMeal}
          date={selectedDate}
          time={getMealTimeInfo(selectedMeal, format(selectedDate, "yyyy-MM-dd"))}
          onClose={() => setIsModalTimeOpen(false)}
          onSubmit={handleSubmitSetTime}
        />
      )}

      {selectedMeal && isModalScheduleOpen && (
        <ScheduleRecipeModal
          recipe={selectedMeal}
          isOpen={isModalScheduleOpen}
          onClose={() => setIsModalScheduleOpen(false)}
          onScheduleComplete={fetchScheduledMeals}
          plannedDates={selectedMeal.plannedDate}
        />
      )}
    </div>
  );
};

export default TodayTab;
