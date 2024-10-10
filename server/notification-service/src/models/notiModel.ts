const mongoose = require('mongoose');
import { IAuthor } from '../broker/rpc_consumer';

const NotificationSchema = new mongoose.Schema({
  users: [{ type: String, required: true }],
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ["FOOD_LIKED"],
    required: true
  },
  link: { type: String },
  reads: [{ type: String }],
  postId: { type: String },
  author: {
    type: {
      _id: { type: String, required: true },
      username: { type: String },
      avatar: { type: String },
      name: { type: String, required: true }
    },
  } } , { timestamps: true });

const NotificationModel = mongoose.model('Notification', NotificationSchema);

export default NotificationModel;
