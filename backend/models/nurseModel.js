import mongoose from "mongoose";

const nurseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    specialization: { type: String, required: true, trim: true },
    profilePic: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    experience: { type: Number, required: true, min: 0 },
    qualifications: [{ type: String }],
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    shift: { 
      type: String,
      enum: ['morning', 'afternoon', 'night', 'rotating'],
      default: 'morning'
    },
    // assignedWards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ward" }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

nurseSchema.index({ name: 1, specialization: 1 });

const Nurse = mongoose.model("Nurse", nurseSchema);

export default Nurse;