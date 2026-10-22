import { Router } from 'express';
import { param, body, check, validationResult } from 'express-validator';
import { authMiddleware, requireManagerRole, requireAdminRole } from '../middleware/auth';
import { computerService } from '../services/computer.service';
import { i18n } from '../config/i18n';

const router = Router();

// Получить все компьютеры
router.get(
  '/',
  [
    check('categoryId').optional().isInt().withMessage(i18n.t('validation.invalid_id')),
    check('status').optional().isIn(['AVAILABLE', 'IN_USE', 'MAINTENANCE']).withMessage(i18n.t('validation.invalid_status')),
    check('search').optional().isString().withMessage(i18n.t('validation.invalid_search')),
    check('page').optional().isInt({ min: 1 }).withMessage(i18n.t('validation.invalid_page')),
    check('limit').optional().isInt({ min: 1, max: 100 }).withMessage(i18n.t('validation.invalid_limit')),
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
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Получить компьютер по ID
router.get(
  '/:id',
  [param('id').isInt().withMessage(i18n.t('validation.invalid_id'))],
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
      if (error.message === i18n.t('errors.not_found')) {
        return res.status(404).json({ error: i18n.t('errors.not_found') });
      }
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Получить компьютер по номеру
router.get(
  '/number/:number',
  [param('number').isInt().withMessage(i18n.t('validation.invalid_number'))],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const computer = await computerService.findByNumber(parseInt(req.params.number));

      if (!computer) {
        return res.status(404).json({ error: i18n.t('errors.not_found') });
      }

      res.json(computer);
    } catch (error) {
      console.error('[COMPUTER ERROR]', error);
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Получить доступные компьютеры
router.get(
  '/available',
  [
    check('startsAt').isISO8601().withMessage(i18n.t('validation.invalid_date')),
    check('endsAt').isISO8601().withMessage(i18n.t('validation.invalid_date')),
    check('categoryId').optional().isInt().withMessage(i18n.t('validation.invalid_id')),
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
      res.status(500).json({ error: i18n.t('errors.internal_error') });
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
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Получить рекомендации
router.get(
  '/recommendations',
  [
    check('categoryId').optional().isInt().withMessage(i18n.t('validation.invalid_id')),
    check('durationMinutes').optional().isInt().withMessage(i18n.t('validation.invalid_duration')),
    check('budget').optional().isInt().withMessage(i18n.t('validation.invalid_budget')),
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
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Создать компьютер (MANAGER и ADMIN)
router.post(
  '/',
  authMiddleware,
  requireManagerRole,
  [
    body('number').isInt().withMessage(i18n.t('validation.invalid_number')),
    body('categoryId').isInt().withMessage(i18n.t('validation.invalid_id')),
    body('specifications').optional().isString().withMessage(i18n.t('validation.invalid_specifications')),
    body('equipment').optional().isString().withMessage(i18n.t('validation.invalid_equipment')),
    body('imageUrl').optional().isURL().withMessage(i18n.t('validation.invalid_url')),
    body('status').optional().isIn(['AVAILABLE', 'IN_USE', 'MAINTENANCE']).withMessage(i18n.t('validation.invalid_status')),
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
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Обновить компьютер (MANAGER и ADMIN)
router.put(
  '/:id',
  authMiddleware,
  requireManagerRole,
  [
    param('id').isInt().withMessage(i18n.t('validation.invalid_id')),
    body('categoryId').optional().isInt().withMessage(i18n.t('validation.invalid_id')),
    body('specifications').optional().isString().withMessage(i18n.t('validation.invalid_specifications')),
    body('equipment').optional().isString().withMessage(i18n.t('validation.invalid_equipment')),
    body('imageUrl').optional().isURL().withMessage(i18n.t('validation.invalid_url')),
    body('status').optional().isIn(['AVAILABLE', 'IN_USE', 'MAINTENANCE']).withMessage(i18n.t('validation.invalid_status')),
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
      if (error.message === i18n.t('errors.not_found')) {
        return res.status(404).json({ error: i18n.t('errors.not_found') });
      }
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Установить компьютер на обслуживание (MANAGER и ADMIN)
router.patch(
  '/:id/maintenance',
  authMiddleware,
  requireManagerRole,
  [param('id').isInt().withMessage(i18n.t('validation.invalid_id'))],
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
      if (error.message === i18n.t('errors.not_found')) {
        return res.status(404).json({ error: i18n.t('errors.not_found') });
      }
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Вернуть компьютер из обслуживания (MANAGER и ADMIN)
router.patch(
  '/:id/activate',
  authMiddleware,
  requireManagerRole,
  [param('id').isInt().withMessage(i18n.t('validation.invalid_id'))],
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
      if (error.message === i18n.t('errors.not_found')) {
        return res.status(404).json({ error: i18n.t('errors.not_found') });
      }
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Архивировать компьютер (ADMIN only)
router.delete(
  '/:id',
  authMiddleware,
  requireAdminRole,
  [param('id').isInt().withMessage(i18n.t('validation.invalid_id'))],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      await computerService.archive(parseInt(req.params.id));

      res.json({ message: i18n.t('computers.archived') });
    } catch (error) {
      console.error('[DELETE ERROR]', error);
      if (error.message === i18n.t('errors.not_found')) {
        return res.status(404).json({ error: i18n.t('errors.not_found') });
      }
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

export default router;
