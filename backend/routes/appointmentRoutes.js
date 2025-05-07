import express from 'express';
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  getAppointmentsByDepartment,
  getDoctorAppointments,
  getUserAppointments,
  getAvailableTimeSlots
} from '../controllers/appointmentController.js';
import { protect} from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all appointments (admin only)
router.get('/', getAppointments);

// Get appointments for current user
router.get('/my-appointments', getUserAppointments);

// Get appointments for specific doctor
router.get('/doctor/:doctorId', getDoctorAppointments);

// Get appointments by department
router.get('/department/:departmentId', getAppointmentsByDepartment);

// Get available time slots for a doctor
router.get('/availability/:doctorId', getAvailableTimeSlots);

// Get single appointment
router.get('/:id', getAppointmentById);

// Create new appointment
router.post('/', createAppointment);

// Update appointment
router.put('/:id', updateAppointment);

// Update appointment status
router.patch('/:id/status',  updateAppointmentStatus);

// Delete appointment
router.delete('/:id', deleteAppointment);

export default router;