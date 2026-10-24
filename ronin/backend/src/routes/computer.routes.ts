import { Router } from 'express';
import { param, body, check, validationResult } from 'express-validator';
import { authMiddleware, requireManagerRole, requireAdminRole } from '../middleware/auth';
import { computerService } from '../services/computer.service';

const router = Router();

// Получить все компьютеры
router.get(
  '/',
  [
    check('categoryId').optional().isInt(),
    check('status').optional().isIn(['AVAILABLE', 'IN_USE', 'MAINTENANCE']),
    check('search').optional().isString(),
    check('page').optional().isInt({ min: 1 }),
    check('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { categoryId, status, search, page = '1', limit = '24' } = req.query;

      const computers = await computerService.findAll({
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        status: status as string,
        search: search as string,
      }, parseInt(page as string), parseInt(limit as string));

      res.json(computers);
    } catch (error) {
      console.error('[COMPUTERS ERROR]', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Получить компьютер по ID
router.get(
  '/:id',
  [param('id').isInt()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const computer = await computerService.findById(parseInt(req.params.id));

      res.json(computer);
    } catch (error) {
      console.error('[COMPUTER ERROR]', error);
      if (error.message === 'Not found') {
        return res.status(404).json({ error: 'Not found' });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Получить компьютер по номеру
router.get(
  '/number/:number',
  [param('number').isInt()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const computer = await computerService.findByNumber(parseInt(req.params.number));

      if (!computer) {
        return res.status(404).json({ error: 'Not found' });
      }

      res.json(computer);
    } catch (error) {
      console.error('[COMPUTER ERROR]', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Получить доступные компьютеры
router.get(
  '/available',
  [
    check('startsAt').isISO8601(),
    check('endsAt').isISO8601(),
    check('categoryId').optional().isInt(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { startsAt, endsAt, categoryId } = req.query;

      const computers = await computerService.findAvailable(
        new Date(startsAt as string),
        new Date(endsAt as string),
        categoryId ? parseInt(categoryId as string) : undefined
      );

      res.json({ computers, count: computers.length });
    } catch (error) {
      console.error('[AVAILABLE ERROR]', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Получить статистику компьютеров
router.get(
  '/stats',
  async (req, res) => {
    try {
      const stats = await computerService.getStats();
      res.json(stats);
    } catch (error) {
      console.error('[STATS ERROR]', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Получить рекомендации
router.get(
  '/recommendations',
  [
    check('categoryId').optional().isInt(),
    check('durationMinutes').optional().isInt(),
    check('budget').optional().isInt(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { categoryId, durationMinutes, budget } = req.query;

      const recommendations = await computerService.getRecommendations(
        categoryId ? parseInt(categoryId as string) : undefined,
        durationMinutes ? parseInt(durationMinutes as string) : undefined,
        budget ? parseInt(budget as string) : undefined
      );

      res.json(recommendations);
    } catch (error) {
      console.error('[RECOMMENDATIONS ERROR]', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Создать компьютер (MANAGER и ADMIN)
router.post(
  '/',
  authMiddleware,
  requireManagerRole,
  [
    body('number').isInt(),
    body('categoryId').isInt(),
    body('specifications').optional().isString(),
    body('equipment').optional().isString(),
    body('imageUrl').optional().isURL(),
    body('status').optional().isIn(['AVAILABLE', 'IN_USE', 'MAINTENANCE']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const computer = await computerService.create(req.body);

      res.status(201).json(computer);
    } catch (error) {
      console.error('[CREATE ERROR]', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Обновить компьютер (MANAGER и ADMIN)
router.put(
  '/:id',
  authMiddleware,
  requireManagerRole,
  [
    param('id').isInt(),
    body('categoryId').optional().isInt(),
    body('specifications').optional().isString(),
    body('equipment').optional().isString(),
    body('imageUrl').optional().isURL(),
    body('status').optional().isIn(['AVAILABLE', 'IN_USE', 'MAINTENANCE']),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const computer = await computerService.update(parseInt(req.params.id), req.body);

      res.json(computer);
    } catch (error) {
      console.error('[UPDATE ERROR]', error);
      if (error.message === 'Not found') {
        return res.status(404).json({ error: 'Not found' });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Установить компьютер на обслуживание (MANAGER и ADMIN)
router.patch(
  '/:id/maintenance',
  authMiddleware,
  requireManagerRole,
  [param('id').isInt()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const computer = await computerService.setMaintenance(parseInt(req.params.id));

      res.json(computer);
    } catch (error) {
      console.error('[MAINTENANCE ERROR]', error);
      if (error.message === 'Not found') {
        return res.status(404).json({ error: 'Not found' });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Вернуть компьютер из обслуживания (MANAGER и ADMIN)
router.patch(
  '/:id/activate',
  authMiddleware,
  requireManagerRole,
  [param('id').isInt()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const computer = await computerService.setActive(parseInt(req.params.id));

      res.json(computer);
    } catch (error) {
      console.error('[ACTIVATE ERROR]', error);
      if (error.message === 'Not found') {
        return res.status(404).json({ error: 'Not found' });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Архивировать компьютер (ADMIN only)
router.delete(
  '/:id',
  authMiddleware,
  requireAdminRole,
  [param('id').isInt()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      await computerService.archive(parseInt(req.params.id));

      res.json({ message: 'Computer archived' });
    } catch (error) {
      console.error('[DELETE ERROR]', error);
      if (error.message === 'Not found') {
        return res.status(404).json({ error: 'Not found' });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

export default router;








