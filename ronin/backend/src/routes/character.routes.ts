import { Router } from 'express';
import { param, body, check, validationResult } from 'express-validator';
import { authMiddleware, requireManagerRole, requireAdminRole } from '../middleware/auth';
import { characterService } from '../services/character.service';
import { paymentService } from '../services/payment.service';

const router = Router();

// Получить все персонажи
router.get(
  '/',
  async (req, res) => {
    try {
      const characters = await characterService.findAll();
      res.json(characters);
    } catch (error) {
      console.error('[CHARACTERS ERROR]', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Получить бесплатные персонажи
router.get(
  '/free',
  async (req, res) => {
    try {
      const characters = await characterService.getFreeCharacters();
      res.json(characters);
    } catch (error) {
      console.error('[FREE CHARACTERS ERROR]', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Получить платные персонажи
router.get(
  '/paid',
  async (req, res) => {
    try {
      const characters = await characterService.getPaidCharacters();
      res.json(characters);
    } catch (error) {
      console.error('[PAID CHARACTERS ERROR]', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Получить персонажа по ID
router.get(
  '/:id',
  [param('id').isInt()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const character = await characterService.findById(parseInt(req.params.id));

      res.json(character);
    } catch (error) {
      console.error('[CHARACTER ERROR]', error);
      if (error.message === 'Not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Получить персонажи пользователя
router.get(
  '/user',
  authMiddleware,
  async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const characters = await characterService.getUserCharacters(userId);
      res.json(characters);
    } catch (error) {
      console.error('[USER CHARACTERS ERROR]', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Выбрать основного персонажа
router.post(
  '/user/main',
  authMiddleware,
  [body('characterId').isInt()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = (req as any).user.id;
      const result = await characterService.setMainCharacter(userId, parseInt(req.body.characterId));

      res.json(result);
    } catch (error) {
      console.error('[SET MAIN CHARACTER ERROR]', error);
      if (error.message === 'Character not owned') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Приобрести персонажа
router.post(
  '/:id/purchase',
  authMiddleware,
  [param('id').isInt(), body('paymentMethod').isIn(['ONLINE', 'CASH'])],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = (req as any).user.id;
      const { paymentMethod } = req.body;

      const result = await characterService.purchaseCharacter(
        userId,
        parseInt(req.params.id),
        paymentMethod as 'ONLINE' | 'CASH'
      );

      res.json(result);
    } catch (error) {
      console.error('[PURCHASE CHARACTER ERROR]', error);
      if (error.message === 'Not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Character is free') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Character already owned') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Purchase pending') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Подтвердить покупку персонажа
router.post(
  '/purchase/:id/confirm',
  authMiddleware,
  [param('id').isInt()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await characterService.confirmPurchase(parseInt(req.params.id));

      res.json(result);
    } catch (error) {
      console.error('[CONFIRM PURCHASE ERROR]', error);
      if (error.message === 'Not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Purchase not pending') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Payment required') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Создать персонажа (ADMIN)
router.post(
  '/',
  authMiddleware,
  requireAdminRole,
  [
    body('name').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('imageUrl').optional().isURL(),
    body('price').isInt(),
    body('isFree').isBoolean(),
    body('isActive').isBoolean(),
    body('sortOrder').isInt(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const character = await characterService.createCharacter(req.body);

      res.status(201).json(character);
    } catch (error) {
      console.error('[CREATE CHARACTER ERROR]', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Обновить персонажа (ADMIN)
router.put(
  '/:id',
  authMiddleware,
  requireAdminRole,
  [
    param('id').isInt(),
    body('name').optional().trim(),
    body('description').optional().trim(),
    body('imageUrl').optional().isURL(),
    body('price').optional().isInt(),
    body('isFree').optional().isBoolean(),
    body('isActive').optional().isBoolean(),
    body('sortOrder').optional().isInt(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const character = await characterService.updateCharacter(parseInt(req.params.id), req.body);

      res.json(character);
    } catch (error) {
      console.error('[UPDATE CHARACTER ERROR]', error);
      if (error.message === 'Not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Получить статистику персонажей (ADMIN)
router.get(
  '/stats',
  authMiddleware,
  requireAdminRole,
  async (req, res) => {
    try {
      const stats = await characterService.getStats();
      res.json(stats);
    } catch (error) {
      console.error('[CHARACTER STATS ERROR]', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

export default router;







