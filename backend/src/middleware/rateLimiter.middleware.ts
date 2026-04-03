import rateLimit from 'express-rate-limit';

// Strict limit for feedback submission — spec requires max 5 per hour
export const feedbackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  
  max: 5,                     
  message: {
    success: false,
    data: null,
    error: 'Too many submissions',
    message: 'You can only submit 5 feedback items per hour. Please try again later.',
  },
  standardHeaders: true,   
  legacyHeaders: false,
});

// Relaxed limit for general API traffic — protects against automated scraping
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  
  max: 100,                   
  message: {
    success: false,
    data: null,
    error: 'Too many requests',
    message: 'Too many requests. Please try again later.',
  },
});