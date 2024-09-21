import React, { useState } from "react";
import TodayTab from "../../components/mealPlanner/Today";
import ThisWeekTab from "../../components/mealPlanner/ThisWeekTab";
import UnscheduledTab from "../../components/mealPlanner/UnscheduledTab";

type Tab = "today" | "thisWeek" | "unscheduled";

const MealPlanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("thisWeek");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "today":
        return <TodayTab />;
      case "thisWeek":
        return <ThisWeekTab />;
      case "unscheduled":
        return <UnscheduledTab />;
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
