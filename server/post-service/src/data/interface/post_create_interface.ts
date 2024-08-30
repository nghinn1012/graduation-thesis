export interface IPost {
  _id: string;
  author: string;
  images: string[];
  title: string;
  hashtags: string[];
  timeToTake: number;
  servings: number;
  ingredients: IIngredient[];
  instructions: IInstruction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IIngredient {
  name: string;
  quantity: string;
}

export interface IInstruction {
  step: number;
  description: string;
}
