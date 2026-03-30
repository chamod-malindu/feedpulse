'use client';

import { useState } from 'react';
import { submitFeedback } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
} from 'lucide-react';


interface FormData {
  title: string;
  description: string;
  category: string;
  submitterName: string;
  submitterEmail: string;
}

// Maps each form field name to its error message
type FormErrors = Partial<Record<keyof FormData, string>>;

export default function FeedbackForm() {

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    submitterName: '',
    submitterEmail: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 120) {
      newErrors.title = 'Title cannot be more than 120 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (
      formData.submitterEmail &&
      !/^\S+@\S+\.\S+$/.test(formData.submitterEmail)
    ) {
      newErrors.submitterEmail = 'Please enter a valid email address';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    const result = await submitFeedback({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      submitterName: formData.submitterName || undefined,
      submitterEmail: formData.submitterEmail || undefined,
    });

    if (result.success) {
      setSubmitStatus('success');
      setSubmitMessage(
        'Thank you! Your feedback has been submitted and will be reviewed shortly.'
      );

      setFormData({
        title: '',
        description: '',
        category: '',
        submitterName: '',
        submitterEmail: '',
      });
      setErrors({});
    } else {
      setSubmitStatus('error');
      setSubmitMessage(
        result.message || 'Something went wrong. Please try again.'
      );
    }

    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Makes error messages disappear as soon as user starts fixing them (user types)
    if (errors[name as keyof FormData]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormData];
        return newErrors;
      });
    }
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: undefined }));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white rounded-2xl shadow-sm border border-border p-8"
    >

      {/* SUCCESS MESSAGE */}
      {submitStatus === 'success' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {submitMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* ERROR MESSAGE */}
      {submitStatus === 'error' && (
        <Alert className="border-red-200 bg-red-50" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitMessage}</AlertDescription>
        </Alert>
      )}

      {/* TITLE FIELD */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          maxLength={120}
          placeholder="Short summary of your feedback"
          className={errors.title ? "border-destructive focus-visible:ring-destructive" : ""}
        />
        <div className="flex justify-between items-center">
          {errors.title ? (
            <p className="text-sm text-destructive">{errors.title}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-muted-foreground">
            {formData.title.length}/120
          </span>
        </div>
      </div>

      {/* DESCRIPTION FIELD */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={5}
          placeholder="Describe your feedback in detail (minimum 20 characters)"
          className={errors.description ? "border-destructive focus-visible:ring-destructive" : ""}
        />
        <div className="flex justify-between items-center">
          {errors.description ? (
            <p className="text-sm text-destructive">{errors.description}</p>
          ) : (
            <span />
          )}

          <span
            className={`text-xs ${
              formData.description.length < 20 && formData.description.length > 0
                ? "text-orange-500 font-medium"
                : "text-muted-foreground"
            }`}
          >
            {formData.description.length} / 20 min
          </span>
        </div>
      </div>

      {/* CATEGORY FIELD */}
      <div className="space-y-2">
        <Label htmlFor="category">
          Category <span className="text-destructive">*</span>
        </Label>
        <Select onValueChange={handleCategoryChange} value={formData.category}>
          <SelectTrigger
            className={errors.category ? 'border-destructive focus:ring-destructive' : ''}
          >
            <SelectValue placeholder="Select a category..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Bug">Bug</SelectItem>
            <SelectItem value="Feature Request">Feature Request</SelectItem>
            <SelectItem value="Improvement">Improvement</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-destructive">{errors.category}</p>
        )}
      </div>

      {/* OPTIONAL FIELDS — Name and Email side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="submitterName">
            Your Name{' '}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="submitterName"
            name="submitterName"
            value={formData.submitterName}
            onChange={handleChange}
            placeholder="First and last name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="submitterEmail">
            Your Email{' '}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="submitterEmail"
            name="submitterEmail"
            type="email"
            value={formData.submitterEmail}
            onChange={handleChange}
            placeholder="name@example.com"
            className={errors.submitterEmail ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.submitterEmail && (
            <p className="text-sm text-destructive">{errors.submitterEmail}</p>
          )}
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full btn-gradient rounded-full font-semibold py-6 text-base shadow-blue-glow cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Submit Feedback
          </>
        )}
      </Button>

      {/* PRIVACY NOTE */}
      <p className="text-center text-xs text-muted-foreground">
        Name and email are optional. You can submit feedback anonymously.
      </p>
    </form>
  );
}