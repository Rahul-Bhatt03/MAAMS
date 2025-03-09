import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    specialization: { type: String, required: true, trim: true },
    profilePic: { type: String, default: null }, // Store URL of the image
    isActive: { type: Boolean, default: true },
    experience: { type: Number, required: true, min: 0 }, // Years of experience
    qualifications: [{ type: String }], // List of degrees/certifications
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" }, // Reference to department
    // hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" }, // Reference to hospital
    patients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Patient" }], // Array of patient references
    availableSlots: [
      {
        day: { type: String, required: true }, // Example: "Monday"
        time: { type: String, required: true }, // Example: "10:00 AM - 2:00 PM"
      },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

doctorSchema.index({ name: 1, specialization: 1 }); // Indexing for faster searches

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
