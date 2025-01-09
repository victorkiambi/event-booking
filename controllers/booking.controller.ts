// src/controllers/booking.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../prisma/prisma';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../middleware/asyncHandler';
import { BoothStatus } from '@prisma/client';

export const getAllBookings = asyncHandler(async (req: Request, res: Response) => {
    const { status, companyId } = req.query;

    const bookings = await prisma.booking.findMany({
        where: {
            ...(status && { paymentStatus: status as string }),
            ...(companyId && { companyId: companyId as string })
        },
        include: {
            booth: {
                include: {
                    type: true
                }
            },
            company: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true
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

export const getBookingById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
            booth: {
                include: {
                    type: true
                }
            },
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
    });

    if (!booking) {
        throw new AppError(404, 'Booking not found');
    }

    res.json({
        status: 'success',
        data: booking
    });
});

export const createBooking = asyncHandler(async (req: Request, res: Response) => {
    const { boothId, companyId } = req.body;

    // Check if booth is available
    const booth = await prisma.booth.findUnique({
        where: { id: boothId },
        include: { type: true }
    });

    if (!booth) {
        throw new AppError(404, 'Booth not found');
    }

    if (booth.status !== BoothStatus.AVAILABLE) {
        throw new AppError(400, 'Booth is not available for booking');
    }

    // Check if company exists
    const company = await prisma.company.findUnique({
        where: { id: companyId }
    });

    if (!company) {
        throw new AppError(404, 'Company not found');
    }

    // Create booking in a transaction
    const booking = await prisma.$transaction(async (prisma) => {
        // Create the booking
        const booking = await prisma.booking.create({
            data: {
                boothId,
                companyId,
                paymentStatus: 'pending'
            }
        });

        // Update booth status
        await prisma.booth.update({
            where: { id: boothId },
            data: { status: BoothStatus.BOOKED }
        });

        return booking;
    });

    res.status(201).json({
        status: 'success',
        data: booking
    });
});

export const updateBookingStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const booking = await prisma.booking.update({
        where: { id },
        data: {
            paymentStatus,
            updatedAt: new Date()
        },
        include: {
            booth: true,
            company: true
        }
    });

    res.json({
        status: 'success',
        data: booking
    });
});

export const cancelBooking = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Handle cancellation in a transaction
    const result = await prisma.$transaction(async (prisma) => {
        const booking = await prisma.booking.findUnique({
            where: { id },
            include: { booth: true }
        });

        if (!booking) {
            throw new AppError(404, 'Booking not found');
        }

        // Update booth status back to available
        await prisma.booth.update({
            where: { id: booking.boothId },
            data: { status: BoothStatus.AVAILABLE }
        });

        // Update booking status
        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: {
                paymentStatus: 'cancelled',
                updatedAt: new Date()
            }
        });

        return updatedBooking;
    });

    res.json({
        status: 'success',
        data: result
    });
});

export const getBookingsByDateRange = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        throw new AppError(400, 'Please provide both start and end dates');
    }

    const bookings = await prisma.booking.findMany({
        where: {
            createdAt: {
                gte: new Date(startDate as string),
                lte: new Date(endDate as string)
            }
        },
        include: {
            booth: {
                include: {
                    type: true
                }
            },
            company: {
                select: {
                    name: true,
                    email: true
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