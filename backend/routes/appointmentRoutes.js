import express from 'express';
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  getAppointmentsByDepartment,
  getAppointmentsByDoctor
} from '../controllers/appointmentController.js';

import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all appointments
router.get('/', protect, getAppointments);

// GET appointment by ID
router.get('/:id', protect, getAppointmentById);

// POST create new appointment
router.post('/', createAppointment); //protect hatayeko xuu just for test

// Only admin/staff routes below
router.use(protect);

// PUT update appointment details
router.put('/:id', updateAppointment);

// PATCH update appointment status
router.patch('/:id/status', updateAppointmentStatus);

// DELETE appointment (soft delete)
router.delete('/:id', deleteAppointment);

// GET appointments by department
router.get('/department/:departmentId', getAppointmentsByDepartment);

// GET appointments by doctor
router.get('/doctor/:doctorId', getAppointmentsByDoctor);

export default router;
