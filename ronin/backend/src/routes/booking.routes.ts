import { Router } from 'express';
import { param, body, check, validationResult } from 'express-validator';
import { authMiddleware, requireManagerRole, requireAdminRole } from '../middleware/auth';
import { bookingService } from '../services/booking.service';
import { receiptService } from '../services/receipt.service';

const router = Router();

// Получить бронирования пользователя
router.get(
  '/user',
  authMiddleware,
  [
    check('page').optional().isInt({ min: 1 }),
    check('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = (req as any).user.id;
      const { page = '1', limit = '20' } = req.query;

      const bookings = await bookingService.getUserBookings(userId, parseInt(page as string), parseInt(limit as string));

      res.json(bookings);
    } catch (error) {
      console.error('[USER BOOKINGS ERROR]', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Получить все бронирования (manager/admin)
router.get(
  '/',
  authMiddleware,
  requireManagerRole,
  [
    check('page').optional().isInt({ min: 1 }),
    check('limit').optional().isInt({ min: 1, max: 100 }),
    check('status').optional().isIn(['PENDING_PAYMENT', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED']),
    check('search').optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { page = '1', limit = '20', status, search } = req.query;

      const bookings = await bookingService.getManagerBookings(
        parseInt(page as string),
        parseInt(limit as string),
        { status, search }
      );

      res.json(bookings);
    } catch (error) {
      console.error('[MANAGER BOOKINGS ERROR]', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Получить статистику бронирований
router.get(
  '/stats',
  authMiddleware,
  requireManagerRole,
  [check('period').optional().isIn(['today', 'week', 'month'])],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { period = 'today' } = req.query;

      const stats = await bookingService.getStats(period as 'today' | 'week' | 'month');

      res.json(stats);
    } catch (error) {
      console.error('[STATS ERROR]', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Получить активные бронирования
router.get(
  '/active',
  authMiddleware,
  requireManagerRole,
  async (req, res) => {
    try {
      const bookings = await bookingService.getActiveBookings();
      res.json(bookings);
    } catch (error) {
      console.error('[ACTIVE BOOKINGS ERROR]', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Создать бронирование
router.post(
  '/',
  authMiddleware,
  [
    body('computerId').isInt(),
    body('tariffId').isInt(),
    body('startsAt').isISO8601(),
    body('endsAt').isISO8601(),
    body('paymentMethod').isIn(['ONLINE', 'CASH']),
    body('managerId').optional().isInt(),
    body('notes').optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = (req as any).user.id;
      const { computerId, tariffId, startsAt, endsAt, paymentMethod, managerId, notes } = req.body;

      const booking = await bookingService.create({
        userId,
        computerId,
        tariffId,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        paymentMethod: paymentMethod as 'ONLINE' | 'CASH',
        managerId: managerId ? parseInt(managerId) : undefined,
        notes: notes || undefined,
      });

      res.status(201).json(booking);
    } catch (error) {
      console.error('[CREATE BOOKING ERROR]', error);
      if (error.message === 'Computer under maintenance') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Computer unavailable') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Tariff not found') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Tariff inactive') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Tariff category mismatch') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Подтвердить бронирование после оплаты
router.post(
  '/:id/confirm-payment',
  authMiddleware,
  requireManagerRole,
  [param('id').isInt()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const booking = await bookingService.confirmPayment(parseInt(req.params.id), 0);

      // Создаем чек
      await receiptService.createReceipt(booking.id);

      res.json(booking);
    } catch (error) {
      console.error('[CONFIRM PAYMENT ERROR]', error);
      if (error.message === 'Not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Booking not pending') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Отменить бронирование
router.post(
  '/:id/cancel',
  authMiddleware,
  [param('id').isInt()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = (req as any).user.id;
      const booking = await bookingService.cancel(parseInt(req.params.id), userId);

      res.json(booking);
    } catch (error) {
      console.error('[CANCEL BOOKING ERROR]', error);
      if (error.message === 'Not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Forbidden') {
        return res.status(403).json({ error: error.message });
      }
      if (error.message === 'Cannot cancel') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Обновить статус бронирования
router.patch(
  '/:id/status',
  authMiddleware,
  requireManagerRole,
  [param('id').isInt(), body('status').isIn(['PENDING_PAYMENT', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED'])],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const booking = await bookingService.updateStatus(parseInt(req.params.id), req.body.status, (req as any).user.id);

      res.json(booking);
    } catch (error) {
      console.error('[UPDATE STATUS ERROR]', error);
      if (error.message === 'Not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Invalid status transition') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

export default router;








