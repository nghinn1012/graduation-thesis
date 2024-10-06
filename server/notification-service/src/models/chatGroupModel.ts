import mongoose, { Schema, model } from "mongoose";

const chatGroupSchema = new Schema({
  groupName: {
    type: String,
    required: true,
  },
  members: [
    {
      type: String,
      required: true,
    },
  ],
  createdBy: {
    type: String,
    required: true,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const chatGroupModel = model("ChatGroup", chatGroupSchema);

export default chatGroupModel;
