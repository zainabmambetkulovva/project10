import { Router } from 'express';
import { param, body, check, validationResult } from 'express-validator';
import { authMiddleware, requireManagerRole, requireAdminRole } from '../middleware/auth';
import { cmsService } from '../services/cms.service';
import { i18n } from '../config/i18n';

const router = Router();

// Получить CMS блоки (публичный)
router.get(
  '/blocks',
  async (req, res) => {
    try {
      const blocks = await cmsService.getBlocks();
      res.json(blocks);
    } catch (error) {
      console.error('[BLOCKS ERROR]', error);
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Получить блок по ключу
router.get(
  '/block/:key',
  [param('key').isString().withMessage(i18n.t('validation.invalid_key'))],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const block = await cmsService.getByKey(req.params.key);

      res.json(block);
    } catch (error) {
      console.error('[BLOCK BY KEY ERROR]', error);
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Получить все карточки
router.get(
  '/cards',
  async (req, res) => {
    try {
      const cards = await cmsService.getCards();
      res.json(cards);
    } catch (error) {
      console.error('[CARDS ERROR]', error);
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Получить все цитаты
router.get(
  '/quotes',
  async (req, res) => {
    try {
      const quotes = await cmsService.getQuotes();
      res.json(quotes);
    } catch (error) {
      console.error('[QUOTES ERROR]', error);
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Получить контент для landing page
router.get(
  '/landing',
  async (req, res) => {
    try {
      const content = await cmsService.getLandingContent();
      res.json(content);
    } catch (error) {
      console.error('[LANDING CONTENT ERROR]', error);
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Создать блок (ADMIN)
router.post(
  '/',
  authMiddleware,
  requireAdminRole,
  [
    body('key').trim().notEmpty().withMessage(i18n.t('validation.required')),
    body('title').trim().notEmpty().withMessage(i18n.t('validation.name_required')),
    body('titleKy').optional().trim().withMessage(i18n.t('validation.name_required')),
    body('titleEn').optional().trim().withMessage(i18n.t('validation.name_required')),
    body('type').isIn(['TEXT', 'CAROUSEL', 'FEATURES', 'PRICING', 'TESTIMONIALS', 'CTA']).withMessage(i18n.t('validation.invalid_type')),
    body('content').optional().isString().withMessage(i18n.t('validation.invalid_content')),
    body('contentKy').optional().isString().withMessage(i18n.t('validation.invalid_content')),
    body('contentEn').optional().isString().withMessage(i18n.t('validation.invalid_content')),
    body('imageUrl').optional().isURL().withMessage(i18n.t('validation.invalid_url')),
    body('sortOrder').isInt().withMessage(i18n.t('validation.invalid_order')),
    body('isActive').isBoolean().withMessage(i18n.t('validation.invalid_boolean')),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const block = await cmsService.createBlock(req.body);

      res.status(201).json(block);
    } catch (error) {
      console.error('[CREATE BLOCK ERROR]', error);
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Обновить блок (ADMIN)
router.put(
  '/:id',
  authMiddleware,
  requireAdminRole,
  [
    param('id').isInt().withMessage(i18n.t('validation.invalid_id')),
    body('title').optional().trim().withMessage(i18n.t('validation.name_required')),
    body('titleKy').optional().trim().withMessage(i18n.t('validation.name_required')),
    body('titleEn').optional().trim().withMessage(i18n.t('validation.name_required')),
    body('content').optional().isString().withMessage(i18n.t('validation.invalid_content')),
    body('contentKy').optional().isString().withMessage(i18n.t('validation.invalid_content')),
    body('contentEn').optional().isString().withMessage(i18n.t('validation.invalid_content')),
    body('imageUrl').optional().isURL().withMessage(i18n.t('validation.invalid_url')),
    body('sortOrder').optional().isInt().withMessage(i18n.t('validation.invalid_order')),
    body('isActive').optional().isBoolean().withMessage(i18n.t('validation.invalid_boolean')),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const block = await cmsService.updateBlock(parseInt(req.params.id), req.body);

      res.json(block);
    } catch (error) {
      console.error('[UPDATE BLOCK ERROR]', error);
      if (error.message === i18n.t('errors.not_found')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Удалить блок (ADMIN)
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

      await cmsService.deleteBlock(parseInt(req.params.id));

      res.json({ success: true });
    } catch (error) {
      console.error('[DELETE BLOCK ERROR]', error);
      if (error.message === i18n.t('errors.not_found')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Создать карточку (ADMIN)
router.post(
  '/cards',
  authMiddleware,
  requireAdminRole,
  [
    body('blockId').isInt().withMessage(i18n.t('validation.invalid_id')),
    body('title').trim().notEmpty().withMessage(i18n.t('validation.name_required')),
    body('titleKy').optional().trim().withMessage(i18n.t('validation.name_required')),
    body('titleEn').optional().trim().withMessage(i18n.t('validation.name_required')),
    body('description').optional().isString().withMessage(i18n.t('validation.invalid_description')),
    body('descriptionKy').optional().isString().withMessage(i18n.t('validation.invalid_description')),
    body('descriptionEn').optional().isString().withMessage(i18n.t('validation.invalid_description')),
    body('imageUrl').optional().isURL().withMessage(i18n.t('validation.invalid_url')),
    body('sortOrder').isInt().withMessage(i18n.t('validation.invalid_order')),
    body('isActive').isBoolean().withMessage(i18n.t('validation.invalid_boolean')),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const card = await cmsService.createCard(req.body);

      res.status(201).json(card);
    } catch (error) {
      console.error('[CREATE CARD ERROR]', error);
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Обновить карточку (ADMIN)
router.put(
  '/cards/:id',
  authMiddleware,
  requireAdminRole,
  [
    param('id').isInt().withMessage(i18n.t('validation.invalid_id')),
    body('title').optional().trim().withMessage(i18n.t('validation.name_required')),
    body('titleKy').optional().trim().withMessage(i18n.t('validation.name_required')),
    body('titleEn').optional().trim().withMessage(i18n.t('validation.name_required')),
    body('description').optional().isString().withMessage(i18n.t('validation.invalid_description')),
    body('descriptionKy').optional().isString().withMessage(i18n.t('validation.invalid_description')),
    body('descriptionEn').optional().isString().withMessage(i18n.t('validation.invalid_description')),
    body('imageUrl').optional().isURL().withMessage(i18n.t('validation.invalid_url')),
    body('sortOrder').optional().isInt().withMessage(i18n.t('validation.invalid_order')),
    body('isActive').optional().isBoolean().withMessage(i18n.t('validation.invalid_boolean')),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const card = await cmsService.updateCard(parseInt(req.params.id), req.body);

      res.json(card);
    } catch (error) {
      console.error('[UPDATE CARD ERROR]', error);
      if (error.message === i18n.t('errors.not_found')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Удалить карточку (ADMIN)
router.delete(
  '/cards/:id',
  authMiddleware,
  requireAdminRole,
  [param('id').isInt().withMessage(i18n.t('validation.invalid_id'))],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      await cmsService.deleteCard(parseInt(req.params.id));

      res.json({ success: true });
    } catch (error) {
      console.error('[DELETE CARD ERROR]', error);
      if (error.message === i18n.t('errors.not_found')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Создать цитату (ADMIN)
router.post(
  '/quotes',
  authMiddleware,
  requireAdminRole,
  [
    body('text').trim().notEmpty().withMessage(i18n.t('validation.required')),
    body('textKy').optional().trim().withMessage(i18n.t('validation.required')),
    body('textEn').optional().trim().withMessage(i18n.t('validation.required')),
    body('author').optional().trim().withMessage(i18n.t('validation.invalid_author')),
    body('authorKy').optional().trim().withMessage(i18n.t('validation.invalid_author')),
    body('authorEn').optional().trim().withMessage(i18n.t('validation.invalid_author')),
    body('imageUrl').optional().isURL().withMessage(i18n.t('validation.invalid_url')),
    body('isActive').isBoolean().withMessage(i18n.t('validation.invalid_boolean')),
    body('sortOrder').isInt().withMessage(i18n.t('validation.invalid_order')),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const quote = await cmsService.createQuote(req.body);

      res.status(201).json(quote);
    } catch (error) {
      console.error('[CREATE QUOTE ERROR]', error);
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Обновить цитату (ADMIN)
router.put(
  '/quotes/:id',
  authMiddleware,
  requireAdminRole,
  [
    param('id').isInt().withMessage(i18n.t('validation.invalid_id')),
    body('text').optional().trim().withMessage(i18n.t('validation.required')),
    body('textKy').optional().trim().withMessage(i18n.t('validation.required')),
    body('textEn').optional().trim().withMessage(i18n.t('validation.required')),
    body('author').optional().trim().withMessage(i18n.t('validation.invalid_author')),
    body('authorKy').optional().trim().withMessage(i18n.t('validation.invalid_author')),
    body('authorEn').optional().trim().withMessage(i18n.t('validation.invalid_author')),
    body('imageUrl').optional().isURL().withMessage(i18n.t('validation.invalid_url')),
    body('isActive').optional().isBoolean().withMessage(i18n.t('validation.invalid_boolean')),
    body('sortOrder').optional().isInt().withMessage(i18n.t('validation.invalid_order')),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const quote = await cmsService.updateQuote(parseInt(req.params.id), req.body);

      res.json(quote);
    } catch (error) {
      console.error('[UPDATE QUOTE ERROR]', error);
      if (error.message === i18n.t('errors.not_found')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Удалить цитату (ADMIN)
router.delete(
  '/quotes/:id',
  authMiddleware,
  requireAdminRole,
  [param('id').isInt().withMessage(i18n.t('validation.invalid_id'))],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      await cmsService.deleteQuote(parseInt(req.params.id));

      res.json({ success: true });
    } catch (error) {
      console.error('[DELETE QUOTE ERROR]', error);
      if (error.message === i18n.t('errors.not_found')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

export default router;
