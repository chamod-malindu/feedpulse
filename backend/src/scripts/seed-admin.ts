import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/user.model';

dotenv.config();

const seedAdmin = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ email: 'admin@feedpulse.com' });

    if (existingAdmin) {
      console.log('Admin user already exists');

    }else {
      await User.create({
        email: 'admin@feedpulse.com',
        password: 'admin123',  
        name: 'Admin User',
        role: 'admin',
      });
      console.log('Admin User Created Successfully');
      console.log('Admin Email: admin@feedpulse.com');
      console.log('Admin Password: adminfeedpulse123');

    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  }catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
