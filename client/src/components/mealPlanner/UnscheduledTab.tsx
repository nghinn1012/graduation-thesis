import React, { useState, useRef, useEffect } from "react";
import { Meal, postFetcher } from "../../api/post";
import { IoIosMore } from "react-icons/io";
import ScheduleRecipeModal from "./SchedulePost";
import ServingsModal from "./ServingModal";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useToastContext } from "../../hooks/useToastContext";
import { FaRegClock } from "react-icons/fa";
import { useI18nContext } from "../../hooks/useI18nContext";

interface UnscheduledTabProps {
  unscheduledMeals: Meal[];
  setUnscheduledMeals: React.Dispatch<React.SetStateAction<Meal[]>>;
  fetchScheduledMeals: () => void;
}

const UnscheduledTab: React.FC<UnscheduledTabProps> = ({
  unscheduledMeals,
  setUnscheduledMeals,
  fetchScheduledMeals,
}) => {
  const [showDropdown, setShowDropdown] = useState<boolean[]>([]);
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isModalScheduleOpen, setIsModalScheduleOpen] = useState(false);
  const [isServingsModalOpen, setIsServingsModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const { auth } = useAuthContext();
  const { success, error } = useToastContext();
  const language = useI18nContext();
  const lang = language.of("ScheduleSection", "PostDetails");

  const handleMoreClick = (index: number) => {
    setShowDropdown((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const handleAction = async (action: string, meal: Meal) => {
    if (!auth?.token) return;

    if (action === "Schedule") {
      setSelectedMeal(meal);
      setIsModalScheduleOpen(true);
    }
    if (action === "Remove") {
      const response = await postFetcher.removeMeal(
        { mealId: meal._id },
        auth.token
      );
      if (response) {
        setUnscheduledMeals((prev) => prev.filter((m) => m._id !== meal._id));
        success(lang("removed-meal-success"));
      } else {
        error(lang("removed-meal-fail"));
      }
    }
    if (action === "Add to Shopping List") {
      setSelectedMeal(meal);
      setIsServingsModalOpen(true);
    }
  };

  const handleServingsConfirm = async (servings: number) => {
    if (!auth?.token || !selectedMeal) return;

    const response = await postFetcher.addIngredientToShoppingList(
      auth.token,
      selectedMeal.postId,
      servings
    );
    if (response) {
      success(lang("added-to-shopping-list"));
    } else {
      error(lang("add-to-shopping-list-fail"));
    }
    setIsServingsModalOpen(false);
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


  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRefs.current.some(
        (ref) => ref && ref.contains(event.target as Node)
      )
    ) {
      return;
    }
    setShowDropdown((prev) => prev.map(() => false));
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div>
      <h2 className="text-lg font-semibold">{lang("unscheduled-meals")}</h2>
      {unscheduledMeals?.length > 0 ? (
        <div className="space-y-4 mt-2">
          {unscheduledMeals.map((meal, mealIndex) => (
            <div key={mealIndex} className="card shadow-lg">
              <div className="card-body relative">
                <div className="flex items-center">
                  <img
                    src={meal.imageUrl}
                    alt="meal"
                    className="rounded-lg w-12 h-12"
                  />
                  <div className="ml-4">
                    <h3 className="font-bold">{meal.title}</h3>
                    <div className="flex items-center mt-2">
                      <div className="badge badge-success text-white gap-2 p-3">
                        <FaRegClock className="w-4 h-4" />
                        <span>{handleShowTimeToTake(meal.timeToTake || "")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-auto">
                    <div
                      onClick={() => handleMoreClick(mealIndex)}
                      className="cursor-pointer"
                    >
                      <IoIosMore className="h-6 w-6" />
                    </div>

                    <div ref={(el) => (dropdownRefs.current[mealIndex] = el)}>
                      {showDropdown[mealIndex] && (
                        <div className="absolute z-10 right-0 mt-1 bg-white shadow-md rounded-md p-2">
                          <ul className="space-y-1">
                            <li
                              onClick={() => handleAction("Schedule", meal)}
                              className="cursor-pointer hover:bg-gray-200 p-1 rounded"
                            >
                              {lang("schedule-meal")}
                            </li>
                            <li
                              onClick={() => handleAction("Remove", meal)}
                              className="cursor-pointer hover:bg-gray-200 p-1 rounded"
                            >
                              {lang("remove-meal")}
                            </li>
                            <li
                              onClick={() =>
                                handleAction("Add to Shopping List", meal)
                              }
                              className="cursor-pointer hover:bg-gray-200 p-1 rounded"
                            >
                              {lang("add-to-shopping-list")}
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {selectedMeal && isModalScheduleOpen && (
                <ScheduleRecipeModal
                  recipe={selectedMeal}
                  isOpen={isModalScheduleOpen}
                  onClose={() => setIsModalScheduleOpen(false)}
                  onScheduleComplete={fetchScheduledMeals}
                />
              )}
              {selectedMeal &&
                isServingsModalOpen && (
                  <ServingsModal
                    isOpen={isServingsModalOpen}
                    onClose={() => setIsServingsModalOpen(false)}
                    onConfirm={handleServingsConfirm}
                  />
                )}
            </div>
          ))}
        </div>
      ) : (
        <div>{lang("no-unscheduled-meals")}</div>
      )}
    </div>
  );
};

export default UnscheduledTab;
