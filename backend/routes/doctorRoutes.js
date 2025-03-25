import express from 'express';
import {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorsByDepartment,
  updateAvailability
} from '../controllers/doctorController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Main CRUD routes
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.post('/', upload.single('profilePic'), createDoctor);
router.put('/:id', upload.single('profilePic'), updateDoctor);
router.delete('/:id', deleteDoctor);

// // Patient management routes
// router.post('/:id/patients', addPatientToDoctor);
// router.delete('/:id/patients', removePatientFromDoctor);

// Department-specific routes
router.get('/department/:departmentId', getDoctorsByDepartment);

// Availability management
router.put('/:id/availability', updateAvailability);

export default router;