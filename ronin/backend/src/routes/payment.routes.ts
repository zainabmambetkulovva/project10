import { Router } from 'express';
import { param, body, check, validationResult } from 'express-validator';
import { authMiddleware, requireManagerRole, requireAdminRole } from '../middleware/auth';
import { paymentService } from '../services/payment.service';
import { i18n } from '../config/i18n';

const router = Router();

// Создать платеж
router.post(
  '/',
  authMiddleware,
  [
    body('amount').isInt().withMessage(i18n.t('validation.invalid_amount')),
    body('bookingId').optional().isInt().withMessage(i18n.t('validation.invalid_id')),
    body('provider').optional().isIn(['custom', 'e-pay.kg', 'payme', 'zip', 'chipchap']).withMessage(i18n.t('validation.invalid_provider')),
    body('isIdempotent').optional().isBoolean().withMessage(i18n.t('validation.invalid_boolean')),
    body('idempotencyKey').optional().isString().withMessage(i18n.t('validation.invalid_key')),
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
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Проверить статус платежа
router.get(
  '/:id/verify',
  authMiddleware,
  [param('id').isInt().withMessage(i18n.t('validation.invalid_id'))],
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
      if (error.message === i18n.t('errors.not_found')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Webhook от платежного провайдера
router.post(
  '/webhook',
  [body('provider').isIn(['custom', 'e-pay.kg', 'payme', 'zip', 'chipchap']).withMessage(i18n.t('validation.invalid_provider'))],
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
      if (error.message === i18n.t('errors.invalid_signature')) {
        return res.status(401).json({ error: error.message });
      }
      if (error.message === i18n.t('errors.payment_not_found')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Создать возврат
router.post(
  '/:id/refund',
  authMiddleware,
  requireManagerRole,
  [param('id').isInt().withMessage(i18n.t('validation.invalid_id')), body('reason').notEmpty().withMessage(i18n.t('validation.required'))],
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
      if (error.message === i18n.t('errors.not_found')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === i18n.t('errors.payment_not_completed')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === i18n.t('errors.no_refundable_amount')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Получить историю платежей пользователя
router.get(
  '/user',
  authMiddleware,
  [
    check('page').optional().isInt({ min: 1 }).withMessage(i18n.t('validation.invalid_page')),
    check('limit').optional().isInt({ min: 1, max: 100 }).withMessage(i18n.t('validation.invalid_limit')),
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
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Получить статистику платежей (manager/admin)
router.get(
  '/stats',
  authMiddleware,
  requireManagerRole,
  [check('period').optional().isIn(['today', 'week', 'month']).withMessage(i18n.t('validation.invalid_period'))],
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
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

export default router;
