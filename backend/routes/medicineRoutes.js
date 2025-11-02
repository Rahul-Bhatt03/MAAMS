// routes/medicineRoutes.js
import express from 'express';
import medicineController from '../controllers/MedicineController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.get('/', medicineController.search);
router.get('/:id', medicineController.getMedicine);
router.post(
  '/', 
  protect, 
  upload.single('image'), 
  medicineController.addMedicine
);

router.put(
  '/:id', 
  protect, 
  upload.single('image'), 
  medicineController.updateMedicine
);

router.delete(
  '/:id', 
  protect, 
  medicineController.deleteMedicine
);

export default router;