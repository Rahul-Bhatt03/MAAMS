import express from 'express';
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  addDoctorToDepartment,
  removeDoctorFromDepartment
} from '../controllers/departmentController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all departments
router.get('/', getAllDepartments);

// GET department by ID
router.get('/:id', getDepartmentById);

// Routes that require authentication
router.use(protect);

// POST create new department
router.post('/', createDepartment);

// PUT update department
router.put('/:id', updateDepartment);

// DELETE department (soft delete)
router.delete('/:id', deleteDepartment);

// POST add doctor to department
router.post('/:id/doctors', addDoctorToDepartment);

// DELETE remove doctor from department
router.delete('/:id/doctors', removeDoctorFromDepartment);

export default router;
