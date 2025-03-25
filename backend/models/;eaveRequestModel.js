import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    leaveType: {
      type: String,
      enum: [
        "Sick",
        "Vacation",
        "Personal",
        "Emergency",
        "Maternity",
        "Paternity",
        "Other",
      ],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalDays: { type: Date, required: true },
    reason: { type: String, required: true },
    attachment: [String],
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Cancelled"],
      default: "Pending",
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewDate: { type: Date },
    reviewNotes: { type: String },
    emergencyContact: String,
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
  },
  { timestamps: true }
);

const LeaveRequest = mongoose.model("leaveRequest", leaveRequestSchema);

export default LeaveRequest;
