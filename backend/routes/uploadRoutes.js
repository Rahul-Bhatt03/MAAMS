// routes/uploadRoutes.js
import express from 'express';
import { uploadFile } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Apply authentication middleware
router.use(protect);

// Handle file uploads
router.post('/', upload.single('image'), uploadFile);

export default router;