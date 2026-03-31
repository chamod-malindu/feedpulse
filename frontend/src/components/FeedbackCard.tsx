'use client';

import { useState } from 'react';
import { updateFeedbackStatus, reanalyseFeedback } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RefreshCw,      
  Calendar,       
  User,           
  Tag,            
  Brain,          
  AlertTriangle,
  Mail,  
} from 'lucide-react';
import { toast } from 'sonner';

export interface FeedbackItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: 'New' | 'In Review' | 'Resolved';
  submitterName?: string;
  submitterEmail?: string;
  ai_category?: string;
  ai_sentiment?: 'Positive' | 'Neutral' | 'Negative';
  ai_priority?: number;
  ai_summary?: string;
  ai_tags?: string[];
  ai_processed: boolean;
  createdAt: string;
}

const sentimentConfig: Record<string,{ label: string; className: string }> = {
  Positive: {
    label: 'Positive',
    className: "bg-green-100 text-green-800 border-green-200",
  },
  Neutral: {
    label: 'Neutral',
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  Negative: {
    label: 'Negative',
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

const statusConfig: Record<string,{ className: string }> = {
  New: { className: "bg-blue-100 text-blue-800 border-blue-200" },
  'In Review': {
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  Resolved: {
    className: "bg-green-100 text-green-800 border-green-200",
  },
};

const categoryConfig: Record<string, string> = {
  Bug: '🐛',
  'Feature Request': '✨',
  Improvement: '🔧',
  Other: '📌',
};

function getPriorityColor(priority: number): string {
  if (priority >= 8) return "bg-red-100 text-red-800 border-red-200";
  if (priority >= 5) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-green-100 text-green-800 border-green-200";
}

interface FeedbackCardProps {
  feedback: FeedbackItem;
  onStatusChange: () => void;
}

export default function FeedbackCard({ feedback, onStatusChange }: FeedbackCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isReanalysing, setIsReanalysing] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    const result = await updateFeedbackStatus(feedback._id, newStatus);
    if (result.success) {
      toast.success('Status updated successfully');
      onStatusChange(); 
    }else {
      toast.error(result.message || 'Failed to update status');
    }
    setIsUpdating(false);
  };

  // Triggers Gemini to re-run AI analysis on this feedback
  // Useful when AI failed or admin wants a fresh analysis
  const handleReanalyse = async () => {
    setIsUpdating(true);
    const result = await reanalyseFeedback(feedback._id);
    
    if (result.success) {
      toast.success('AI re-analysis started. Refresh in a few seconds.');
    } else {
      toast.error('Failed to trigger re-analysis');
    }
    setIsUpdating(false); 
  };

  return (
    <Card className="bg-white border border-border shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5 space-y-4">

        {/* Title + Status Badge */}
        <div className="flex justify-between items-start gap-3">
          <h3 className="text-base font-semibold text-foreground leading-snug flex-1">
            {categoryConfig[feedback.category] || '📌'} {feedback.title}
          </h3>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${
              statusConfig[feedback.status]?.className || ''
            }`}
          >
            {feedback.status}
          </span>
        </div>

        {/* AI Summary */}
        {feedback.ai_processed ? (
          feedback.ai_summary && (
            <div className="flex items-start gap-2">
              <Brain className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feedback.ai_summary}
              </p>
            </div>
          )
        ) : (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>AI analysis pending or failed</span>
          </div>
        )}

        {/* AI Badges */}
        {feedback.ai_processed && (
          <div className="flex flex-wrap gap-2">

            {/* AI Category Badge */}
            {feedback.ai_category && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                {feedback.ai_category}
              </span>
            )}

            {/* Sentiment Badge */}
            {feedback.ai_sentiment && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  sentimentConfig[feedback.ai_sentiment]?.className || ''
                }`}
              >
                {feedback.ai_sentiment}
              </span>
            )}

            {/* Priority Badge */}
            {feedback.ai_priority !== undefined && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                  feedback.ai_priority
                )}`}
              >
                Priority: {feedback.ai_priority}/10
              </span>
            )}
          </div>
        )}

        {/* AI Tags */}
        {feedback.ai_tags && feedback.ai_tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            <Tag className="w-3.5 h-3.5 text-muted-foreground" />
            {feedback.ai_tags.map(tag => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs px-2 py-0 font-normal"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">

          {/* Date and submitter info */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            {feedback.submitterName && (
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {feedback.submitterName}
              </span>
            )}
            {feedback.submitterEmail && (
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {feedback.submitterEmail}
              </span>
            )}
          </div>

    
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReanalyse}
              disabled={isReanalysing || isUpdating}
              className="text-xs text-muted-foreground hover:text-primary h-7 px-2 hover:bg-transparent"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 mr-1 ${isReanalysing ? 'animate-spin' : ''}`}
              />
              {isReanalysing ? 'Analysing...' : 'Re-analyse'}
            </Button>

            {/* Status Dropdown */}
            <Select
              value={feedback.status}
              onValueChange={handleStatusChange}
              disabled={isUpdating}
            >
              <SelectTrigger className="h-7 text-xs w-32 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="New" className="text-xs">New</SelectItem>
                <SelectItem value="In Review" className="text-xs">In Review</SelectItem>
                <SelectItem value="Resolved" className="text-xs">Resolved</SelectItem>
              </SelectContent>
            </Select>

          </div>
        </div>
      </CardContent>
    </Card>
  );
}