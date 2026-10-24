"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const receipt_service_1 = require("../services/receipt.service");
const router = (0, express_1.Router)();
router.post('/:bookingId', auth_1.authMiddleware, [(0, express_validator_1.param)('bookingId').isInt()], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const receipt = await receipt_service_1.receiptService.createReceipt(parseInt(req.params.bookingId));
        res.status(201).json(receipt);
    }
    catch (error) {
        console.error('[CREATE RECEIPT ERROR]', error);
        if (error.message === 'Not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/booking/:bookingId', auth_1.authMiddleware, [(0, express_validator_1.param)('bookingId').isInt()], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const receipt = await receipt_service_1.receiptService.getReceiptByBookingId(parseInt(req.params.bookingId));
        res.json(receipt);
    }
    catch (error) {
        console.error('[GET RECEIPT BY BOOKING ERROR]', error);
        if (error.message === 'Receipt not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/verify/:token', [(0, express_validator_1.param)('token').isString()], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const receipt = await receipt_service_1.receiptService.getReceiptByToken(req.params.token);
        res.json(receipt);
    }
    catch (error) {
        console.error('[VERIFY RECEIPT ERROR]', error);
        if (error.message === 'Receipt not found') {
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
        const receipts = await receipt_service_1.receiptService.getUserReceipts(userId, parseInt(page), parseInt(limit));
        res.json(receipts);
    }
    catch (error) {
        console.error('[USER RECEIPTS ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/:id/status', auth_1.authMiddleware, [(0, express_validator_1.param)('id').isInt()], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const receipt = await receipt_service_1.receiptService.checkReceiptStatus(parseInt(req.params.id));
        res.json(receipt);
    }
    catch (error) {
        console.error('[CHECK RECEIPT ERROR]', error);
        if (error.message === 'Not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.patch('/:id/refund', auth_1.authMiddleware, auth_1.requireManagerRole, [(0, express_validator_1.param)('id').isInt()], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const receipt = await receipt_service_1.receiptService.markAsRefunded(parseInt(req.params.id));
        res.json(receipt);
    }
    catch (error) {
        console.error('[MARK REFUNDED ERROR]', error);
        if (error.message === 'Not found') {
            return res.status(404).json({ error: error.message });
        }
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
        const stats = await receipt_service_1.receiptService.getStats(period);
        res.json(stats);
    }
    catch (error) {
        console.error('[RECEIPT STATS ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
