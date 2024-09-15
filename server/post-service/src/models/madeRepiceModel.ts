import mongoose, { model, Schema } from "mongoose";

const MadeRecipeSchema = new Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true,
        index: true,
    },
    image: {
        type: String,
        required: true,
    },
    review: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const MadeRecipeModel = model("MadeRecipe", MadeRecipeSchema);
export default MadeRecipeModel;
