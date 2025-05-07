// routes/medicineRoutes.js
import express from 'express';
import medicineController from '../controllers/MedicineController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public routes
// get wala bata /search remove gareko xu hai 
router.get('/', medicineController.search);
router.get('/:id', medicineController.getMedicine);

// Protected routes (pharmacist/admin only)
router.post(
  '/', 
  // protect, 
//   pharmacistMiddleware, 
  upload.single('image'), 
  medicineController.addMedicine
);

router.put(
  '/:id', 
  protect, 
//   pharmacistMiddleware, 
  upload.single('image'), 
  medicineController.updateMedicine
);

router.delete(
  '/:id', 
  protect, 
//   pharmacistMiddleware, 
  medicineController.deleteMedicine
);

export default router;