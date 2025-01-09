// src/controllers/booth.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../prisma/prisma';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../middleware/asyncHandler';

export const getAllBooths = asyncHandler(async (req: Request, res: Response) => {
    const booths = await prisma.booth.findMany({
        include: {
            type: true,
            booking: {
                include: {
                    company: true
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

export const getBoothById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const booth = await prisma.booth.findUnique({
        where: { id },
        include: {
            type: true,
            booking: {
                include: {
                    company: {
                        include: {
                            users: {
                                select: {
                                    id: true,
                                    email: true,
                                    role: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!booth) {
        throw new AppError(404, 'Booth not found');
    }

    res.json({
        status: 'success',
        data: booth
    });
});

export const getBoothsByType = asyncHandler(async (req: Request, res: Response) => {
    const { typeId } = req.params;

    const booths = await prisma.booth.findMany({
        where: {
            typeId
        },
        include: {
            type: true,
            booking: {
                include: {
                    company: true
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

export const getAvailableBooths = asyncHandler(async (req: Request, res: Response) => {
    const booths = await prisma.booth.findMany({
        where: {
            status: 'AVAILABLE'
        },
        include: {
            type: true
        }
    });

    res.json({
        status: 'success',
        results: booths.length,
        data: booths
    });
});