// routes/index.ts
import express, { Request, Response, NextFunction, Router } from 'express';
import boothRoutes from "./booth.routes";
import companyRoutes from "./company.routes";
import bookingRoutes from "./booking.routes";
import userRoutes from "./user.routes";

const router: Router = express.Router();

// Basic route with type safety
router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the API' });
});

router.use('/booths', boothRoutes);
router.use('/companies', companyRoutes);
router.use('/bookings', bookingRoutes);
router.use('/users', userRoutes);


// // Route with params and error handling
// router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const id: string = req.params.id;
//     res.json({ requestedId: id });
//   } catch (error) {
//     next(error);
//   }
// });
//
// // Route with typed request body
// interface CreateUserRequest {
//   name: string;
//   email: string;
//   age?: number;  // Optional field
// }
//
// router.post('/user', (req: Request<{}, {}, CreateUserRequest>, res: Response) => {
//   const { name, email, age } = req.body;
//   res.json({ name, email, age });
// });
//
export default router;