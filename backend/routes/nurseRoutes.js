import express from 'express';
import {
  getAllNurses,
  getNurseById,
  createNurse,
  updateNurse,
  deleteNurse,
  getNursesByDepartment
} from '../controllers/nurseController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getAllNurses)
  .post(protect, admin, createNurse);

router.route('/:id')
  .get(getNurseById)
  .put(protect, admin, updateNurse)
  .delete(protect, admin, deleteNurse);

router.route('/department/:departmentId').get(getNursesByDepartment);

export default router;