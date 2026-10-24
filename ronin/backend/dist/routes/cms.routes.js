"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const cms_service_1 = require("../services/cms.service");
const router = (0, express_1.Router)();
router.get('/blocks', async (req, res) => {
    try {
        const blocks = await cms_service_1.cmsService.getBlocks();
        res.json(blocks);
    }
    catch (error) {
        console.error('[BLOCKS ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/block/:key', [(0, express_validator_1.param)('key').isString()], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const block = await cms_service_1.cmsService.getByKey(req.params.key);
        res.json(block);
    }
    catch (error) {
        console.error('[BLOCK BY KEY ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/cards', async (req, res) => {
    try {
        const cards = await cms_service_1.cmsService.getCards();
        res.json(cards);
    }
    catch (error) {
        console.error('[CARDS ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/quotes', async (req, res) => {
    try {
        const quotes = await cms_service_1.cmsService.getQuotes();
        res.json(quotes);
    }
    catch (error) {
        console.error('[QUOTES ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/landing', async (req, res) => {
    try {
        const content = await cms_service_1.cmsService.getLandingContent();
        res.json(content);
    }
    catch (error) {
        console.error('[LANDING CONTENT ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/', auth_1.authMiddleware, auth_1.requireAdminRole, [
    (0, express_validator_1.body)('key').trim().notEmpty(),
    (0, express_validator_1.body)('title').trim().notEmpty(),
    (0, express_validator_1.body)('titleKy').optional().trim(),
    (0, express_validator_1.body)('titleEn').optional().trim(),
    (0, express_validator_1.body)('type').isIn(['TEXT', 'CAROUSEL', 'FEATURES', 'PRICING', 'TESTIMONIALS', 'CTA']),
    (0, express_validator_1.body)('content').optional().isString(),
    (0, express_validator_1.body)('contentKy').optional().isString(),
    (0, express_validator_1.body)('contentEn').optional().isString(),
    (0, express_validator_1.body)('imageUrl').optional().isURL(),
    (0, express_validator_1.body)('sortOrder').isInt(),
    (0, express_validator_1.body)('isActive').isBoolean(),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const block = await cms_service_1.cmsService.createBlock(req.body);
        res.status(201).json(block);
    }
    catch (error) {
        console.error('[CREATE BLOCK ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.put('/:id', auth_1.authMiddleware, auth_1.requireAdminRole, [
    (0, express_validator_1.param)('id').isInt(),
    (0, express_validator_1.body)('title').optional().trim(),
    (0, express_validator_1.body)('titleKy').optional().trim(),
    (0, express_validator_1.body)('titleEn').optional().trim(),
    (0, express_validator_1.body)('content').optional().isString(),
    (0, express_validator_1.body)('contentKy').optional().isString(),
    (0, express_validator_1.body)('contentEn').optional().isString(),
    (0, express_validator_1.body)('imageUrl').optional().isURL(),
    (0, express_validator_1.body)('sortOrder').optional().isInt(),
    (0, express_validator_1.body)('isActive').optional().isBoolean(),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const block = await cms_service_1.cmsService.updateBlock(parseInt(req.params.id), req.body);
        res.json(block);
    }
    catch (error) {
        console.error('[UPDATE BLOCK ERROR]', error);
        if (error.message === 'Not found') {
            return res.status(404).json({ error: error.message });
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
        await cms_service_1.cmsService.deleteBlock(parseInt(req.params.id));
        res.json({ success: true });
    }
    catch (error) {
        console.error('[DELETE BLOCK ERROR]', error);
        if (error.message === 'Not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/cards', auth_1.authMiddleware, auth_1.requireAdminRole, [
    (0, express_validator_1.body)('blockId').isInt(),
    (0, express_validator_1.body)('title').trim().notEmpty(),
    (0, express_validator_1.body)('titleKy').optional().trim(),
    (0, express_validator_1.body)('titleEn').optional().trim(),
    (0, express_validator_1.body)('description').optional().isString(),
    (0, express_validator_1.body)('descriptionKy').optional().isString(),
    (0, express_validator_1.body)('descriptionEn').optional().isString(),
    (0, express_validator_1.body)('imageUrl').optional().isURL(),
    (0, express_validator_1.body)('sortOrder').isInt(),
    (0, express_validator_1.body)('isActive').isBoolean(),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const card = await cms_service_1.cmsService.createCard(req.body);
        res.status(201).json(card);
    }
    catch (error) {
        console.error('[CREATE CARD ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.put('/cards/:id', auth_1.authMiddleware, auth_1.requireAdminRole, [
    (0, express_validator_1.param)('id').isInt(),
    (0, express_validator_1.body)('title').optional().trim(),
    (0, express_validator_1.body)('titleKy').optional().trim(),
    (0, express_validator_1.body)('titleEn').optional().trim(),
    (0, express_validator_1.body)('description').optional().isString(),
    (0, express_validator_1.body)('descriptionKy').optional().isString(),
    (0, express_validator_1.body)('descriptionEn').optional().isString(),
    (0, express_validator_1.body)('imageUrl').optional().isURL(),
    (0, express_validator_1.body)('sortOrder').optional().isInt(),
    (0, express_validator_1.body)('isActive').optional().isBoolean(),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const card = await cms_service_1.cmsService.updateCard(parseInt(req.params.id), req.body);
        res.json(card);
    }
    catch (error) {
        console.error('[UPDATE CARD ERROR]', error);
        if (error.message === 'Not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.delete('/cards/:id', auth_1.authMiddleware, auth_1.requireAdminRole, [(0, express_validator_1.param)('id').isInt()], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        await cms_service_1.cmsService.deleteCard(parseInt(req.params.id));
        res.json({ success: true });
    }
    catch (error) {
        console.error('[DELETE CARD ERROR]', error);
        if (error.message === 'Not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/quotes', auth_1.authMiddleware, auth_1.requireAdminRole, [
    (0, express_validator_1.body)('text').trim().notEmpty(),
    (0, express_validator_1.body)('textKy').optional().trim(),
    (0, express_validator_1.body)('textEn').optional().trim(),
    (0, express_validator_1.body)('author').optional().trim(),
    (0, express_validator_1.body)('authorKy').optional().trim(),
    (0, express_validator_1.body)('authorEn').optional().trim(),
    (0, express_validator_1.body)('imageUrl').optional().isURL(),
    (0, express_validator_1.body)('isActive').isBoolean(),
    (0, express_validator_1.body)('sortOrder').isInt(),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const quote = await cms_service_1.cmsService.createQuote(req.body);
        res.status(201).json(quote);
    }
    catch (error) {
        console.error('[CREATE QUOTE ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.put('/quotes/:id', auth_1.authMiddleware, auth_1.requireAdminRole, [
    (0, express_validator_1.param)('id').isInt(),
    (0, express_validator_1.body)('text').optional().trim(),
    (0, express_validator_1.body)('textKy').optional().trim(),
    (0, express_validator_1.body)('textEn').optional().trim(),
    (0, express_validator_1.body)('author').optional().trim(),
    (0, express_validator_1.body)('authorKy').optional().trim(),
    (0, express_validator_1.body)('authorEn').optional().trim(),
    (0, express_validator_1.body)('imageUrl').optional().isURL(),
    (0, express_validator_1.body)('isActive').optional().isBoolean(),
    (0, express_validator_1.body)('sortOrder').optional().isInt(),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const quote = await cms_service_1.cmsService.updateQuote(parseInt(req.params.id), req.body);
        res.json(quote);
    }
    catch (error) {
        console.error('[UPDATE QUOTE ERROR]', error);
        if (error.message === 'Not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.delete('/quotes/:id', auth_1.authMiddleware, auth_1.requireAdminRole, [(0, express_validator_1.param)('id').isInt()], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        await cms_service_1.cmsService.deleteQuote(parseInt(req.params.id));
        res.json({ success: true });
    }
    catch (error) {
        console.error('[DELETE QUOTE ERROR]', error);
        if (error.message === 'Not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
