// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/prisma';
import { AppError } from '../utils/AppError';
import { JWTPayload } from '../types/auth.types';
import { UserRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

export const generateTokens = (payload: JWTPayload): { accessToken: string; refreshToken: string } => {
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    return { accessToken, refreshToken };
};

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];

        if (!token) {
            throw new AppError(401, 'No token provided');
        }

        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

        // Check if user still exists
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user) {
            throw new AppError(401, 'User no longer exists');
        }

        req.user = {
            id: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            companyId: decoded.companyId
        };

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new AppError(401, 'Invalid or expired token'));
        } else {
            next(error);
        }
    }
};

export const requireRoles = (roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            throw new AppError(401, 'Not authenticated');
        }

        if (!roles.includes(req.user.role)) {
            throw new AppError(403, 'Not authorized to access this resource');
        }

        next();
    };
};

export const isCompanyMember = async (req: Request, res: Response, next: NextFunction) => {
    const companyId = req.params.companyId || req.body.companyId;

    if (!req.user || !companyId) {
        throw new AppError(401, 'Not authenticated');
    }

    if (req.user.role === UserRole.ADMIN) {
        return next();
    }

    if (req.user.companyId !== companyId) {
        throw new AppError(403, 'Not authorized to access this company\'s resources');
    }

    next();
};