export interface Meal {
  timeToTake?: string;
  title?: string;
  imageUrl?: string;
  is_planned?: boolean;
  plannedDate?: Date[];
  postId: string;
}
