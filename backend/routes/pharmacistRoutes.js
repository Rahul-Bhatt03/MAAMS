import express from 'express';
import {
  getAllPharmacists,
  getPharmacistById,
  createPharmacist,
  updatePharmacist,
  deletePharmacist,
  restorePharmacist,
  getPharmacistsByDepartment,
  getAllPharmacistsWithDeleted
} from '../controllers/pharmacistController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getAllPharmacists)
  .post(protect, admin, createPharmacist);

router.route('/with-deleted')
  .get(protect, admin, getAllPharmacistsWithDeleted);

router.route('/:id')
  .get(getPharmacistById)
  .put(protect, admin, updatePharmacist)
  .delete(protect, admin, deletePharmacist);

router.route('/:id/restore')
  .put(protect, admin, restorePharmacist);

router.route('/department/:departmentId')
  .get(getPharmacistsByDepartment);

export default router;