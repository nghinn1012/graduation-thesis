import React from 'react';
import { IoAddCircleOutline, IoTrashOutline, IoCloseSharp } from 'react-icons/io5';

interface RecipeDetailsTabProps {
  timeToTake: number;
  servings: number;
  inputFields: { name: string; quantity: string }[];
  instructions: { description: string; image?: string }[];
  handleTimeToTake: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleServings: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleInputChange: (index: number, field: "name" | "quantity", value: string) => void;
  handleRemoveInputField: (index: number) => void;
  handleAddInputField: () => void;
  handleInstructionChange: (index: number, field: "description" | "image", value: string) => void;
  handleImageChange: (index: number, file: File | null) => void;
  addInstruction: () => void;
  isSubmitting: boolean;
}

const RecipeDetailsTab: React.FC<RecipeDetailsTabProps> = ({
  timeToTake,
  servings,
  inputFields,
  instructions,
  handleTimeToTake,
  handleServings,
  handleInputChange,
  handleRemoveInputField,
  handleAddInputField,
  handleInstructionChange,
  handleImageChange,
  addInstruction,
  isSubmitting,
}) => (
  <div className="flex flex-col w-full">
    <div className="mb-4">
      <h2 className="text-2xl font-bold">RECIPE DETAILS.</h2>
    </div>
    <div className="flex flex-row justify-between mb-4">
      <div className="flex-1">
        <label className="block text-sm font-semibold mb-1">TIME.</label>
        <input
          type="text"
          className="w-full input input-bordered"
          placeholder="Time to take"
          value={timeToTake || ""}
          onChange={handleTimeToTake}
          disabled={isSubmitting}
        />
      </div>
      <div className="flex-1 ml-4">
        <label className="block text-sm font-semibold mb-1">SERVINGS.</label>
        <input
          type="text"
          className="w-full input input-bordered"
          placeholder="Servings"
          value={servings || ""}
          onChange={handleServings}
          disabled={isSubmitting}
        />
      </div>
    </div>
    <div>
      <label className="block text-sm font-semibold mb-1">INGREDIENTS.</label>
      <div className="flex flex-col gap-2">
        {inputFields.map((inputField, index) => (
          <div key={index} className="flex gap-4">
            <input
              type="text"
              className="w-full input input-bordered"
              placeholder="Ingredient"
              value={inputField.name}
              onChange={(e) =>
                handleInputChange(index, "name", e.target.value)
              }
              disabled={isSubmitting}
            />
            <input
              type="text"
              className="w-full input input-bordered"
              placeholder="Quantity"
              value={inputField.quantity}
              onChange={(e) =>
                handleInputChange(index, "quantity", e.target.value)
              }
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="text-red-500"
              onClick={() => handleRemoveInputField(index)}
              disabled={isSubmitting}
            >
              <IoTrashOutline />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-outline w-full"
          onClick={handleAddInputField}
          disabled={isSubmitting}
        >
          <IoAddCircleOutline className="mr-2" />
          Add Ingredient
        </button>
      </div>
    </div>
    <div className="mt-4">
      <label className="block text-sm font-semibold mb-1">INSTRUCTIONS.</label>
      {instructions.map((instruction, index) => (
        <div key={index} className="mb-4">
          <textarea
            className="textarea textarea-bordered w-full mb-2"
            placeholder={`Step ${index + 1}`}
            value={instruction.description}
            onChange={(e) =>
              handleInstructionChange(index, "description", e.target.value)
            }
            disabled={isSubmitting}
          />
          <input
            type="file"
            className="file-input file-input-bordered w-full mb-2"
            onChange={(e) =>
              handleImageChange(index, e.target.files?.[0] || null)
            }
            disabled={isSubmitting}
          />
          {instruction.image && (
            <div className="relative">
              <IoCloseSharp
                className="absolute top-2 right-3 z-50 text-white bg-gray-300 rounded-full w-5 h-5 cursor-pointer"
                onClick={() => handleImageChange(index, null)}
              />
              <img
                src={instruction.image}
                alt={`Instruction ${index + 1}`}
                className="object-cover rounded-md"
                style={{ width: "100%", maxHeight: "200px" }}
              />
            </div>
          )}
        </div>
      ))}
      <button
        type="button"
        className="btn btn-outline w-full"
        onClick={addInstruction}
        disabled={isSubmitting}
      >
        <IoAddCircleOutline className="mr-2" />
        Add Instruction
      </button>
    </div>
  </div>
);

export default RecipeDetailsTab;
