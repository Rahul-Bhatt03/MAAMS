import express from 'express';
import {
  getAllResearch,
  getResearchById,
  createResearch,
  updateResearch,
  deleteResearch,
  addAttachment,
  removeAttachment,
  getResearchByDepartment,
  getResearchByInvestigator
} from '../controllers/researchController.js';
import {protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Main CRUD routes
router.get('/', getAllResearch);
router.get('/:id', getResearchById);
router.post('/', createResearch);
router.put('/:id', updateResearch);
router.delete('/:id', deleteResearch);

// Attachment routes
router.post('/:id/attachments', addAttachment);
router.delete('/:id/attachments', removeAttachment);

// Additional routes
router.get('/department/:departmentId', getResearchByDepartment);
router.get('/investigator/:investigatorId', getResearchByInvestigator);

export default router;