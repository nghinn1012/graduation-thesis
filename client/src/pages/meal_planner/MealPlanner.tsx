import React, { useEffect, useState } from "react";
import TodayTab from "../../components/mealPlanner/Today";
import ThisWeekTab from "../../components/mealPlanner/ThisWeekTab";
import UnscheduledTab from "../../components/mealPlanner/UnscheduledTab";
import { Meal, postFetcher } from "../../api/post";
import type { MealPlanner } from "../../api/post";
import { useAuthContext } from "../../hooks/useAuthContext";

type Tab = "today" | "thisWeek" | "unscheduled";

const MealPlanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("thisWeek");
  const [mealPlanner, setMealPlanner] = useState<MealPlanner>(
    {} as MealPlanner
  );
  const [unscheduledMeals, setUnscheduledMeals] = useState<Meal[]>([]);
  const [scheduledMeals, setScheduledMeals] = useState<Meal[]>([]);
  const { auth } = useAuthContext();
  const fetchMealPlanner = async () => {
    if (!auth?.token) return;
    const mealPlanner = await postFetcher.getMealPlanner(auth.token);
    setMealPlanner(mealPlanner as unknown as MealPlanner);
  };
  useEffect(() => {
    fetchMealPlanner();
  }, [auth?.token]);

  useEffect(() => {
    if (!auth?.token) return;
    const unscheduledMeals = mealPlanner.meals?.filter(
      (meal) => !meal.is_planned
    );
    const scheduledMeals = mealPlanner.meals?.filter((meal) => meal.is_planned);
    setScheduledMeals(scheduledMeals);
    setUnscheduledMeals(unscheduledMeals);
  }, [auth?.token, mealPlanner]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case "today":
        return <TodayTab scheduledMeals={scheduledMeals}/>;
      case "thisWeek":
        return <ThisWeekTab scheduledMeals={scheduledMeals}/>;
      case "unscheduled":
        return (
          <UnscheduledTab
            unscheduledMeals={unscheduledMeals}
            fetchScheduledMeals={fetchMealPlanner}
            setUnscheduledMeals={setUnscheduledMeals}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-center">Meal Planner</h1>
      </div>

      {/* Tabs */}
      <div role="tablist" className="tabs tabs-boxed my-4 flex-nowrap flex">
        <a
          className={`tab ${
            activeTab === "today" ? "tab-active" : ""
          } flex-1 text-center whitespace-nowrap`}
          role="tab"
          onClick={() => setActiveTab("today")}
        >
          Today
        </a>
        <a
          className={`tab ${
            activeTab === "thisWeek" ? "tab-active" : ""
          } flex-1 text-center whitespace-nowrap`}
          role="tab"
          onClick={() => setActiveTab("thisWeek")}
        >
          This Week
        </a>
        <a
          className={`tab ${
            activeTab === "unscheduled" ? "tab-active" : ""
          } flex-1 text-center whitespace-nowrap`}
          role="tab"
          onClick={() => setActiveTab("unscheduled")}
        >
          Unscheduled
        </a>
      </div>

      {renderActiveTab()}
    </div>
  );
};

export default MealPlanner;
