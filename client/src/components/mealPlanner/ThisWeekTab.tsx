import React, { useEffect, useRef, useState } from "react";
import {
  format,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addDays,
} from "date-fns";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FaAngleDown, FaAngleUp, FaRegClock } from "react-icons/fa";
import { Meal, postFetcher } from "../../api/post";
import { IoIosMore } from "react-icons/io";
import ServingsModal from "./ServingModal";
import { useToastContext } from "../../hooks/useToastContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import ScheduleRecipeModal from "./SchedulePost";
import SetTime from "./SetTime";

interface ThisWeekTabProps {
  scheduledMeals: Meal[];
  fetchScheduledMeals: () => void;
}

const ThisWeekTab: React.FC<ThisWeekTabProps> = ({
  scheduledMeals,
  fetchScheduledMeals,
}) => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [expandedDays, setExpandedDays] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [activeDropdowns, setActiveDropdowns] = useState<{
    [formattedDate: string]: number | null;
  }>({});

  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });

  const daysOfWeek = eachDayOfInterval({
    start: currentWeekStart,
    end: currentWeekEnd,
  });
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isServingsModalOpen, setIsServingsModalOpen] = useState(false);
  const [isModalScheduleOpen, setIsModalScheduleOpen] = useState(false);
  const [isModalTimeOpen, setIsModalTimeOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  const { auth } = useAuthContext();
  const { success, error } = useToastContext();
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
        return plannedDateFormatted === dateFormatted;
      })
    );
  };

  const toggleExpand = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    setExpandedDays((prev) => ({
      ...prev,
      [formattedDate]: !prev[formattedDate],
    }));
  };

  const toggleDropdown = (index: number, date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    setActiveDropdowns((prev) => ({
      ...prev,
      [formattedDate]: prev[formattedDate] === index ? null : index,
    }));
  };

  const handlePrevWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRefs.current.some(
        (ref) => ref && ref.contains(event.target as Node)
      )
    ) {
      return;
    }
    setActiveDropdowns({});
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
      case "add":
        setSelectedMeal(scheduledMeals[mealIndex]);
        setIsServingsModalOpen(true);
        break;
      case "edit":
        setSelectedMeal(scheduledMeals[mealIndex]);
        setIsModalScheduleOpen(true);
        break;
      case "repeat":
        if (!formattedDate) {
          console.error("Failed to repeat meal, no date available");
          return;
        }

        const currentDate = format(formattedDate, "yyyy-MM-dd");

        const nextWeekDate = addDays(new Date(currentDate), 7);

        const formattedNextWeekDate = format(nextWeekDate, "yyyy-MM-dd");

        const updatedPlannedDatesForRepeat = [
          ...(scheduledMeals[mealIndex]?.plannedDate || []),
          formattedNextWeekDate,
        ];

        await postFetcher.scheduleMeal(
          auth.token,
          scheduledMeals[mealIndex]._id,
          updatedPlannedDatesForRepeat
        );

        await fetchScheduledMeals();

        console.log(
          `Repeated meal index ${mealIndex} to next week on ${formattedNextWeekDate}`
        );
        break;

      case "time":
        console.log("Set Meal Time for meal index:", mealIndex);
        if (!formattedDate) {
          console.error("Failed to set meal time, no date available");
          return;
        }
        setSelectedMeal(scheduledMeals[mealIndex]);
        setIsModalTimeOpen(true);
        setDate(formattedDate);
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
          (date) => format(new Date(date), "yyyy-MM-dd") !== today?.toString()
        );
        console.log(updatedPlannedDates);
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

    setActiveDropdowns({});
  };

  const handleServingsConfirm = async (servings: number) => {
    if (!auth?.token || !selectedMeal) return;

    const response = await postFetcher.addIngredientToShoppingList(
      auth.token,
      selectedMeal.postId,
      servings
    );
    if (response) {
      success("Added to shopping list");
    } else {
      error("Failed to add to shopping list");
    }
    setIsServingsModalOpen(false);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmitSetTime = async (time: string) => {
    if (!auth?.token || !selectedMeal) return;
    console.log("Set Meal Time for meal index:", selectedMeal);
    console.log(time);
    setIsModalTimeOpen(false);
  }

  return (
    <div>
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

      {daysOfWeek.map((day) => {
        const mealsForDay = getMealsForDate(day);
        const dayName = format(day, "EEEE");
        const formattedDate = format(day, "yyyy-MM-dd");

        return (
          <div key={formattedDate} className="my-10">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">{dayName}</h2>
              <span className="badge badge-lg badge-success text-white">
                {mealsForDay.length}
                <button
                  className="text-sm ml-2"
                  onClick={() => toggleExpand(day)}
                >
                  {expandedDays[formattedDate] ? (
                    <FaAngleUp />
                  ) : (
                    <FaAngleDown />
                  )}
                </button>
              </span>
            </div>

            {expandedDays[formattedDate] && mealsForDay.length > 0 && (
              <div className="space-y-4 mt-2">
                {mealsForDay.map((meal, mealIndex) => (
                  <div key={mealIndex} className="card shadow-lg">
                    <div className="card-body">
                      <div className="flex items-center justify-between">
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
                            <div className="flex items-center mt-2">
                              <div className="badge badge-success text-white gap-2 p-3">
                                <FaRegClock className="w-4 h-4" />
                                <span>{meal.timeToTake}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="relative">
                          <button
                            className="cursor-pointer"
                            onClick={() => toggleDropdown(mealIndex, day)}
                          >
                            <IoIosMore className="h-6 w-6" />
                          </button>
                          {activeDropdowns[formattedDate] === mealIndex && (
                            <div
                              ref={(el) =>
                                (dropdownRefs.current[mealIndex] = el)
                              }
                              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10"
                            >
                              <ul className="py-2">
                                <li
                                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                  onClick={() =>
                                    handleDropdownAction("add", meal)
                                  }
                                >
                                  Add to Shopping List
                                </li>
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
                                    handleDropdownAction("repeat", meal, day)
                                  }
                                >
                                  Repeat Next Week
                                </li>
                                <li
                                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                  onClick={() =>
                                    handleDropdownAction("time", meal, day)
                                  }
                                >
                                  Set Meal Time
                                </li>
                                <li
                                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                  onClick={() =>
                                    handleDropdownAction("remove", meal, day)
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
                {selectedMeal && isModalScheduleOpen && (
                  <ScheduleRecipeModal
                    recipe={selectedMeal}
                    isOpen={isModalScheduleOpen}
                    onClose={() => setIsModalScheduleOpen(false)}
                    onScheduleComplete={fetchScheduledMeals}
                    plannedDates={selectedMeal.plannedDate}
                  />
                )}
                {selectedMeal && isServingsModalOpen && (
                  <ServingsModal
                    isOpen={isServingsModalOpen}
                    onClose={() => setIsServingsModalOpen(false)}
                    onConfirm={handleServingsConfirm}
                  />
                )}
                {selectedMeal && isModalTimeOpen && (
                  <SetTime meal={selectedMeal}
                  date={date}
                  onClose={() => setIsModalTimeOpen(false)}
                  onSubmit={handleSubmitSetTime}
                  />
                )
                  }
              </div>
            )}
            {expandedDays[formattedDate] && mealsForDay.length === 0 && (
              <div className="text-gray-500 italic mt-2">No meal planned</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ThisWeekTab;
