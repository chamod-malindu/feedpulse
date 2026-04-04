import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { sendError } from '../utils/response';

// Server-side safety net — client-side validation can be bypassed via Postman or curl
export const validateFeedback = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 120 }).withMessage('Title cannot be more than 120 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 20, max: 1000 })
    .withMessage('Description must be between 20 and 1000 characters'),

  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isIn(['Bug', 'Feature Request', 'Improvement', 'Other'])
    .withMessage('Category must be Bug, Feature Request, Improvement, or Other'),

  body('submitterEmail')
    .optional()
    .trim()
    .isEmail().withMessage('Please enter a valid email address'),

  body('submitterName')
    .optional()
    .trim()
    .escape(), 

  (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      sendError(
        res,
        'Validation failed',
        400,
        errors.array().map((err) => ({
          field: (err as { path: string }).path,
          message: err.msg,
        }))
      );
      return;
    }

    next();  
  },
];