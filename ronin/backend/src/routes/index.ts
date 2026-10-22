import { Router } from 'express';
import authRoutes from './auth.routes';
import computerRoutes from './computer.routes';
import bookingRoutes from './booking.routes';
import paymentRoutes from './payment.routes';
import characterRoutes from './character.routes';
import receiptRoutes from './receipt.routes';
import sessionRoutes from './session.routes';
import cmsRoutes from './cms.routes';
import aiRoutes from './ai.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/computers', computerRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/characters', characterRoutes);
router.use('/receipts', receiptRoutes);
router.use('/sessions', sessionRoutes);
router.use('/cms', cmsRoutes);
router.use('/ai', aiRoutes);

export default router;
