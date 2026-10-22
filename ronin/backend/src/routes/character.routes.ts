import { Router } from 'express';
import { param, body, check, validationResult } from 'express-validator';
import { authMiddleware, requireManagerRole, requireAdminRole } from '../middleware/auth';
import { characterService } from '../services/character.service';
import { paymentService } from '../services/payment.service';
import { i18n } from '../config/i18n';

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
      res.status(500).json({ error: i18n.t('errors.internal_error') });
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
      res.status(500).json({ error: i18n.t('errors.internal_error') });
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
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Получить персонажа по ID
router.get(
  '/:id',
  [param('id').isInt().withMessage(i18n.t('validation.invalid_id'))],
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
      if (error.message === i18n.t('errors.not_found')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: i18n.t('errors.internal_error') });
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
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Выбрать основного персонажа
router.post(
  '/user/main',
  authMiddleware,
  [body('characterId').isInt().withMessage(i18n.t('validation.invalid_id'))],
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
      if (error.message === i18n.t('errors.character_not_owned')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Приобрести персонажа
router.post(
  '/:id/purchase',
  authMiddleware,
  [param('id').isInt().withMessage(i18n.t('validation.invalid_id')), body('paymentMethod').isIn(['ONLINE', 'CASH']).withMessage(i18n.t('validation.invalid_payment_method'))],
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
      if (error.message === i18n.t('errors.not_found')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === i18n.t('errors.character_free')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === i18n.t('errors.character_already_owned')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === i18n.t('errors.purchase_pending')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Подтвердить покупку персонажа
router.post(
  '/purchase/:id/confirm',
  authMiddleware,
  [param('id').isInt().withMessage(i18n.t('validation.invalid_id'))],
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
      if (error.message === i18n.t('errors.not_found')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === i18n.t('errors.purchase_not_pending')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === i18n.t('errors.payment_required')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Создать персонажа (ADMIN)
router.post(
  '/',
  authMiddleware,
  requireAdminRole,
  [
    body('name').trim().notEmpty().withMessage(i18n.t('validation.name_required')),
    body('description').trim().notEmpty().withMessage(i18n.t('validation.required')),
    body('imageUrl').optional().isURL().withMessage(i18n.t('validation.invalid_url')),
    body('price').isInt().withMessage(i18n.t('validation.invalid_price')),
    body('isFree').isBoolean().withMessage(i18n.t('validation.invalid_boolean')),
    body('isActive').isBoolean().withMessage(i18n.t('validation.invalid_boolean')),
    body('sortOrder').isInt().withMessage(i18n.t('validation.invalid_order')),
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
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

// Обновить персонажа (ADMIN)
router.put(
  '/:id',
  authMiddleware,
  requireAdminRole,
  [
    param('id').isInt().withMessage(i18n.t('validation.invalid_id')),
    body('name').optional().trim().withMessage(i18n.t('validation.name_required')),
    body('description').optional().trim().withMessage(i18n.t('validation.required')),
    body('imageUrl').optional().isURL().withMessage(i18n.t('validation.invalid_url')),
    body('price').optional().isInt().withMessage(i18n.t('validation.invalid_price')),
    body('isFree').optional().isBoolean().withMessage(i18n.t('validation.invalid_boolean')),
    body('isActive').optional().isBoolean().withMessage(i18n.t('validation.invalid_boolean')),
    body('sortOrder').optional().isInt().withMessage(i18n.t('validation.invalid_order')),
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
      if (error.message === i18n.t('errors.not_found')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: i18n.t('errors.internal_error') });
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
      res.status(500).json({ error: i18n.t('errors.internal_error') });
    }
  }
);

export default router;
