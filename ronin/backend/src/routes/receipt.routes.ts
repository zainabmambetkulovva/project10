import { Router } from 'express';
import { param, check, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/auth';
import { receiptService } from '../services/receipt.service';
import { i18n } from '../config/i18n';

const router = Router();

// Создать чек
router.post(
  '/:bookingId',
  authMiddleware,
  [param('bookingId').isInt().withMessage(i18n.t('validation.invalid_id'))],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const receipt = await receiptService.createReceipt(parseInt(req.params.bookingId));

      res.status(201).json(receipt);
    } catch (error) {
      console.error('[CREATE RECEIPT ERROR]', error);
      if (error.message === i18n.t('errors.not_found')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Получить чек по ID бронирования
router.get(
  '/booking/:bookingId',
  authMiddleware,
  [param('bookingId').isInt().withMessage(i18n.t('validation.invalid_id'))],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const receipt = await receiptService.getReceiptByBookingId(parseInt(req.params.bookingId));

      res.json(receipt);
    } catch (error) {
      console.error('[GET RECEIPT BY BOOKING ERROR]', error);
      if (error.message === i18n.t('errors.receipt_not_found')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Получить чек по токену проверки (публичный endpoint)
router.get(
  '/verify/:token',
  [param('token').isString().withMessage(i18n.t('validation.invalid_token'))],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const receipt = await receiptService.getReceiptByToken(req.params.token);

      res.json(receipt);
    } catch (error) {
      console.error('[VERIFY RECEIPT ERROR]', error);
      if (error.message === i18n.t('errors.receipt_not_found')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Получить чеки пользователя
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

      const receipts = await receiptService.getUserReceipts(userId, parseInt(page as string), parseInt(limit as string));

      res.json(receipts);
    } catch (error) {
      console.error('[USER RECEIPTS ERROR]', error);
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Проверить статус чека
router.get(
  '/:id/status',
  authMiddleware,
  [param('id').isInt().withMessage(i18n.t('validation.invalid_id'))],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const receipt = await receiptService.checkReceiptStatus(parseInt(req.params.id));

      res.json(receipt);
    } catch (error) {
      console.error('[CHECK RECEIPT ERROR]', error);
      if (error.message === i18n.t('errors.not_found')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Обновить чек после возврата
router.patch(
  '/:id/refund',
  authMiddleware,
  requireManagerRole,
  [param('id').isInt().withMessage(i18n.t('validation.invalid_id'))],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const receipt = await receiptService.markAsRefunded(parseInt(req.params.id));

      res.json(receipt);
    } catch (error) {
      console.error('[MARK REFUNDED ERROR]', error);
      if (error.message === i18n.t('errors.not_found')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Получить статистику чеков (manager/admin)
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

      const stats = await receiptService.getStats(period as 'today' | 'week' | 'month');

      res.json(stats);
    } catch (error) {
      console.error('[RECEIPT STATS ERROR]', error);
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

export default router;
