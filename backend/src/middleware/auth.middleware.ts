import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";
import jwt from "jsonwebtoken";


export interface AuthRequest extends Request {
  userId?: string;
}

// Protects admin-only routes — attach to any route that requires authentication
// Usage: router.get('/feedback', authMiddleware, getAllFeedback)
const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendError(res, 'Access denied. No token provided.', 401);
      return;
    }

    const token = authHeader.split(" ")[1];

    // jwt.verify throws if the token is expired or has been tampered with
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };

    req.userId = decoded.userId;

    next();

  } catch (error) {
    sendError(res, 'Invalid or expired token', 401);
  }
};

export default authMiddleware;