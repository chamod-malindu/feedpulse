import { Router } from 'express';
import {
  submitFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedbackStatus,
  deleteFeedback,
} from '../controllers/feedback.controller';
import authMiddleware from '../middleware/auth.middleware';
import { feedbackLimiter } from '../middleware/rateLimiter.middleware';
import { validateFeedback } from '../middleware/validation.middleware';

const router = Router();

// Public
router.post('/', feedbackLimiter, validateFeedback, submitFeedback);

// Admin
router.get('/', authMiddleware, getAllFeedback);
router.get('/:id', authMiddleware, getFeedbackById);
router.patch('/:id', authMiddleware, updateFeedbackStatus);
router.delete('/:id', authMiddleware, deleteFeedback);

export default router;