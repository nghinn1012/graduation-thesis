import { Schema, model} from "mongoose";
import { NotificationType } from "../data/interface/notification_interface";

const notiSchema = new Schema({
  userId: {
    type: [String],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: NotificationType,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  reads: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const NotificationModel = model("Notification", notiSchema);

export default NotificationModel;
