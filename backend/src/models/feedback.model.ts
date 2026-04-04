import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  title: string;
  description: string;
  category: 'Bug' | 'Feature Request' | 'Improvement' | 'Other';
  status: 'New' | 'In Review' | 'Resolved';
  submitterName?: string;
  submitterEmail?: string;

  //AI fields (Populated after Gemini responds)
  ai_category?: string;
  ai_sentiment?: 'Positive' | 'Neutral' | 'Negative';
  ai_priority?: number;
  ai_summary?: string;
  ai_tags?: string[];
  ai_processed: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema<IFeedback>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [120, 'Title cannot exceed 120 characters'],
  },

  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [20, 'Description must be at least 20 characters'], 
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },

  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: [ 'Bug', 'Feature Request', 'Improvement', 'Other' ],
      message: '{VALUE} is not a valid category. Must be Bug, Feature Request, Improvement, or Other',
    },
  },

  status: {
    type: String,
    enum: {
      values: [ 'New', 'In Review', 'Resolved' ],
      message: '{VALUE} is not a valid status. Must be New, In Review, or Resolved',
    },
    default: 'New',
  },

  submitterName: {
    type: String,
    trim: true,
  },

  submitterEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },

  //AI fields
  ai_category: {
    type: String,
  },

  ai_sentiment: {
    type: String,
    enum: {
      values: ['Positive', 'Neutral', 'Negative'],
      message: '{VALUE} is not a valid sentiment. Must be Positive, Neutral, or Negative',
    },
  },

  ai_priority: {
    type: Number,
    min: [1, 'Priority must be a positive integer'],
    max: [10, 'Priority cannot be more than 10'],
  },

  ai_summary: {
    type: String,
  },

  ai_tags: [{
    type: String,
  }],

  ai_processed: {
    type: Boolean,
    default: false,
  },
},
{
  timestamps: true,
});

// Single field indexes for common queries
feedbackSchema.index({ status: 1});
feedbackSchema.index({ category: 1 });
feedbackSchema.index({ ai_priority: -1 });
feedbackSchema.index({ createdAt: -1 });

// Compound index for filtering by status and category
feedbackSchema.index({ status: 1, category: 1 });

// Text index for search functionality
feedbackSchema.index({ title: 'text', ai_summary: 'text' });

export default mongoose.model<IFeedback>('Feedback', feedbackSchema);