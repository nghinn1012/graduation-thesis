export interface Meal {
  timeToTake?: string;
  title?: string;
  imageUrl?: string;
  is_planned?: boolean;
  plannedDate?: MealPlannedDate[];
  postId: string;
}

export interface MealPlannedDate {
  date: {
    type: String,
  },
  mealTime: {
    type: Boolean,
  },
}
