import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    enum: [
      "leave_request",
      "leave_approved",
      "leave_rejected",
      "system",
      "other",
    ],
    default: "system",
  },
  relatedDocument: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "onModel",
  },
  onModel: {
    type: String,
    enum: ["LeaveRequest", "User"],
  },
  isActionable: {
    type: Boolean,
    default: false,
  },
  actionUrl: String,
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
