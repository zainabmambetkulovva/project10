import { Router } from 'express';
import { param, body, check, validationResult } from 'express-validator';
import { authMiddleware, requireManagerRole, requireAdminRole } from '../middleware/auth';
import { paymentService } from '../services/payment.service';

const router = Router();

// Создать платеж
router.post(
  '/',
  authMiddleware,
  [
    body('amount').isInt(),
    body('bookingId').optional().isInt(),
    body('provider').optional().isIn(['custom', 'e-pay.kg', 'payme', 'zip', 'chipchap']),
    body('isIdempotent').optional().isBoolean(),
    body('idempotencyKey').optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = (req as any).user.id;
      const { amount, bookingId, provider = 'custom', isIdempotent = false, idempotencyKey } = req.body;

      const result = await paymentService.createPayment(
        userId,
        amount,
        bookingId ? parseInt(bookingId) : undefined,
        provider,
        isIdempotent,
        idempotencyKey
      );

      res.status(201).json(result);
    } catch (error) {
      console.error('[CREATE PAYMENT ERROR]', error);
      if (error.message === `Payment provider ${req.body.provider} not configured`) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Проверить статус платежа
router.get(
  '/:id/verify',
  authMiddleware,
  [param('id').isInt()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await paymentService.verifyPayment(parseInt(req.params.id));

      res.json(result);
    } catch (error) {
      console.error('[VERIFY PAYMENT ERROR]', error);
      if (error.message === 'Not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Webhook от платежного провайдера
router.post(
  '/webhook',
  [body('provider').isIn(['custom', 'e-pay.kg', 'payme', 'zip', 'chipchap'])],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { provider } = req.body;
      const signature = req.headers['x-payment-signature'] as string || '';

      const payment = await paymentService.handleWebhook(provider, req.body, signature);

      res.json(payment);
    } catch (error) {
      console.error('[WEBHOOK ERROR]', error);
      if (error.message === 'Invalid signature') {
        return res.status(401).json({ error: error.message });
      }
      if (error.message === 'Payment not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Создать возврат
router.post(
  '/:id/refund',
  authMiddleware,
  requireManagerRole,
  [param('id').isInt(), body('reason').notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = (req as any).user.id;
      const result = await paymentService.createRefund(parseInt(req.params.id), userId, req.body.reason);

      res.json(result);
    } catch (error) {
      console.error('[CREATE REFUND ERROR]', error);
      if (error.message === 'Not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Payment not completed') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'No refundable amount') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Получить историю платежей пользователя
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

      const payments = await paymentService.getUserPayments(userId, parseInt(page as string), parseInt(limit as string));

      res.json(payments);
    } catch (error) {
      console.error('[USER PAYMENTS ERROR]', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Получить статистику платежей (manager/admin)
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

      const stats = await paymentService.getStats(period as 'today' | 'week' | 'month');

      res.json(stats);
    } catch (error) {
      console.error('[PAYMENT STATS ERROR]', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

export default router;








