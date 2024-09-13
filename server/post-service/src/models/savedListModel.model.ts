import mongoose, { model, Schema } from "mongoose";

const savedListSchema = new Schema({
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

const savedListModel = model("SaveList", savedListSchema);
export default savedListModel;
