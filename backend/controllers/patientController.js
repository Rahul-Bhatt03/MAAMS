import Patient from "../models/patientModel.js";
import Doctor from "../models/doctorModel.js";
import Department from "../models/departmentModel.js";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Helper function to check if ObjectId is valid
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Get all patients with filtering options
const getAllPatients = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    name,
    status,
    doctorId,
    departmentId,
    sortBy,
    sortOrder = "desc",
  } = req.query;

  const filters = {};

  // Apply filters if provided
  if (name) filters.name = { $regex: name, $options: "i" };
  if (status) filters.status = status;
  if (doctorId && isValidObjectId(doctorId)) filters.assignedDoctor = doctorId;
  if (departmentId && isValidObjectId(departmentId))
    filters.department = departmentId;

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Set up sorting
  const sort = {};
  if (sortBy) {
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;
  } else {
    sort.createdAt = -1; // Default sort by createdAt desc
  }

  // Execute query
  const patients = await Patient.find(filters)
    .populate("assignedDoctor", "name specialization")
    .populate("department", "name")
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .select("-__v");

  // Get total count for pagination
  const totalPatients = await Patient.countDocuments(filters);

  // Return response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        patients,
        pagination: {
          total: totalPatients,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalPatients / parseInt(limit)),
        },
      },
      "Patients fetched successfully"
    )
  );
});

// Get patient by ID
const getPatientById = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  if (!isValidObjectId(patientId)) {
    throw new ApiError(400, "Invalid patient ID");
  }

  const patient = await Patient.findById(patientId)
    .populate("assignedDoctor", "name specialization profilePic")
    .populate("assignedNurses", "name profilePic")
    .populate("department", "name description")
    .populate("upcomingAppointments")
    .exec();

  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, patient, "Patient fetched successfully"));
});

// Create a new patient
const createPatient = asyncHandler(async (req, res) => {
  const {
    name,
    gender,
    dateOfBirth,
    bloodGroup,
    email,
    phone,
    address,
    emergencyContact,
    allergies,
    currentMedications,
    assignedDoctorId,
    departmentId,
    status,
    roomNumber,
    insuranceInfo,
  } = req.body;

  // Validate required fields
  if (!name || !gender || !dateOfBirth || !phone) {
    throw new ApiError(
      400,
      "Name, gender, date of birth, and phone are required"
    );
  }

  // Check if phone number is already registered
  const existingPatient = await Patient.findOne({ phone });
  if (existingPatient) {
    throw new ApiError(409, "A patient with this phone number already exists");
  }

  // Check if email is provided and unique
  if (email) {
    const emailExists = await Patient.findOne({ email });
    if (emailExists) {
      throw new ApiError(409, "A patient with this email already exists");
    }
  }

  // Validate doctor if provided
  if (assignedDoctorId) {
    if (!isValidObjectId(assignedDoctorId)) {
      throw new ApiError(400, "Invalid doctor ID");
    }

    const doctor = await Doctor.findById(assignedDoctorId);
    if (!doctor) {
      throw new ApiError(404, "Doctor not found");
    }
  }

  // Validate department if provided
  if (departmentId) {
    if (!isValidObjectId(departmentId)) {
      throw new ApiError(400, "Invalid department ID");
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      throw new ApiError(404, "Department not found");
    }
  }

  // Create patient object
  const patientData = {
    name,
    gender,
    dateOfBirth: new Date(dateOfBirth),
    bloodGroup,
    email,
    phone,
    address,
    emergencyContact,
    allergies: allergies || [],
    currentMedications: currentMedications || [],
    assignedDoctor: assignedDoctorId || null,
    department: departmentId || null,
    status: status || "Outpatient",
    roomNumber,
    insuranceInfo,
  };

  // Set admission date if patient is being admitted
  if (status === "Admitted") {
    patientData.admissionDate = new Date();
  }

  // Create new patient
  const patient = await Patient.create(patientData);

  // Update doctor's patients array if a doctor is assigned
  if (assignedDoctorId) {
    await Doctor.findByIdAndUpdate(assignedDoctorId, {
      $addToSet: { patients: patient._id },
    });
  }

  // Return new patient
  const newPatient = await Patient.findById(patient._id)
    .populate("assignedDoctor", "name specialization")
    .populate("department", "name");

  return res
    .status(201)
    .json(new ApiResponse(201, newPatient, "Patient created successfully"));
});

