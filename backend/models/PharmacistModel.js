import mongoose from "mongoose";

const pharmacistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    licenseNumber: { type: String, required: true, unique: true },
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
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Soft delete method
pharmacistSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Restore method
pharmacistSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = null;
  return this.save();
};

// Query helper to exclude deleted items by default
pharmacistSchema.pre(/^find/, function(next) {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: false });
  }
  next();
});

pharmacistSchema.index({ name: 1, licenseNumber: 1 });

const Pharmacist = mongoose.model("Pharmacist", pharmacistSchema);

export default Pharmacist;