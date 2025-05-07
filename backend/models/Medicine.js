import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true }, //index true is for fater search
  genericName: { type: String, index: true },
  description: { type: String },
  dosage: String,
  form: {
    type: String,
    enum: [
      "tablet",
      "capsule",
      "syrup",
      "injection",
      "cream",
      "ointment",
      "drops",
      "inhaler",
      "other",
    ],
    required: true,
  },
  manufacturer: String,
  price: { type: Number, required: true },
  requiresPrescription: { type: Boolean, required: true },
  stock: { type: Number, required: true, min: 0 },
  imagePublicId: String, // For Cloudinary image management
  category: {
    type: String,
    enum: [
      "antibiotics",
      "painkillers",
      "vitamins",
      "cardiovascular",
      "diabetes",
      "respiratory",
      "gastrointestinal",
      "dermatology",
      "other",
    ],
    index: true,
  },
  expiryDate: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});

//text search index for medicine search functionality
medicineSchema.index({
  name: "text",
  genericName: "text",
  description: "text",
});

//pre-save middleware to update the updatedAt field
medicineSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Medicine = mongoose.model("Medicine", medicineSchema);
export default Medicine;
