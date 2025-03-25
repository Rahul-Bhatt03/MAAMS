import { Router } from "express";
import {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  addMedicalHistory,
  addVisitRecord,
  assignNurse,
  deletePatient
} from "../controllers/patientController.js";
// import { verifyJWT, } from "../middlewares/auth.js";
import {protect} from '../middleware/authMiddleware.js'

const router = Router();

// Apply JWT verification to all routes
router.use(protect);

// Routes that all authenticated users can access
router.get("/", getAllPatients);
router.get("/:patientId", getPatientById);

// Routes that require admin or doctor role
router.post("/", createPatient);
router.patch("/:patientId", updatePatient);
router.post("/:patientId/medical-history", addMedicalHistory);
router.post("/:patientId/visits", addVisitRecord);
router.post("/:patientId/assign-nurse", assignNurse);

// Routes that only admin can access
router.delete("/:patientId", deletePatient);

export default router;