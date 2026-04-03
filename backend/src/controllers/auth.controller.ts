import { Request, Response } from 'express';
import { sendError, sendSuccess } from "../utils/response";
import User from '../models/user.model';
import jwt from 'jsonwebtoken';

// Authenticate user safely and enable access to protected routes using a stateless JWT mechanism
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      sendError(
        res,
        'Email and password are required',
        400
      );
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if(!user) {
      sendError(
        res,
        'Invalid email or password',
        401
      );
      return;
    }
      
    const isPasswordValid = await user.comparePassword(password);

    if(!isPasswordValid) {
      sendError(
        res,
        'Invalid email or password',
        401
      );
      return;
    }
      
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    sendSuccess(
      res,
      {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      'Login successful'
    );
    
  } catch (error) {
    console.error('Login error:', error);
    sendError(
      res,
      'An error occurred during login. Please try again later.',
      500
    );
  }
};