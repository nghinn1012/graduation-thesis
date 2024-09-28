import React from "react";

type ItemType = {
  label: string;
};

interface HashtagTabProps {
  difficulty: string;
  course: string[];
  dietary: string[];
  setDifficulty: React.Dispatch<React.SetStateAction<string>>;
  setCourse: React.Dispatch<React.SetStateAction<string[]>>;
  setDietary: React.Dispatch<React.SetStateAction<string[]>>;
  toggleCourse: (label: string, event: any) => void;
  selectDifficulty: (label: string, event: any) => void;
  toggleDietary: (label: string, event: any) => void;
}

const HashtagTab: React.FC<HashtagTabProps> = ({
  difficulty,
  course,
  dietary,
  setCourse,
  setDifficulty,
  setDietary,
  toggleCourse,
  selectDifficulty,
  toggleDietary,
}) => {

  const courses: ItemType[] = [
    { label: "Breakfast" },
    { label: "Lunch" },
    { label: "Dinner" },
    { label: "Dessert" },
    { label: "Appetizer" },
    { label: "Drink" },
    { label: "Snack" },
    { label: "Side" },
  ];

  const difficulties: ItemType[] = [
    { label: "Easy" },
    { label: "Medium" },
    { label: "Hard" },
  ];

  const dietaryRestrictions: ItemType[] = [
    { label: "Vegetarian" },
    { label: "Vegan" },
    { label: "Gluten-Free" },
    { label: "Dairy-Free" },
    { label: "Nut-Free" },
    { label: "Soy-Free" },
    { label: "Shellfish-Free" },
    { label: "Pescatarian" },
    { label: "Keto" },
    { label: "Paleo" },
    { label: "Whole30" },
  ];

  const renderPillGroup = (
    items: ItemType[],
    selectedItems: string[],
    onClick: (label: string, event: any) => void
  ) => {
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {items.map((item, index) => (
          <button
            key={index}
            className={`btn py-0.5 bordered border-gray-400 rounded-full hover:bg-red-500 hover:text-white transition duration-200 ${
              selectedItems.includes(item.label)
                ? "bg-red-500 text-white"
                : ""
            }`}
            onClick={(event) => onClick(item.label, event)}
          >
            {item.label}
          </button>
        ))}
      </div>
    );
  };

  const renderDifficultyGroup = (
    items: ItemType[],
    selectedItem: string,
    onClick: (label: string, event: any) => void
  ) => {
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {items.map((item, index) => (
          <button
            key={index}
            className={`btn py-0.5 bordered border-gray-400 rounded-full hover:bg-red-500 hover:text-white transition duration-200 ${
              selectedItem === item.label ? "bg-red-500 text-white" : ""
            }`}
            onClick={(event) => onClick(item.label, event)}
          >
            {item.label}
          </button>
        ))}
      </div>
    );
  };

  const renderDietaryGroup = (
    items: ItemType[],
    selectedItems: string[],
    onClick: (label: string, event: any) => void
  ) => {
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {items.map((item, index) => (
          <button
            key={index}
            className={`btn py-0.5 bordered border-gray-400 rounded-full hover:bg-red-500 hover:text-white transition duration-200 ${
              selectedItems.includes(item.label)
                ? "bg-red-500 text-white"
                : ""
            }`}
            onClick={(event) => onClick(item.label, event)}
          >
            {item.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        TAGS.
      </h1>
      <div className="w-full">
        <div className="mt-4">
          <h2 className="font-bold text-lg">COURSES.</h2>
          {renderPillGroup(courses, course, toggleCourse)}
        </div>

        <div className="mt-4">
          <h2 className="font-bold text-lg">DIFFICULTY.</h2>
          {renderDifficultyGroup(difficulties, difficulty, selectDifficulty)}
        </div>

        <div className="mt-4">
          <h2 className="font-bold text-lg">DIETARY RESTRICTIONS.</h2>
          {renderDietaryGroup(dietaryRestrictions, dietary, toggleDietary)}
        </div>
      </div>
    </>
  );
};

export default HashtagTab;
