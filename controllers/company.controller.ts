// src/controllers/company.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../prisma/prisma';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../middleware/asyncHandler';

export const getAllCompanies = asyncHandler(async (req: Request, res: Response) => {
    const companies = await prisma.company.findMany({
        include: {
            _count: {
                select: {
                    bookings: true,
                    users: true
                }
            }
        }
    });

    res.json({
        status: 'success',
        results: companies.length,
        data: companies
    });
});

export const getCompanyById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const company = await prisma.company.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    bookings: true,
                    users: true
                }
            }
        }
    });

    if (!company) {
        throw new AppError(404, 'Company not found');
    }

    res.json({
        status: 'success',
        data: company
    });
});

export const getCompanyBooths = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const booths = await prisma.booth.findMany({
        where: {
            booking: {
                companyId: id
            }
        },
        include: {
            type: true,
            booking: {
                select: {
                    paymentStatus: true,
                    createdAt: true
                }
            }
        }
    });

    res.json({
        status: 'success',
        results: booths.length,
        data: booths
    });
});

export const getCompanyUsers = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // First verify company exists
    const company = await prisma.company.findUnique({
        where: { id }
    });

    if (!company) {
        throw new AppError(404, 'Company not found');
    }

    const users = await prisma.user.findMany({
        where: {
            companyId: id
        },
        select: {
            id: true,
            email: true,
            role: true,
            createdAt: true
        }
    });

    res.json({
        status: 'success',
        results: users.length,
        data: users
    });
});

export const getCompanyBookings = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.query;

    const bookings = await prisma.booking.findMany({
        where: {
            companyId: id,
            ...(status && { paymentStatus: status as string })
        },
        include: {
            booth: {
                include: {
                    type: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    res.json({
        status: 'success',
        results: bookings.length,
        data: bookings
    });
});