import mongoose, { Schema, model } from "mongoose";

const HashtagSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
},
  { timestamps: true });

const HashtagModel = model("Hashtag", HashtagSchema);

export default HashtagModel;
