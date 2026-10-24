import { Router } from 'express';
import { param, body, check, validationResult } from 'express-validator';
import { authMiddleware, requireManagerRole, requireAdminRole } from '../middleware/auth';
import { cmsService } from '../services/cms.service';

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
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Получить блок по ключу
router.get(
  '/block/:key',
  [param('key').isString()],
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
      res.status(500).json({ error: 'Internal Server Error' });
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
      res.status(500).json({ error: 'Internal Server Error' });
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
      res.status(500).json({ error: 'Internal Server Error' });
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
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Создать блок (ADMIN)
router.post(
  '/',
  authMiddleware,
  requireAdminRole,
  [
    body('key').trim().notEmpty(),
    body('title').trim().notEmpty(),
    body('titleKy').optional().trim(),
    body('titleEn').optional().trim(),
    body('type').isIn(['TEXT', 'CAROUSEL', 'FEATURES', 'PRICING', 'TESTIMONIALS', 'CTA']),
    body('content').optional().isString(),
    body('contentKy').optional().isString(),
    body('contentEn').optional().isString(),
    body('imageUrl').optional().isURL(),
    body('sortOrder').isInt(),
    body('isActive').isBoolean(),
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
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Обновить блок (ADMIN)
router.put(
  '/:id',
  authMiddleware,
  requireAdminRole,
  [
    param('id').isInt(),
    body('title').optional().trim(),
    body('titleKy').optional().trim(),
    body('titleEn').optional().trim(),
    body('content').optional().isString(),
    body('contentKy').optional().isString(),
    body('contentEn').optional().isString(),
    body('imageUrl').optional().isURL(),
    body('sortOrder').optional().isInt(),
    body('isActive').optional().isBoolean(),
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
      if (error.message === 'Not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Удалить блок (ADMIN)
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

      await cmsService.deleteBlock(parseInt(req.params.id));

      res.json({ success: true });
    } catch (error) {
      console.error('[DELETE BLOCK ERROR]', error);
      if (error.message === 'Not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Создать карточку (ADMIN)
router.post(
  '/cards',
  authMiddleware,
  requireAdminRole,
  [
    body('blockId').isInt(),
    body('title').trim().notEmpty(),
    body('titleKy').optional().trim(),
    body('titleEn').optional().trim(),
    body('description').optional().isString(),
    body('descriptionKy').optional().isString(),
    body('descriptionEn').optional().isString(),
    body('imageUrl').optional().isURL(),
    body('sortOrder').isInt(),
    body('isActive').isBoolean(),
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
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Обновить карточку (ADMIN)
router.put(
  '/cards/:id',
  authMiddleware,
  requireAdminRole,
  [
    param('id').isInt(),
    body('title').optional().trim(),
    body('titleKy').optional().trim(),
    body('titleEn').optional().trim(),
    body('description').optional().isString(),
    body('descriptionKy').optional().isString(),
    body('descriptionEn').optional().isString(),
    body('imageUrl').optional().isURL(),
    body('sortOrder').optional().isInt(),
    body('isActive').optional().isBoolean(),
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
      if (error.message === 'Not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Удалить карточку (ADMIN)
router.delete(
  '/cards/:id',
  authMiddleware,
  requireAdminRole,
  [param('id').isInt()],
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
      if (error.message === 'Not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Создать цитату (ADMIN)
router.post(
  '/quotes',
  authMiddleware,
  requireAdminRole,
  [
    body('text').trim().notEmpty(),
    body('textKy').optional().trim(),
    body('textEn').optional().trim(),
    body('author').optional().trim(),
    body('authorKy').optional().trim(),
    body('authorEn').optional().trim(),
    body('imageUrl').optional().isURL(),
    body('isActive').isBoolean(),
    body('sortOrder').isInt(),
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
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Обновить цитату (ADMIN)
router.put(
  '/quotes/:id',
  authMiddleware,
  requireAdminRole,
  [
    param('id').isInt(),
    body('text').optional().trim(),
    body('textKy').optional().trim(),
    body('textEn').optional().trim(),
    body('author').optional().trim(),
    body('authorKy').optional().trim(),
    body('authorEn').optional().trim(),
    body('imageUrl').optional().isURL(),
    body('isActive').optional().isBoolean(),
    body('sortOrder').optional().isInt(),
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
      if (error.message === 'Not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Удалить цитату (ADMIN)
router.delete(
  '/quotes/:id',
  authMiddleware,
  requireAdminRole,
  [param('id').isInt()],
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
      if (error.message === 'Not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

export default router;








