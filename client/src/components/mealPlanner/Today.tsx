import React, { useState, useRef, useEffect } from "react";
import { format, addDays, subDays } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FaRegClock } from "react-icons/fa";
import { IoIosMore } from "react-icons/io";
import { Meal, MealPlannedDate, postFetcher } from "../../api/post";
import { useToastContext } from "../../hooks/useToastContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import ScheduleRecipeModal from "./SchedulePost";
import SetTime from "./SetTime";
import { toZonedTime } from "date-fns-tz";
import { useI18nContext } from "../../hooks/useI18nContext";
import { Toaster } from "react-hot-toast";

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
  const language = useI18nContext();
  const lang = language.of("ScheduleSection", "PostDetails");
  const langCode = language.language.code;
  const locale = langCode === 'vi' ? vi : enUS;
  const { error } = useToastContext();

  const formatDateWithLocale = (date: Date, formatStr: string) => {
    return format(date, formatStr, { locale });
  };


  const getMealsForDate = (date: Date) => {
    return scheduledMeals?.filter((meal) =>
      meal?.plannedDate?.some((plannedDate: MealPlannedDate) => {
        const plannedDateObj = new Date(plannedDate.date);
        const plannedDateFormatted = formatDateWithLocale(plannedDateObj, "yyyy-MM-dd");
        const selectedDateFormatted = formatDateWithLocale(date, "yyyy-MM-dd");
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
      error(lang("error-meal-not-found"));
      return;
    }

    switch (action) {
      case "edit":
        setSelectedMeal(scheduledMeals[mealIndex]);
        setIsModalScheduleOpen(true);
        break;
      case "time":
        if (!formattedDate) {
          error(lang("error-failed-set-meal-time-no-date"));
          return;
        }
        setSelectedMeal(scheduledMeals[mealIndex]);
        setIsModalTimeOpen(true);
        setSelectedDate(formattedDate);
        break;
      case "remove":
        if (!formattedDate) {
          error(lang("error-failed-remove-meal-date"));
          return;
        }
        const today = formatDateWithLocale(formattedDate, "yyyy-MM-dd");
        const updatedPlannedDates = scheduledMeals[
          mealIndex
        ]?.plannedDate?.filter(
          (plannedDate) => formatDateWithLocale(new Date(plannedDate.date), "yyyy-MM-dd") !== today?.toString()
        );
        if (updatedPlannedDates?.length === 0) {
          error(lang("log-meal-no-more-planned-dates"));
          return;
        }
        if (!updatedPlannedDates) {
          error(lang("error-failed-remove-today-meal-date"));
          return;
        }
        await postFetcher.scheduleMeal(
          auth.token,
          scheduledMeals[mealIndex]._id,
          updatedPlannedDates
        );
        await fetchScheduledMeals();
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
    const plannedDateString = formatDateWithLocale(plannedDate, "yyyy-MM-dd");

    const existingMeal = scheduledMeals.find(
      (meal) => meal.postId === selectedMeal.postId
    );

    console.log(existingMeal);

    if (existingMeal) {
      const updatedPlannedDates = existingMeal?.plannedDate?.map((planned) => {
        const plannedMealDate = toZonedTime(new Date(planned.date), timeZone);
        return formatDateWithLocale(plannedMealDate, "yyyy-MM-dd") === plannedDateString
          ? { ...planned, date: plannedDate as unknown as string, mealTime: true }
          : planned;
      });

      if (!updatedPlannedDates) {
        error(lang("fail-update-meal-time"));
        return;
      }
      const response = await postFetcher.scheduleMeal(
        auth.token,
        existingMeal._id,
        updatedPlannedDates as MealPlannedDate[]
      );

      if (response) {
        success(lang("meal-updated-success"));
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
        success(lang("meal-time-set-success"));
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
      (plannedDate) => formatDateWithLocale(new Date(plannedDate.date), "yyyy-MM-dd") === formattedDate
    );

    if (mealSingleIndex && mealSingleIndex.mealTime) {
      const plannedDateTime = new Date(mealSingleIndex.date);
      return formatDateWithLocale(plannedDateTime, "HH:mm");
    }
    return "";
  };

  const handleShowTimeToTake = (timeToTake: string) => {
    if (!timeToTake) return lang("unknown");
    if (Number(timeToTake) < 60) return lang("minutes", timeToTake);
    const hours = Math.floor(Number(timeToTake) / 60);
    const minutes = Number(timeToTake) % 60;
    const modifiedHours = hours > 0 ? lang("hours", hours) : "";
    const modifiedMinutes = minutes > 0 ? lang("minutes", minutes) : "";
    return `${modifiedHours} ${modifiedMinutes}`;
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
      <Toaster />
      <div className="flex p-4 rounded-lg shadow-md justify-between items-center mb-4">
        <button
          onClick={handlePrevDay}
          className="btn btn-circle btn-sm bg-white text-gray-600"
        >
          <FiChevronLeft />
        </button>
        <h2 className="text-lg font-semibold">
          {formatDateWithLocale(selectedDate, "EEEE, MMMM d")}
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
                            {getMealTimeInfo(meal, formatDateWithLocale(selectedDate, "yyyy-MM-dd"))
                              ? `${getMealTimeInfo(meal, formatDateWithLocale(selectedDate, "yyyy-MM-dd"))}
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
                            {lang("edit-schedule")}
                          </li>
                          <li
                            className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                            onClick={() =>
                              handleDropdownAction("time", meal, selectedDate)
                            }
                          >
                            {lang("set-meal-time")}
                          </li>
                          <li
                            className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                            onClick={() =>
                              handleDropdownAction("remove", meal, selectedDate)
                            }
                          >
                            {lang("remove-meal")}
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
            {lang("no-meal-planned")}
          </div>
        ))}

      {selectedMeal && isModalTimeOpen && (
        <SetTime
          meal={selectedMeal}
          date={selectedDate}
          time={getMealTimeInfo(selectedMeal, formatDateWithLocale(selectedDate, "yyyy-MM-dd"))}
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