// Update patient
const updatePatient = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const updates = req.body;

  if (!isValidObjectId(patientId)) {
    throw new ApiError(400, "Invalid patient ID");
  }

  // Find existing patient
  const existingPatient = await Patient.findById(patientId);
  if (!existingPatient) {
    throw new ApiError(404, "Patient not found");
  }

  // If doctor is being updated
  if (updates.assignedDoctorId !== undefined) {
    // If a doctor is being assigned
    if (updates.assignedDoctorId) {
      if (!isValidObjectId(updates.assignedDoctorId)) {
        throw new ApiError(400, "Invalid doctor ID");
      }

      const doctor = await Doctor.findById(updates.assignedDoctorId);
      if (!doctor) {
        throw new ApiError(404, "Doctor not found");
      }

      // Add patient to new doctor's list
      await Doctor.findByIdAndUpdate(updates.assignedDoctorId, {
        $addToSet: { patients: patientId },
      });

      // Remove patient from old doctor's list if there was one
      if (
        existingPatient.assignedDoctor &&
        existingPatient.assignedDoctor.toString() !== updates.assignedDoctorId
      ) {
        await Doctor.findByIdAndUpdate(existingPatient.assignedDoctor, {
          $pull: { patients: patientId },
        });
      }

      // Update the assignedDoctor field
      updates.assignedDoctor = updates.assignedDoctorId;
    } else {
      // If doctor assignment is being removed
      if (existingPatient.assignedDoctor) {
        await Doctor.findByIdAndUpdate(existingPatient.assignedDoctor, {
          $pull: { patients: patientId },
        });
      }
      updates.assignedDoctor = null;
    }

    // Remove the temporary field
    delete updates.assignedDoctorId;
  }

  // If department is being updated
  if (updates.departmentId !== undefined) {
    if (updates.departmentId) {
      if (!isValidObjectId(updates.departmentId)) {
        throw new ApiError(400, "Invalid department ID");
      }

      const department = await Department.findById(updates.departmentId);
      if (!department) {
        throw new ApiError(404, "Department not found");
      }

      updates.department = updates.departmentId;
    } else {
      updates.department = null;
    }

    delete updates.departmentId;
  }

  // Handle status changes
  if (updates.status) {
    // If patient is being admitted
    if (
      updates.status === "Admitted" &&
      existingPatient.status !== "Admitted"
    ) {
      updates.admissionDate = new Date();
      updates.dischargeDate = null;
    }

    // If patient is being discharged
    if (
      updates.status === "Discharged" &&
      existingPatient.status !== "Discharged"
    ) {
      updates.dischargeDate = new Date();
    }
  }

  // Update patient record
  const updatedPatient = await Patient.findByIdAndUpdate(
    patientId,
    { $set: updates },
    { new: true }
  )
    .populate("assignedDoctor", "name specialization")
    .populate("department", "name");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPatient, "Patient updated successfully"));
});

// Add medical history entry
const addMedicalHistory = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { condition, diagnosisDate, treatment, notes } = req.body;
  const userId = req.user._id; // Assuming you have authentication middleware

  if (!isValidObjectId(patientId)) {
    throw new ApiError(400, "Invalid patient ID");
  }

  if (!condition) {
    throw new ApiError(400, "Condition is required");
  }

  const historyEntry = {
    condition,
    diagnosisDate: diagnosisDate ? new Date(diagnosisDate) : new Date(),
    treatment,
    notes,
    addedBy: userId,
    createdAt: new Date(),
  };

  const patient = await Patient.findByIdAndUpdate(
    patientId,
    { $push: { medicalHistory: historyEntry } },
    { new: true }
  );

  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, patient, "Medical history added successfully"));
});

// Add visit record
const addVisitRecord = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { reason, diagnosis, prescription, doctorId, notes } = req.body;

  if (!isValidObjectId(patientId)) {
    throw new ApiError(400, "Invalid patient ID");
  }

  if (!reason || !doctorId) {
    throw new ApiError(400, "Reason and doctor ID are required");
  }

  if (!isValidObjectId(doctorId)) {
    throw new ApiError(400, "Invalid doctor ID");
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  const visitRecord = {
    date: new Date(),
    reason,
    diagnosis,
    prescription,
    doctor: doctorId,
    notes,
  };

  const patient = await Patient.findByIdAndUpdate(
    patientId,
    { $push: { visits: visitRecord } },
    { new: true }
  ).populate({
    path: "visits.doctor",
    select: "name specialization",
  });

  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, patient, "Visit record added successfully"));
});

// Assign nurse to patient
const assignNurse = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { nurseId } = req.body;

  if (!isValidObjectId(patientId) || !isValidObjectId(nurseId)) {
    throw new ApiError(400, "Invalid patient ID or nurse ID");
  }

  // Verify nurse exists (assuming you have a Nurse model)
  const nurseExists = await mongoose.model("Nurse").findById(nurseId);
  if (!nurseExists) {
    throw new ApiError(404, "Nurse not found");
  }

  const patient = await Patient.findByIdAndUpdate(
    patientId,
    { $addToSet: { assignedNurses: nurseId } },
    { new: true }
  ).populate("assignedNurses", "name");

  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, patient, "Nurse assigned successfully"));
});

// Soft delete patient
const deletePatient = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  if (!isValidObjectId(patientId)) {
    throw new ApiError(400, "Invalid patient ID");
  }

  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new ApiError(404, "Patient not found");
  }

  // Update patient with deletion info
  patient.isDeleted = true;
  patient.deletedAt = new Date();
  patient.isActive = false;

  await patient.save();

  // Remove patient from assigned doctor's list
  if (patient.assignedDoctor) {
    await Doctor.findByIdAndUpdate(patient.assignedDoctor, {
      $pull: { patients: patientId },
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Patient deleted successfully"));
});

export {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  addMedicalHistory,
  addVisitRecord,
  assignNurse,
  deletePatient,
};
