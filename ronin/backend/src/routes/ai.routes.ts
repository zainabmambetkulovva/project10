import { Router } from 'express';
import { body, check, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/auth';
import { aiService } from '../services/ai.service';

const router = Router();

// Задать вопрос AI
router.post(
  '/ask',
  authMiddleware,
  [
    body('question').trim().notEmpty(),
    body('question').isLength({ max: 1000 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = (req as any).user.id;
      const { question } = req.body;

      const result = await aiService.ask(question, userId);

      res.json(result);
    } catch (error) {
      console.error('[AI ASK ERROR]', error);
      if (error.message === 'AI disabled') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === `AI provider ${req.body.provider} not configured`) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Получить статистику AI запросов
router.get(
  '/stats',
  authMiddleware,
  async (req, res) => {
    try {
      const stats = await aiService.getStats();
      res.json(stats);
    } catch (error) {
      console.error('[AI STATS ERROR]', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

export default router;








