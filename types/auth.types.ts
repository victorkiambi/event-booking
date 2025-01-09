// src/types/auth.types.ts
import { UserRole } from '@prisma/client';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    companyId: string;
    role?: UserRole;
}

export interface JWTPayload {
    userId: string;
    email: string;
    role: UserRole;
    companyId: string;
}

export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

// Extend Express Request
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: UserRole;
                companyId: string;
            };
        }
    }
}