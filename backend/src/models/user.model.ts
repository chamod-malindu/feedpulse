import mongoose, { Document, Schema } from "mongoose";
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'admin';
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },

  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },

  role: {
    type: String,
    enum: {
      values: ['admin'],
      message: '{VALUE} is not a valid role. Must be admin',
    },
    default: 'admin',
  },
},
{
  timestamps: true,
});

// Password hashing 
// Password hashing 
userSchema.pre('save', async function () {
  try {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

  }catch(error) {
    console.error('password hashing error:', error);
    throw error;
  }
});

// Password comparison method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('password comparison error:', error);
    return false;
  }
};

export default mongoose.model<IUser>('User', userSchema);