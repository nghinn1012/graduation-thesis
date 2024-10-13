const mongoose = require('mongoose');
import { IAuthor } from '../broker/rpc_consumer';

const NotificationSchema = new mongoose.Schema({
  users: [{ type: String, required: true }],
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ["FOOD_LIKED", "NEW_FOOD", "FOOD_COMMENTED",
      "FOOD_SAVED", "FOOD_MADE", "NEW_FOLLOWER"],
    required: true
  },
  link: { type: String },
  reads: [{ type: String }],
  post: {
    type: {
      _id: { type: String, required: true },
      title: { type: String, required: true },
    },
  },
  author: {
    type: String,
    required: true,
  }
}, { timestamps: true });

const NotificationModel = mongoose.model('Notification', NotificationSchema);

export default NotificationModel;
