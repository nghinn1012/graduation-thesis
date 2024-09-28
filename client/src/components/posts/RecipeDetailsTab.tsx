import React, { ChangeEvent, useEffect, useState } from "react";
import { IoIosCamera } from "react-icons/io";
import {
  IoAddCircleOutline,
  IoTrashOutline,
  IoCloseSharp,
} from "react-icons/io5";
import * as Yup from "yup";
import QuickPasteModal from "./QuickPasteModal";
import { BiSolidMagicWand } from "react-icons/bi";
import { useToastContext } from "../../hooks/useToastContext";

const validationSchema = Yup.object({
  hours: Yup.string().required("Hours are required"),
  minutes: Yup.string().required("Minutes are required"),
  timeToTake: Yup.string().required("Time to take is required"),
  servings: Yup.number()
    .typeError("Servings must be a number")
    .required("Servings are required")
    .positive("Servings must be a positive number")
    .integer("Servings must be an integer"),
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
  servings: number | string;
  inputFields: { name: string; quantity: string }[];
  setInputFields: React.Dispatch<
    React.SetStateAction<{ name: string; quantity: string }[]>
  >;
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
  setIngredients: React.Dispatch<
    React.SetStateAction<{ name: string; quantity: string }[]>
  >;
  setInstructions: React.Dispatch<
    React.SetStateAction<{ description: string; image?: string }[]>
  >;
  handleInstructionChange: (
    index: number,
    field: "description" | "image",
    value: string
  ) => void;
  handleImageChange: (index: number, file: File | null) => void;
  addInstruction: () => void;
  isSubmitting: boolean;
  fileInputRef: React.MutableRefObject<(HTMLInputElement | null)[]>;
  handleClickIcon: (index: number) => void;
  removeImageInstruction: (index: number) => void;
  removeInstruction: (index: number) => void;
  setIsRecipeTabValid: React.Dispatch<React.SetStateAction<boolean>>;
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
  hours?: string;
  minutes?: string;
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
  setInputFields,
  instructions,
  handleTimeToTake,
  handleServings,
  handleInputChange,
  handleRemoveInputField,
  handleAddInputField,
  setIngredients,
  setInstructions,
  handleInstructionChange,
  handleImageChange,
  addInstruction,
  isSubmitting,
  fileInputRef,
  handleClickIcon,
  removeImageInstruction,
  removeInstruction,
  setIsRecipeTabValid,
}) => {
  const [errors, setErrors] = useState<Errors>({});
  const [hours, setHours] = useState<string>("0");
  const [minutes, setMinutes] = useState<string>("0");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [modalInput, setModalInput] = useState("");
  const [instructionInput, setInstructionInput] = useState("");
  const { error } = useToastContext();
  const parseIngredients = (input: string) => {
    const lines = input
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const ingredients = lines.flatMap((line) => {
      const firstDigitIndex = line.search(/\d/);

      if (firstDigitIndex !== -1) {
        const name = line.slice(0, firstDigitIndex).trim();
        const quantity = line.slice(firstDigitIndex).trim();
        if (name && quantity) {
          return { name, quantity };
        }
      }

      return [];
    });

    return ingredients;
  };

  const parseInstructions = (input: string) => {
    const lines = input
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return lines.map((line) => ({ description: line }));
  };

  const handleModalSubmit = (event: any) => {
    event.preventDefault();
    const ingredients = parseIngredients(modalInput);
    const instructionsModal = parseInstructions(instructionInput);
    if (ingredients.length == 0 && instructionsModal.length == 0) {
      error(
        "Please enter ingredients and/or instructions in the correct format."
      );
      setModalInput("");
      setInstructionInput("");
      setIsModalOpen(false);
      return;
    }
    console.log(instructions);
    const newInputFields =
      inputFields[0].name === "" && inputFields[0].quantity === ""
        ? []
        : [...inputFields];
    const newInstructions =
      instructions[0].description === "" ? [] : [...instructions];
    ingredients.forEach((ingredient) => {
      newInputFields.push({
        name: ingredient.name,
        quantity: ingredient.quantity,
      });
      handleAddInputField();
      handleInputChange(newInputFields.length - 1, "name", ingredient.name);
      handleInputChange(
        newInputFields.length - 1,
        "quantity",
        ingredient.quantity
      );
    });

    instructionsModal.forEach((instruction) => {
      newInstructions.push({
        description: instruction.description,
      });
      addInstruction();
      handleInstructionChange(
        newInstructions.length - 1,
        "description",
        instruction.description
      );
    });
    setInputFields(newInputFields);
    setIngredients(newInputFields);
    setInstructions(newInstructions);
    setModalInput("");
    setInstructionInput("");
    setIsModalOpen(false);
  };

  const handleCloseQuickPasteModal = (e: any) => {
    e.preventDefault();
    setModalInput("");
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (timeToTake) {
      const timeParts = timeToTake.split(" ");
      const hours = timeParts[0].slice(0, -1);
      const minutes = timeParts[1].slice(0, -1);
      setHours(hours);
      setMinutes(minutes);
    }
  }, []);

  useEffect(() => {
    const formattedTime = `${hours}h ${minutes}m`;
    handleTimeToTake({
      target: { value: formattedTime },
    } as unknown as ChangeEvent<HTMLInputElement>);
  }, [hours, minutes, handleTimeToTake]);

  useEffect(() => {
    const validate = async () => {
      try {
        await validationSchema.validate(
          { timeToTake, servings, inputFields, instructions, hours, minutes },
          { abortEarly: false }
        );
        setErrors({});
        setIsRecipeTabValid(true);
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const validationErrors: Errors = {};
          console.log(err.inner);
          err.inner.forEach((error) => {
            if (error.path?.includes(".")) {
              const pathParts = error.path ? error.path.split(".") : [];
              const fieldName = pathParts[0].slice(0, -3);
              const index = +pathParts[0].slice(length - 2, length - 1);

              if (fieldName == "inputFields") {
                if (!validationErrors.inputFields) {
                  validationErrors.inputFields = [];
                }
                if (!validationErrors.inputFields[index]) {
                  validationErrors.inputFields[index] = {};
                }
                const subField = pathParts[1];
                validationErrors.inputFields[index][subField] = error.message;
              } else if (fieldName == "instructions") {
                if (!validationErrors.instructions) {
                  validationErrors.instructions = [];
                }
                if (!validationErrors.instructions[index]) {
                  validationErrors.instructions[index] = {};
                }
                const subField = pathParts[1];
                validationErrors.instructions[index][subField] = error.message;
              }
            } else {
              const pathParts = error.path?.split(".") ?? [];
              const fieldName = pathParts[0];
              validationErrors[fieldName] = error.message;
            }
          });
          setErrors(validationErrors);
        }
      }
    };

    validate();
  }, [timeToTake, servings, inputFields, instructions, hours, minutes]);

  return (
    <div className="flex flex-col w-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">RECIPE DETAILS</h2>
      </div>
      <div className="flex flex-row justify-between mb-4">
        <div className="flex flex-1 flex-row">
          <div className="flex-1 mr-4">
            <label className="block text-sm font-semibold mb-1">HOURS</label>
            <input
              type="number"
              min="0"
              className="w-full input input-bordered"
              placeholder="Hours"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.hours && <p className="text-red-500">{errors.hours}</p>}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-1">MINUTES</label>
            <input
              type="number"
              min="0"
              max="59"
              className="w-full input input-bordered"
              placeholder="Minutes"
              value={minutes}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= 0 && value <= 59) {
                  setMinutes(value.toString());
                } else if (value > 59) {
                  setMinutes("59");
                } else {
                  setMinutes("0");
                }
              }}
              disabled={isSubmitting}
            />
            {errors.minutes && <p className="text-red-500">{errors.minutes}</p>}
          </div>
        </div>

        {errors.timeToTake && (
          <p className="text-red-500">{errors.timeToTake}</p>
        )}
        <div className="flex-1 ml-4">
          <label className="block text-sm font-semibold mb-1">SERVINGS</label>
          <input
            type="number"
            className="w-full input input-bordered"
            placeholder="Servings"
            value={servings}
            onChange={handleServings}
            disabled={isSubmitting}
          />
          {errors.servings && <p className="text-red-500">{errors.servings}</p>}
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-semibold">INGREDIENTS</label>
          <span
            className="cursor-pointer text-red-500 text-sm flex items-center"
            onClick={() => setIsModalOpen(true)}
          >
            <BiSolidMagicWand className="mr-1" />
            Quick Paste
          </span>
        </div>

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
              {inputFields.length > 1 && (
                <button
                  type="button"
                  className="text-red-500"
                  onClick={() => handleRemoveInputField(index)}
                  disabled={isSubmitting}
                >
                  <IoTrashOutline />
                </button>
              )}
            </div>
          ))}
          <QuickPasteModal
            isModalOpen={isModalOpen}
            closeModal={handleCloseQuickPasteModal}
            modalInput={modalInput}
            setModalInput={setModalInput}
            instructionInput={instructionInput}
            setInstructionInput={setInstructionInput}
            handleModalSubmit={handleModalSubmit}
          />
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
            <div className="flex flex-row gap-2">
              <textarea
                className="textarea textarea-bordered w-full mb-2"
                placeholder={`Step ${index + 1}`}
                value={instruction.description}
                onChange={(e) =>
                  handleInstructionChange(index, "description", e.target.value)
                }
                disabled={isSubmitting}
              />
              {instructions.length > 1 && (
                <button
                  type="button"
                  className="text-red-500"
                  onClick={() => removeInstruction(index)}
                  disabled={isSubmitting}
                >
                  <IoTrashOutline />
                </button>
              )}
            </div>
            {errors.instructions?.[index]?.description && (
              <p className="text-red-500">
                {errors.instructions[index]?.description}
              </p>
            )}
            <input
              type="file"
              className="hidden"
              ref={(el) => (fileInputRef.current[index] = el)}
              onChange={(e) =>
                handleImageChange(index, e.target.files?.[0] || null)
              }
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="mx-auto z-50 rounded-full w-10 h-10 flex flex-col items-center justify-center text-center leading-none"
              onClick={() => handleClickIcon(index)}
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
