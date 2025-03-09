import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "General",
        "Emergency",
        "Specialty",
        "Surgery",
        "Diagnostic",
        "Preventive",
        "Mental Health",
        "Pediatric"
      ],
      required: true,
    },
    description: { type: String, required: true },
    image: { type: String, required: true },
    doctors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor", //reference to the doctor model
      },
    ],
    availability: [
      {
        day: { type: String, required: true }, // Day of the week (e.g., "Monday")
        startTime: { type: String, required: true }, // Start time (e.g., "09:00")
        endTime: { type: String, required: true }, // End time (e.g., "17:00")
      },
    ],
    pricing: { type: Number },
    insuranceAccepted: { type: Boolean, default: false },
    testimonials: [
      {
        patientName: String,
        review: String,
        rating: { type: Number, min: 1, max: 5 },
      },
    ],
    isActive: {
      type: Boolean,
      default: true, // Active by default
    },
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", ServiceSchema);
export default Service;
