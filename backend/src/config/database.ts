import mongoose from "mongoose";


const connectDB = async (): Promise<void> => {
  try {
    const mongoURL = process.env.MONGO_URI;

    if(!mongoURL) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoURL);
    console.log('MongoDB connected successfully');

  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

export default connectDB;