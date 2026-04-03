import dotenv from 'dotenv';

dotenv.config();

import app from './app';
import connectDB from './config/database';

const PORT = process.env.PORT || 4000;

// Start server
const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV} || 'development'`);
      console.log(`API: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
};

startServer();