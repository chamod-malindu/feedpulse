import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import feedbackRoutes from './routes/feedback.routes';

const app = express();

// Add security headers
app.use(helmet());

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',        // Local development
      'http://frontend:3000',         // Docker container name
      'http://localhost',             // Docker alternative
    ];

    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));

// Routes
app.use('/api/feedback', feedbackRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'FeedPulse API is running',
    timestamp: new Date().toISOString()
  });
});


// Global error handler
app.use((
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction

  ) => {
    console.error('Unhandled error: ', err.message);

    res.status(500).json({
      success: false,
      data: null,
      error: 'Internal Server Error',
      message:
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'An unexpected error occurred. Please try again later.',
    });
  }
);

export default app;
