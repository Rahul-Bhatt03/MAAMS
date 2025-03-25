import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    // Personal Information
    name: { type: String, required: true, trim: true, index: true },
    gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
    dateOfBirth: { type: Date, required: true },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    email: { type: String, unique: true, lowercase: true, sparse: true },
    phone: { type: String, required: true },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String, default: "Nepal" },
    },
    // Emergency Contact
    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      phone: { type: String },
    },
    //medical info
    medicalHistory: [
      {
        condition: { type: String, required: true },
        diagnisisDate: { type: Date },
        treatment: { type: String },
        notes: { type: String },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    allergies: [{ type: String }],
    currentMedications: [
      {
        name: { type: String },
        dosage: { type: String },
        frequency: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
      },
    ],
    // Hospital Stay Information
    admissionDate: { type: Date },
    dischargeDate: { type: Date },
    status: {
      type: String,
      enum: ["Admitted", "Discharged", "Outpatient", "Emergency"],
      default: "Outpatient",
    },
    roomNumber: { type: String },

    // Assigned Staff
    assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    assignedNurses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Nurse" }],
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    // Visits and Appointments
    visits: [
      {
        date: { type: Date, required: true },
        reason: { type: String },
        diagnosis: { type: String },
        prescription: { type: String },
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
        notes: { type: String },
      },
    ],
    upcomingAppointments: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    ],

    // Billing Information
    insuranceInfo: {
      provider: { type: String },
      policyNumber: { type: String },
      expiryDate: { type: Date },
    },
    // Other
    profilePic: { type: String }, // URL to profile picture
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// Indexing for faster searches
patientSchema.index({ name: 1 });
patientSchema.index({ "address.city": 1 });
patientSchema.index({ status: 1 });
patientSchema.index({ assignedDoctor: 1 });
patientSchema.index({ department: 1 });

// Middleware to exclude deleted records by default
patientSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
