import { Request, Response } from 'express';
import Feedback from '../models/feedback.model';
import { sendSuccess, sendError } from '../utils/response';
import { analyseWithGemini, generateTrendSummary } from '../services/gemini.service';

// submit new feedback (Public)
export const submitFeedback = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { title, description, category, submitterName, submitterEmail } = req.body;

    const feedback = await Feedback.create({
      title,
      description,
      category,
      submitterName,
      submitterEmail,
    });

    // Trigger Gemini in background
    analyseWithGemini(
      feedback._id.toString(),
      title,
      description
    ).catch((error) => {
      console.error('Gemini analysis failed for feedback:', feedback._id, error);
    });

    sendSuccess(res, feedback, 'Feedback submitted successfully', 201);

  } catch (error) {
    console.error('Submit feedback error:', error);
    sendError(res, 'Failed to submit feedback');
  }
};

// GET all feedback with filtering, sorting, searching, and pagination (Admin)
export const getAllFeedback = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      category,
      status,
      sort = '-createdAt',
      search,
      page = '1',
      limit = '10',
    } = req.query;

    const filter: Record<string, unknown> = {};

    if (category) filter.category = category;
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { ai_summary: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Promise.all runs both queries in parallel instead of one after the other
    const [feedbacks, total] = await Promise.all([
      Feedback.find(filter)
        .sort(sort as string)
        .skip(skip)
        .limit(limitNum),
      Feedback.countDocuments(filter),
    ]);

    sendSuccess(res, {
      feedbacks,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
      },
    });

  } catch (error) {
    console.error('Get all feedback error:', error);
    sendError(res, 'Failed to fetch feedback');
  }
};

// GET single feedback by ID (Admin)
export const getFeedbackById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      sendError(res, 'Feedback not found', 404);
      return;
    }

    sendSuccess(res, feedback, 'Feedback retrieved successfully');

  } catch (error) {
    console.error('Get feedback by id error:', error);
    sendError(res, 'Failed to fetch feedback');
  }
};

// Update feedback status (Admin)
export const updateFeedbackStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.body;

    if (!status || !['New', 'In Review', 'Resolved'].includes(status)) {
      sendError(res, 'Invalid status. Must be New, In Review, or Resolved.', 400);
      return;
    }

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true 
      }
    );

    if (!feedback) {
      sendError(res, 'Feedback not found', 404);
      return;
    }

    sendSuccess(res, feedback, 'Status updated successfully');

  } catch (error) {
    console.error('Update feedback status error:', error);
    sendError(res, 'Failed to update feedback');
  }
};

// Delete feedback (Admin)
export const deleteFeedback = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      sendError(res, 'Feedback not found', 404);
      return;
    }

    sendSuccess(res, null, 'Feedback deleted successfully');

  } catch (error) {
    console.error('Delete feedback error:', error);
    sendError(res, 'Failed to delete feedback');
  }
};

// GET trend summary (Admin)
export const getFeedbackSummary = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentFeedback = await Feedback.find({
      createdAt: { $gte: sevenDaysAgo },
      ai_processed: true,
    }).select('title ai_summary ai_category ai_sentiment ai_priority ai_tags');

    if (recentFeedback.length === 0) {
      sendSuccess(res, {
        summary: 'No AI-processed feedback in the last 7 days.',
        feedbackCount: 0,
      });
      return;
    }

    const summary = await generateTrendSummary(recentFeedback);

    sendSuccess(res, {
      summary,
      feedbackCount: recentFeedback.length,
      period: 'Last 7 days',
    });

  } catch (error) {
    console.error('Get feedback summary error:', error);
    sendError(res, 'Failed to generate summary');
  }
};

// Re-analyse one feedback item (Admin)
export const reanalyseFeedback = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      sendError(res, 'Feedback not found', 404);
      return;
    }

    analyseWithGemini(
      feedback._id.toString(),
      feedback.title,
      feedback.description
    ).catch((error) => {
      console.error('Re-analysis failed:', error);
    });

    sendSuccess(res, null, 'AI re-analysis triggered successfully');

  } catch (error) {
    console.error('Reanalyse feedback error:', error);
    sendError(res, 'Failed to trigger AI re-analysis');
  }
};