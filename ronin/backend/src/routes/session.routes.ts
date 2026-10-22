import { Router } from 'express';
import { param, body, check, validationResult } from 'express-validator';
import { authMiddleware, requireManagerRole, requireAdminRole } from '../middleware/auth';
import { gamingSessionService } from '../services/session.service';
import { i18n } from '../config/i18n';

const router = Router();

// Получить активные сессии
router.get(
  '/active',
  authMiddleware,
  requireManagerRole,
  async (req, res) => {
    try {
      const sessions = await gamingSessionService.getActiveSessions();
      res.json(sessions);
    } catch (error) {
      console.error('[ACTIVE SESSIONS ERROR]', error);
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Получить сессию по ID
router.get(
  '/:id',
  authMiddleware,
  [param('id').isInt().withMessage(i18n.t('validation.invalid_id'))],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const session = await gamingSessionService.findById(parseInt(req.params.id));

      res.json(session);
    } catch (error) {
      console.error('[GET SESSION ERROR]', error);
      if (error.message === i18n.t('errors.not_found')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Получить историю сессий пользователя
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

      const sessions = await gamingSessionService.getUserSessions(userId, parseInt(page as string), parseInt(limit as string));

      res.json(sessions);
    } catch (error) {
      console.error('[USER SESSIONS ERROR]', error);
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Запустить сессию
router.post(
  '/start',
  authMiddleware,
  requireManagerRole,
  [
    body('bookingId').isInt().withMessage(i18n.t('validation.invalid_id')),
    body('computerId').isInt().withMessage(i18n.t('validation.invalid_id')),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = (req as any).user.id;
      const { bookingId, computerId } = req.body;

      const session = await gamingSessionService.startSession(parseInt(bookingId), parseInt(computerId), userId);

      res.status(201).json(session);
    } catch (error) {
      console.error('[START SESSION ERROR]', error);
      if (error.message === i18n.t('errors.booking_not_found')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === i18n.t('errors.booking_not_confirmed')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === i18n.t('errors.computer_mismatch')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === i18n.t('errors.session_already_started')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Завершить сессию
router.post(
  '/:id/end',
  authMiddleware,
  requireManagerRole,
  [param('id').isInt().withMessage(i18n.t('validation.invalid_id'))],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = (req as any).user.id;
      const session = await gamingSessionService.endSession(parseInt(req.params.id), userId);

      res.json(session);
    } catch (error) {
      console.error('[END SESSION ERROR]', error);
      if (error.message === i18n.t('errors.not_found')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === i18n.t('errors.session_not_active')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Завершить истекшие сессии (cron endpoint)
router.post(
  '/end-expired',
  authMiddleware,
  requireAdminRole,
  async (req, res) => {
    try {
      const result = await gamingSessionService.endExpiredSessions();
      res.json(result);
    } catch (error) {
      console.error('[END EXPIRED SESSIONS ERROR]', error);
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Получить статистику сессий (manager/admin)
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

      const stats = await gamingSessionService.getStats(period as 'today' | 'week' | 'month');

      res.json(stats);
    } catch (error) {
      console.error('[SESSION STATS ERROR]', error);
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

export default router;
