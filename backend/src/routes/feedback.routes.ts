import { Router } from 'express';
import {
  submitFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedbackStatus,
  deleteFeedback,
  getFeedbackSummary,
  reanalyseFeedback,
  getFeedbackStats,
} from '../controllers/feedback.controller';
import authMiddleware from '../middleware/auth.middleware';
import { feedbackLimiter } from '../middleware/rateLimiter.middleware';
import { validateFeedback } from '../middleware/validation.middleware';

const router = Router();

// Public
router.post('/', feedbackLimiter, validateFeedback, submitFeedback);

// Admin
router.get('/stats', authMiddleware, getFeedbackStats);
router.get('/summary', authMiddleware, getFeedbackSummary);
router.get('/', authMiddleware, getAllFeedback);
router.get('/:id', authMiddleware, getFeedbackById);
router.patch('/:id', authMiddleware, updateFeedbackStatus);
router.delete('/:id', authMiddleware, deleteFeedback);
router.post('/:id/reanalyse', authMiddleware, reanalyseFeedback);

export default router;