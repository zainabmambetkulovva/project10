"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const session_service_1 = require("../services/session.service");
const router = (0, express_1.Router)();
router.get('/active', auth_1.authMiddleware, auth_1.requireManagerRole, async (req, res) => {
    try {
        const sessions = await session_service_1.gamingSessionService.getActiveSessions();
        res.json(sessions);
    }
    catch (error) {
        console.error('[ACTIVE SESSIONS ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/:id', auth_1.authMiddleware, [(0, express_validator_1.param)('id').isInt()], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const session = await session_service_1.gamingSessionService.findById(parseInt(req.params.id));
        res.json(session);
    }
    catch (error) {
        console.error('[GET SESSION ERROR]', error);
        if (error.message === 'Not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/user', auth_1.authMiddleware, [
    (0, express_validator_1.check)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.check)('limit').optional().isInt({ min: 1, max: 100 }),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.user.id;
        const { page = '1', limit = '20' } = req.query;
        const sessions = await session_service_1.gamingSessionService.getUserSessions(userId, parseInt(page), parseInt(limit));
        res.json(sessions);
    }
    catch (error) {
        console.error('[USER SESSIONS ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/start', auth_1.authMiddleware, auth_1.requireManagerRole, [
    (0, express_validator_1.body)('bookingId').isInt(),
    (0, express_validator_1.body)('computerId').isInt(),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.user.id;
        const { bookingId, computerId } = req.body;
        const session = await session_service_1.gamingSessionService.startSession(parseInt(bookingId), parseInt(computerId), userId);
        res.status(201).json(session);
    }
    catch (error) {
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
});
router.post('/:id/end', auth_1.authMiddleware, auth_1.requireManagerRole, [(0, express_validator_1.param)('id').isInt()], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.user.id;
        const session = await session_service_1.gamingSessionService.endSession(parseInt(req.params.id), userId);
        res.json(session);
    }
    catch (error) {
        console.error('[END SESSION ERROR]', error);
        if (error.message === 'Not found') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'Session not active') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/end-expired', auth_1.authMiddleware, auth_1.requireAdminRole, async (req, res) => {
    try {
        const result = await session_service_1.gamingSessionService.endExpiredSessions();
        res.json(result);
    }
    catch (error) {
        console.error('[END EXPIRED SESSIONS ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/stats', auth_1.authMiddleware, auth_1.requireManagerRole, [(0, express_validator_1.check)('period').optional().isIn(['today', 'week', 'month'])], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { period = 'today' } = req.query;
        const stats = await session_service_1.gamingSessionService.getStats(period);
        res.json(stats);
    }
    catch (error) {
        console.error('[SESSION STATS ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
