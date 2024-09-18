import mongoose, { model, Schema } from "mongoose";

const shoppingListSchema = new Schema({
  userId: {
    type: String,
    require: true
  },
  postIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      require: true,
      default: [],
    }
  ],
})

const savedListModel = model("SaveList", shoppingListSchema);
export default savedListModel;
