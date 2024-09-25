import mongoose, { model, Schema } from "mongoose";

const MealPlannedDate = new Schema({
  date: {
    type: String,
  },
  mealTime: {
    type: Boolean,
  },
});
const MealSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  timeToTake: {
    type: String,
    required: true,
  },
  is_planned: {
    type: Boolean,
    default: false,
  },
  plannedDate: {
    type: [MealPlannedDate],
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
    index: true,
  },
});

const MealPlannerSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  meals: [MealSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const MealPlanner = model("MealPlanner", MealPlannerSchema);
export default MealPlanner;
