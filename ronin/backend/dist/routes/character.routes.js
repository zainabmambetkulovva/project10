"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const character_service_1 = require("../services/character.service");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const characters = await character_service_1.characterService.findAll();
        res.json(characters);
    }
    catch (error) {
        console.error('[CHARACTERS ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/free', async (req, res) => {
    try {
        const characters = await character_service_1.characterService.getFreeCharacters();
        res.json(characters);
    }
    catch (error) {
        console.error('[FREE CHARACTERS ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/paid', async (req, res) => {
    try {
        const characters = await character_service_1.characterService.getPaidCharacters();
        res.json(characters);
    }
    catch (error) {
        console.error('[PAID CHARACTERS ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/:id', [(0, express_validator_1.param)('id').isInt()], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const character = await character_service_1.characterService.findById(parseInt(req.params.id));
        res.json(character);
    }
    catch (error) {
        console.error('[CHARACTER ERROR]', error);
        if (error.message === 'Not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/user', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const characters = await character_service_1.characterService.getUserCharacters(userId);
        res.json(characters);
    }
    catch (error) {
        console.error('[USER CHARACTERS ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/user/main', auth_1.authMiddleware, [(0, express_validator_1.body)('characterId').isInt()], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.user.id;
        const result = await character_service_1.characterService.setMainCharacter(userId, parseInt(req.body.characterId));
        res.json(result);
    }
    catch (error) {
        console.error('[SET MAIN CHARACTER ERROR]', error);
        if (error.message === 'Character not owned') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/:id/purchase', auth_1.authMiddleware, [(0, express_validator_1.param)('id').isInt(), (0, express_validator_1.body)('paymentMethod').isIn(['ONLINE', 'CASH'])], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.user.id;
        const { paymentMethod } = req.body;
        const result = await character_service_1.characterService.purchaseCharacter(userId, parseInt(req.params.id), paymentMethod);
        res.json(result);
    }
    catch (error) {
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
});
router.post('/purchase/:id/confirm', auth_1.authMiddleware, [(0, express_validator_1.param)('id').isInt()], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const result = await character_service_1.characterService.confirmPurchase(parseInt(req.params.id));
        res.json(result);
    }
    catch (error) {
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
});
router.post('/', auth_1.authMiddleware, auth_1.requireAdminRole, [
    (0, express_validator_1.body)('name').trim().notEmpty(),
    (0, express_validator_1.body)('description').trim().notEmpty(),
    (0, express_validator_1.body)('imageUrl').optional().isURL(),
    (0, express_validator_1.body)('price').isInt(),
    (0, express_validator_1.body)('isFree').isBoolean(),
    (0, express_validator_1.body)('isActive').isBoolean(),
    (0, express_validator_1.body)('sortOrder').isInt(),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const character = await character_service_1.characterService.createCharacter(req.body);
        res.status(201).json(character);
    }
    catch (error) {
        console.error('[CREATE CHARACTER ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.put('/:id', auth_1.authMiddleware, auth_1.requireAdminRole, [
    (0, express_validator_1.param)('id').isInt(),
    (0, express_validator_1.body)('name').optional().trim(),
    (0, express_validator_1.body)('description').optional().trim(),
    (0, express_validator_1.body)('imageUrl').optional().isURL(),
    (0, express_validator_1.body)('price').optional().isInt(),
    (0, express_validator_1.body)('isFree').optional().isBoolean(),
    (0, express_validator_1.body)('isActive').optional().isBoolean(),
    (0, express_validator_1.body)('sortOrder').optional().isInt(),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const character = await character_service_1.characterService.updateCharacter(parseInt(req.params.id), req.body);
        res.json(character);
    }
    catch (error) {
        console.error('[UPDATE CHARACTER ERROR]', error);
        if (error.message === 'Not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/stats', auth_1.authMiddleware, auth_1.requireAdminRole, async (req, res) => {
    try {
        const stats = await character_service_1.characterService.getStats();
        res.json(stats);
    }
    catch (error) {
        console.error('[CHARACTER STATS ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
