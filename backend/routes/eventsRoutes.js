import express from 'express';
import { createEvent, updateEvent, softDeleteEvent, getEvents, getEventById } from '../controllers/eventController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect middleware to all routes that need authentication
router.get('/', protect, getEvents);
router.get('/:id', protect, getEventById);
router.post('/create', protect, createEvent);
router.put('/:id', protect, updateEvent);
router.delete('/delete/:id', protect, softDeleteEvent);

export default router;