// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import {compare, hash} from 'bcryptjs';
import { prisma } from '../prisma/prisma';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../middleware/asyncHandler';
import { generateTokens } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

export const register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, companyId } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new AppError(400, 'Email already registered');
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            companyId,
            role: UserRole.EXHIBITOR // Default role
        },
        select: {
            id: true,
            email: true,
            role: true,
            companyId: true,
            firstName: true,
            lastName: true
        }
    });

    // Generate tokens
    const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId
    });

    res.status(201).json({
        status: 'success',
        data: {
            user,
            ...tokens
        }
    });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user || !(await compare(password, user.password))) {
        throw new AppError(401, 'Invalid email or password');
    }

    // Generate tokens
    const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId
    });

    // Return user info (excluding password) and tokens
    const { password: _, ...userWithoutPassword } = user;

    res.json({
        status: 'success',
        data: {
            user: userWithoutPassword,
            ...tokens
        }
    });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            company: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true
                }
            }
        }
    });

    res.json({
        status: 'success',
        data: user
    });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const { firstName, lastName, email } = req.body;

    const updatedUser = await prisma.user.update({
        where: { id: req.user!.id },
        data: {
            firstName,
            lastName,
            email
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
        }
    });

    res.json({
        status: 'success',
        data: updatedUser
    });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
        where: { id: req.user!.id }
    });

    if (!user || !(await compare(currentPassword, user.password))) {
        throw new AppError(401, 'Current password is incorrect');
    }

    const hashedPassword = await hash(newPassword, 12);

    await prisma.user.update({
        where: { id: req.user!.id },
        data: { password: hashedPassword }
    });

    res.json({
        status: 'success',
        message: 'Password updated successfully'
    });
});

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            company: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });

    res.json({
        status: 'success',
        results: users.length,
        data: users
    });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            company: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true
                }
            }
        }
    });

    if (!user) {
        throw new AppError(404, 'User not found');
    }

    res.json({
        status: 'success',
        data: user
    });
});

export const deactivateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await prisma.user.update({
        where: { id },
        data: { isActive: false }
    });

    res.json({
        status: 'success',
        message: 'User deactivated successfully'
    });
});

// Handle refresh token
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
    // Implementation depends on your refresh token strategy
    // This is a placeholder
    res.json({
        status: 'success',
        message: 'Token refreshed'
    });
});

// Handle logout
export const logout = asyncHandler(async (req: Request, res: Response) => {
    // Implementation depends on your logout strategy
    // This is a placeholder
    res.json({
        status: 'success',
        message: 'Logged out successfully'
    });
});