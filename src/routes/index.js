import { Router } from 'express';
import analyticsRoutes from './analytics.js';
import bookingsRoutes from './bookings.js';
import categoriesRoutes from './categories.js';
import customersRoutes from './customers.js';
import customizedPackagesRoutes from './customizedPackages.js';
import packagesRoutes from './packages.js';
import uploadsRoutes from './uploads.js';

const router = Router();

router.use('/packages', packagesRoutes);
router.use('/categories', categoriesRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/customers', customersRoutes);
router.use('/customized-packages', customizedPackagesRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/uploads', uploadsRoutes);

export default router;
