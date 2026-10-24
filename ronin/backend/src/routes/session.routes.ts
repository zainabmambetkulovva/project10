import { Router } from 'express';
import { param, body, check, validationResult } from 'express-validator';
import { authMiddleware, requireManagerRole, requireAdminRole } from '../middleware/auth';
import { gamingSessionService } from '../services/session.service';

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
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Получить сессию по ID
router.get(
  '/:id',
  authMiddleware,
  [param('id').isInt()],
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
      if (error.message === 'Not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Получить историю сессий пользователя
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

      const sessions = await gamingSessionService.getUserSessions(userId, parseInt(page as string), parseInt(limit as string));

      res.json(sessions);
    } catch (error) {
      console.error('[USER SESSIONS ERROR]', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Запустить сессию
router.post(
  '/start',
  authMiddleware,
  requireManagerRole,
  [
    body('bookingId').isInt(),
    body('computerId').isInt(),
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
      if (error.message === 'Booking not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Booking not confirmed') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Computer mismatch') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Session already started') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Завершить сессию
router.post(
  '/:id/end',
  authMiddleware,
  requireManagerRole,
  [param('id').isInt()],
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
      if (error.message === 'Not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Session not active') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal Server Error' });
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
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Получить статистику сессий (manager/admin)
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

      const stats = await gamingSessionService.getStats(period as 'today' | 'week' | 'month');

      res.json(stats);
    } catch (error) {
      console.error('[SESSION STATS ERROR]', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

export default router;







