"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const ai_service_1 = require("../services/ai.service");
const router = (0, express_1.Router)();
router.post('/ask', auth_1.authMiddleware, [
    (0, express_validator_1.body)('question').trim().notEmpty(),
    (0, express_validator_1.body)('question').isLength({ max: 1000 }),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.user.id;
        const { question } = req.body;
        const result = await ai_service_1.aiService.ask(question, userId);
        res.json(result);
    }
    catch (error) {
        console.error('[AI ASK ERROR]', error);
        if (error.message === 'AI disabled') {
            return res.status(400).json({ error: error.message });
        }
        if (error.message === `AI provider ${req.body.provider} not configured`) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/stats', auth_1.authMiddleware, async (req, res) => {
    try {
        const stats = await ai_service_1.aiService.getStats();
        res.json(stats);
    }
    catch (error) {
        console.error('[AI STATS ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
