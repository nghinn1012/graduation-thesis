import React, { useEffect, useState } from "react";
import { IoIosCamera } from "react-icons/io";
import {
  IoAddCircleOutline,
  IoTrashOutline,
  IoCloseSharp,
} from "react-icons/io5";
import * as Yup from "yup";

// Define validation schema
const validationSchema = Yup.object({
  timeToTake: Yup.string().required("Time to take is required"),
  servings: Yup.string().required("Servings are required"),
  inputFields: Yup.array()
    .of(
      Yup.object({
        name: Yup.string().required("Ingredient name is required"),
        quantity: Yup.string().required("Quantity is required"),
      })
    )
    .min(1, "At least one ingredient is required"),
  instructions: Yup.array()
    .of(
      Yup.object({
        description: Yup.string().required(
          "Instruction description is required"
        ),
        image: Yup.string().nullable(),
      })
    )
    .min(1, "At least one instruction is required"),
});

interface RecipeDetailsTabProps {
  timeToTake: string;
  servings: string;
  inputFields: { name: string; quantity: string }[];
  instructions: { description: string; image?: string }[];
  handleTimeToTake: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleServings: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleInputChange: (
    index: number,
    field: "name" | "quantity",
    value: string
  ) => void;
  handleRemoveInputField: (index: number) => void;
  handleAddInputField: () => void;
  handleInstructionChange: (
    index: number,
    field: "description" | "image",
    value: string
  ) => void;
  handleImageChange: (index: number, file: File | null) => void;
  addInstruction: () => void;
  isSubmitting: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleClickIcon: () => void;
  removeImageInstruction: (index: number) => void;
}

interface IngredientFieldError {
  [key: string]: string | undefined;
  name?: string;
  quantity?: string;
}

interface InstructionFieldError {
  [key: string]: string | undefined;
  description?: string;
  image?: string;
}

interface Errors {
  timeToTake?: string;
  servings?: string;
  inputFields?: IngredientFieldError[];
  instructions?: InstructionFieldError[];
  [key: string]:
    | string
    | undefined
    | IngredientFieldError[]
    | InstructionFieldError[]
    | undefined;
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
  fileInputRef,
  handleClickIcon,
  removeImageInstruction,
}) => {
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    const validate = async () => {
      try {
        await validationSchema.validate(
          { timeToTake, servings, inputFields, instructions },
          { abortEarly: false }
        );
        setErrors({});
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const validationErrors: Errors = {};
          console.log(err.inner);
          err.inner.forEach((error) => {
            if (error.path?.includes(".")) {
              const pathParts = error.path ? error.path.split(".") : [];
              const fieldName = pathParts[0].slice(0, -3);
              const index = +pathParts[0].slice(length - 2, length - 1);
              console.log(pathParts, fieldName, index);

              if (fieldName == "inputFields") {
                if (!validationErrors.inputFields) {
                  validationErrors.inputFields = [];
                }
                if (!validationErrors.inputFields[index]) {
                  validationErrors.inputFields[index] = {};
                }
                const subField = pathParts[1];
                console.log(subField);
                validationErrors.inputFields[index][subField] = error.message;
              } else if (fieldName == "instructions") {
                if (!validationErrors.instructions) {
                  validationErrors.instructions = [];
                }
                if (!validationErrors.instructions[index]) {
                  validationErrors.instructions[index] = {};
                }
                const subField = pathParts[1];
                console.log(subField);
                validationErrors.instructions[index][subField] = error.message;
              }
            } else {
              const pathParts = error.path?.split(".") ?? [];
              const fieldName = pathParts[0];
              validationErrors[fieldName] = error.message;
            }
          });
          console.log(validationErrors);
          setErrors(validationErrors);
        }
      }
    };

    validate();
  }, [timeToTake, servings, inputFields, instructions]);

  return (
    <div className="flex flex-col w-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">RECIPE DETAILS</h2>
      </div>
      <div className="flex flex-row justify-between mb-4">
        <div className="flex-1">
          <label className="block text-sm font-semibold mb-1">
            TIME TO TAKE
          </label>
          <input
            type="text"
            className="w-full input input-bordered"
            placeholder="Time to take"
            value={timeToTake || ""}
            onChange={handleTimeToTake}
            disabled={isSubmitting}
          />
          {errors.timeToTake && (
            <p className="text-red-500">{errors.timeToTake}</p>
          )}
        </div>
        <div className="flex-1 ml-4">
          <label className="block text-sm font-semibold mb-1">SERVINGS</label>
          <input
            type="text"
            className="w-full input input-bordered"
            placeholder="Servings"
            value={servings || ""}
            onChange={handleServings}
            disabled={isSubmitting}
          />
          {errors.servings && <p className="text-red-500">{errors.servings}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">INGREDIENTS</label>
        <div className="flex flex-col gap-2">
          {inputFields.map((inputField, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex flex-col gap-2">
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
                {errors.inputFields?.[index]?.name && (
                  <p className="text-red-500">
                    {errors.inputFields[index]?.name}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
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
                {errors.inputFields?.[index]?.quantity && (
                  <p className="text-red-500">
                    {errors.inputFields[index]?.quantity}
                  </p>
                )}
              </div>
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
        <label className="block text-sm font-semibold mb-1">INSTRUCTIONS</label>
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
            {errors.instructions?.[index]?.description && (
              <p className="text-red-500">
                {errors.instructions[index]?.description}
              </p>
            )}
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) =>
                handleImageChange(index, e.target.files?.[0] || null)
              }
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="mx-auto z-50 rounded-full w-10 h-10 flex flex-col items-center justify-center text-center leading-none"
              onClick={handleClickIcon}
              disabled={isSubmitting}
            >
              <IoIosCamera className="w-6 h-6 mx-auto" />
            </button>
            {instruction.image && (
              <div className="relative mt-2">
                <IoCloseSharp
                  className="absolute top-2 right-3 z-50 text-white bg-gray-300 rounded-full w-5 h-5 cursor-pointer"
                  onClick={() => removeImageInstruction(index)}
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
};

export default RecipeDetailsTab;
