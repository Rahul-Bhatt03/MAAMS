import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String },  // For direct calendar marking
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // role: { type: String, enum: ["admin", "superadmin", "groupadmin", "user"], required: true },
    isDeleted: { type: Boolean, default: false },  // Soft delete flag
}, { timestamps: true });

const Event = mongoose.model("Event", eventSchema);
export default Event;