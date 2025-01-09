import express, { Express, Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import indexRouter from './routes/index';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import {errorHandler} from "./middleware/errorHandler";

const app: Express = express();

// Environment variables
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware
app.use(helmet());
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));
app.use(compression());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Basic health check route
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});


// Routes
app.use('/api', indexRouter);

app.use(errorHandler);
// Error handling middleware
// interface ErrorWithStatus extends Error {
//     status?: number;
// }

// app.use((err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
//     res.status(err.status || 500);
//     res.json({
//         error: {
//             message: err.message,
//             status: err.status || 500
//         }
//     });
// });

export default app;