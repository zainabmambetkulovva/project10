"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const computer_service_1 = require("../services/computer.service");
const router = (0, express_1.Router)();
router.get('/', [
    (0, express_validator_1.check)('categoryId').optional().isInt(),
    (0, express_validator_1.check)('status').optional().isIn(['AVAILABLE', 'IN_USE', 'MAINTENANCE']),
    (0, express_validator_1.check)('search').optional().isString(),
    (0, express_validator_1.check)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.check)('limit').optional().isInt({ min: 1, max: 100 }),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { categoryId, status, search, page = '1', limit = '24' } = req.query;
        const computers = await computer_service_1.computerService.findAll({
            categoryId: categoryId ? parseInt(categoryId) : undefined,
            status: status,
            search: search,
        }, parseInt(page), parseInt(limit));
        res.json(computers);
    }
    catch (error) {
        console.error('[COMPUTERS ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/:id', [(0, express_validator_1.param)('id').isInt()], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const computer = await computer_service_1.computerService.findById(parseInt(req.params.id));
        res.json(computer);
    }
    catch (error) {
        console.error('[COMPUTER ERROR]', error);
        if (error.message === 'Not found') {
            return res.status(404).json({ error: 'Not found' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/number/:number', [(0, express_validator_1.param)('number').isInt()], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const computer = await computer_service_1.computerService.findByNumber(parseInt(req.params.number));
        if (!computer) {
            return res.status(404).json({ error: 'Not found' });
        }
        res.json(computer);
    }
    catch (error) {
        console.error('[COMPUTER ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/available', [
    (0, express_validator_1.check)('startsAt').isISO8601(),
    (0, express_validator_1.check)('endsAt').isISO8601(),
    (0, express_validator_1.check)('categoryId').optional().isInt(),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { startsAt, endsAt, categoryId } = req.query;
        const computers = await computer_service_1.computerService.findAvailable(new Date(startsAt), new Date(endsAt), categoryId ? parseInt(categoryId) : undefined);
        res.json({ computers, count: computers.length });
    }
    catch (error) {
        console.error('[AVAILABLE ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/stats', async (req, res) => {
    try {
        const stats = await computer_service_1.computerService.getStats();
        res.json(stats);
    }
    catch (error) {
        console.error('[STATS ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/recommendations', [
    (0, express_validator_1.check)('categoryId').optional().isInt(),
    (0, express_validator_1.check)('durationMinutes').optional().isInt(),
    (0, express_validator_1.check)('budget').optional().isInt(),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { categoryId, durationMinutes, budget } = req.query;
        const recommendations = await computer_service_1.computerService.getRecommendations(categoryId ? parseInt(categoryId) : undefined, durationMinutes ? parseInt(durationMinutes) : undefined, budget ? parseInt(budget) : undefined);
        res.json(recommendations);
    }
    catch (error) {
        console.error('[RECOMMENDATIONS ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/', auth_1.authMiddleware, auth_1.requireManagerRole, [
    (0, express_validator_1.body)('number').isInt(),
    (0, express_validator_1.body)('categoryId').isInt(),
    (0, express_validator_1.body)('specifications').optional().isString(),
    (0, express_validator_1.body)('equipment').optional().isString(),
    (0, express_validator_1.body)('imageUrl').optional().isURL(),
    (0, express_validator_1.body)('status').optional().isIn(['AVAILABLE', 'IN_USE', 'MAINTENANCE']),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const computer = await computer_service_1.computerService.create(req.body);
        res.status(201).json(computer);
    }
    catch (error) {
        console.error('[CREATE ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.put('/:id', auth_1.authMiddleware, auth_1.requireManagerRole, [
    (0, express_validator_1.param)('id').isInt(),
    (0, express_validator_1.body)('categoryId').optional().isInt(),
    (0, express_validator_1.body)('specifications').optional().isString(),
    (0, express_validator_1.body)('equipment').optional().isString(),
    (0, express_validator_1.body)('imageUrl').optional().isURL(),
    (0, express_validator_1.body)('status').optional().isIn(['AVAILABLE', 'IN_USE', 'MAINTENANCE']),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const computer = await computer_service_1.computerService.update(parseInt(req.params.id), req.body);
        res.json(computer);
    }
    catch (error) {
        console.error('[UPDATE ERROR]', error);
        if (error.message === 'Not found') {
            return res.status(404).json({ error: 'Not found' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.patch('/:id/maintenance', auth_1.authMiddleware, auth_1.requireManagerRole, [(0, express_validator_1.param)('id').isInt()], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const computer = await computer_service_1.computerService.setMaintenance(parseInt(req.params.id));
        res.json(computer);
    }
    catch (error) {
        console.error('[MAINTENANCE ERROR]', error);
        if (error.message === 'Not found') {
            return res.status(404).json({ error: 'Not found' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.patch('/:id/activate', auth_1.authMiddleware, auth_1.requireManagerRole, [(0, express_validator_1.param)('id').isInt()], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const computer = await computer_service_1.computerService.setActive(parseInt(req.params.id));
        res.json(computer);
    }
    catch (error) {
        console.error('[ACTIVATE ERROR]', error);
        if (error.message === 'Not found') {
            return res.status(404).json({ error: 'Not found' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.delete('/:id', auth_1.authMiddleware, auth_1.requireAdminRole, [(0, express_validator_1.param)('id').isInt()], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        await computer_service_1.computerService.archive(parseInt(req.params.id));
        res.json({ message: 'Computer archived' });
    }
    catch (error) {
        console.error('[DELETE ERROR]', error);
        if (error.message === 'Not found') {
            return res.status(404).json({ error: 'Not found' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
