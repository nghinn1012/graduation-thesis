import { throwErrorIfInvalidFormat, throwErrorIfNotFound } from "../error_handler/error";
import { IInstruction, IPost, InternalError } from "../index";

export const validatePostFoodBody = (data: IPost) => {
  const {
    author,
    images,
    title,
    hashtags,
    timeToTake,
    servings,
    ingredients,
    instructions,
  } = data;

  throwErrorIfNotFound("author", author);
  throwErrorIfNotFound("images", images);
  throwErrorIfNotFound("title", title);
  throwErrorIfNotFound("hashtags", hashtags);
  throwErrorIfNotFound("timeToTake", timeToTake);
  throwErrorIfNotFound("servings", servings);
  ingredients.forEach((ingredient) => {
    throwErrorIfNotFound("ingredients", ingredient.name);
    throwErrorIfNotFound("ingredients", ingredient.quantity);
  });
  instructions.forEach((instruction) => {
    throwErrorIfNotFound("instructions", instruction.description);
  });
  return true;
};

export const autoAssignSteps = (instructions: IInstruction[]) => {
  if (Array.isArray(instructions)) {
    return instructions.map((instruction, index) => ({
      ...instruction,
      step: index + 1,
    }));
  }
  return instructions;
};
