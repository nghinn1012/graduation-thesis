import React, { useEffect, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import * as Yup from "yup";
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
  hashtags: string[];
  newHashtag: string;
  setHashtags: React.Dispatch<React.SetStateAction<string[]>>;
  setNewHashtag: React.Dispatch<React.SetStateAction<string>>;
  addHashtag: () => void;
  removeHashtag: (index: number) => void;
  isSubmitting: boolean;
  setIsHashtagTabValid: React.Dispatch<React.SetStateAction<boolean>>;
}

const validationSchema = Yup.object().shape({
  newHashtag: Yup.string()
    .test(
      "is-valid-hashtag",
      "Hashtags must contain only letters and numbers",
      (value) => !value || /^[a-zA-Z0-9]*$/.test(value)
    )
    .nullable(),
  difficulty: Yup.string().required("Difficulty is required"),
  course: Yup.array().min(1, "At least one course is required"),
  dietary: Yup.array().min(1, "At least one dietary restriction is required"),
});

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
  hashtags,
  newHashtag,
  setHashtags,
  setNewHashtag,
  addHashtag,
  removeHashtag,
  isSubmitting,
  setIsHashtagTabValid
}) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const courses: ItemType[] = [
    { label: "breakfast" },
    { label: "lunch" },
    { label: "dinner" },
    { label: "dessert" },
    { label: "snack" },
    { label: "appetizer" },
    { label: "drink" },
    { label: "side" },
  ];

  const difficulties: ItemType[] = [
    { label: "easy" },
    { label: "medium" },
    { label: "hard" },
  ];

  const dietaryRestrictions: ItemType[] = [
    { label: "vegetarian" },
    { label: "vegan" },
    { label: "gluten-free" },
    { label: "dairy-free" },
    { label: "nut-free" },
    { label: "soy-free" },
    { label: "fish-free" },
    { label: "shellfish-free" },
    { label: "pork-free" },
    { label: "kosher" },
    { label: "halal" },
    { label: "whole30" },
  ];

  useEffect(() => {
    const validate = async () => {
      try {
        await validationSchema.validate(
          { newHashtag, difficulty, course, dietary },
          { abortEarly: false }
        );
        setErrors({});
        setIsHashtagTabValid(true);
      } catch (err) {
        const validationErrors: { [key: string]: string } = {};
        if (err instanceof Yup.ValidationError) {
          err.inner.forEach((error) => {
            if (error.path) {
              validationErrors[error.path] = error.message;
            }
          });
          setErrors(validationErrors);
        }
      }
    };
    validate();
  }, [newHashtag, difficulty, course, dietary]);

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
              selectedItems.includes(item.label) ? "bg-red-500 text-white" : ""
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
              selectedItems.includes(item.label) ? "bg-red-500 text-white" : ""
            }`}
            onClick={(event) => onClick(item.label, event)}
          >
            {item.label}
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        TAGS.
      </h1>
      <div className="w-full">
        <div className="mt-2">
          <h2 className="font-bold text-lg">COURSES.</h2>
          {renderPillGroup(courses, course, toggleCourse)}
        </div>

        <div className="mt-2">
          <h2 className="font-bold text-lg">DIFFICULTY.</h2>
          {renderDifficultyGroup(difficulties, difficulty, selectDifficulty)}
        </div>

        <div className="mt-2">
          <h2 className="font-bold text-lg">DIETARY RESTRICTIONS.</h2>
          {renderDietaryGroup(dietaryRestrictions, dietary, toggleDietary)}
        </div>
        <div className="mt-4">
          <label className="block mb-2 text-sm">Hashtags</label>
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Enter a hashtag"
              value={newHashtag}
              onChange={(e) => setNewHashtag(e.target.value)}
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="btn btn-neutral"
              onClick={addHashtag}
              disabled={isSubmitting}
            >
              Add
            </button>
          </div>
          {errors.newHashtag && (
            <p className="text-red-500">{errors.newHashtag}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {hashtags.map((hashtag, index) => (
              <div
                key={index}
                className="badge badge-lg badge-default badge-outline py-4 px-2 font-bold"
              >
                {hashtag}
                <IoCloseSharp
                  className="ml-1 cursor-pointer"
                  onClick={() => removeHashtag(index)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default HashtagTab;
