import mongoose, { model } from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  chatGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatGroup',
    required: true,
  },
  text: {
    type: String,
    default: null,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  emoji: {
    type: String,
    default: null,
  },
  productLink: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  readBy: [{
    type: String,
  }],
  isReadByAll: {
    type: Boolean,
    default: false
  },
  unreadCount: {
    type: Number,
    default: 0
  },
});

const MessageModel = model("Message", messageSchema);

export default MessageModel;
