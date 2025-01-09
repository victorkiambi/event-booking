import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

const handleJWTError = () =>
    new AppError(401, 'Invalid token. Please log in again.');

const handleValidationError = (err: any) => {
    const errors = Object.values(err.errors).map((el: any) => el.message);
    return new AppError(400, `Invalid input data. ${errors.join('. ')}`);
};

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }

    // Handle other types of errors
    if (err.name === 'JsonWebTokenError') err = handleJWTError();
    if (err.name === 'ValidationError') err = handleValidationError(err);

    // Log error for debugging
    console.error('ERROR 💥', err);

    // Send generic error in production
    return res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
    });
};
