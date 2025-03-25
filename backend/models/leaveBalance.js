import mongoose from "mongoose";

const LeaveBalanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    sickLeaveTotal: {
      type: Number,
      default: 10,
    },
    sickLeaveUsed: {
      type: Number,
      default: 0,
    },
    vacationLeaveTotal: {
      type: Number,
      default: 20,
    },
    vacationLeaveUsed: {
      type: Number,
      default: 0,
    },
    personalLeaveTotal: {
      type: Number,
      default: 5,
    },
    personalLeaveUsed: {
      type: Number,
      default: 0,
    },
    emergencyLeaveTotal: {
      type: Number,
      default: 5,
    },
    emergencyLeaveUsed: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for remaining sick leave
LeaveBalanceSchema.virtual("sickLeaveRemaining").get(function () {
  return this.sickLeaveTotal - this.sickLeaveUsed;
});

// Virtual for remaining vacation leave
LeaveBalanceSchema.virtual("vacationLeaveRemaining").get(function () {
  return this.vacationLeaveTotal - this.vacationLeaveUsed;
});

// Virtual for remaining personal leave
LeaveBalanceSchema.virtual("personalLeaveRemaining").get(function () {
  return this.personalLeaveTotal - this.personalLeaveUsed;
});

// Virtual for remaining emergency leave
LeaveBalanceSchema.virtual("emergencyLeaveRemaining").get(function () {
  return this.emergencyLeaveTotal - this.emergencyLeaveUsed;
});

// Virtual for total leave remaining
LeaveBalanceSchema.virtual("totalLeaveRemaining").get(function () {
  return (
    this.sickLeaveRemaining +
    this.vacationLeaveRemaining +
    this.personalLeaveRemaining +
    this.emergencyLeaveRemaining
  );
});

const LeaveBalance = mongoose.model("LeaveBalance", LeaveBalanceSchema);
export default LeaveBalance;
