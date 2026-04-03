import { Response } from 'express';

export const sendSuccess = (
  res: Response,
  data: unknown,
  message: string = 'Success',
  statusCode: number = 200

): void => {
  res.status(statusCode).json({
    success: true,
    data,
    error: null,
    message,
  });
};

export const sendError = (
  res: Response,
  message: string = 'Error',
  statusCode: number = 500,
  error: unknown = null,
): void => {
  res.status(statusCode).json({
    success: false,
    data: null,
    error: error || message,
    message,
  });
};