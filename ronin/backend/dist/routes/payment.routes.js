"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const payment_service_1 = require("../services/payment.service");
const router = (0, express_1.Router)();
router.post('/', auth_1.authMiddleware, [
    (0, express_validator_1.body)('amount').isInt(),
    (0, express_validator_1.body)('bookingId').optional().isInt(),
    (0, express_validator_1.body)('provider').optional().isIn(['custom', 'e-pay.kg', 'payme', 'zip', 'chipchap']),
    (0, express_validator_1.body)('isIdempotent').optional().isBoolean(),
    (0, express_validator_1.body)('idempotencyKey').optional().isString(),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.user.id;
        const { amount, bookingId, provider = 'custom', isIdempotent = false, idempotencyKey } = req.body;
        const result = await payment_service_1.paymentService.createPayment(userId, amount, bookingId ? parseInt(bookingId) : undefined, provider, isIdempotent, idempotencyKey);
        res.status(201).json(result);
    }
    catch (error) {
        console.error('[CREATE PAYMENT ERROR]', error);
        if (error.message === `Payment provider ${req.body.provider} not configured`) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/:id/verify', auth_1.authMiddleware, [(0, express_validator_1.param)('id').isInt()], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const result = await payment_service_1.paymentService.verifyPayment(parseInt(req.params.id));
        res.json(result);
    }
    catch (error) {
        console.error('[VERIFY PAYMENT ERROR]', error);
        if (error.message === 'Not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/webhook', [(0, express_validator_1.body)('provider').isIn(['custom', 'e-pay.kg', 'payme', 'zip', 'chipchap'])], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { provider } = req.body;
        const signature = req.headers['x-payment-signature'] || '';
        const payment = await payment_service_1.paymentService.handleWebhook(provider, req.body, signature);
        res.json(payment);
    }
    catch (error) {
        console.error('[WEBHOOK ERROR]', error);
        if (error.message === 'Invalid signature') {
            return res.status(401).json({ error: error.message });
        }
        if (error.message === 'Payment not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/:id/refund', auth_1.authMiddleware, auth_1.requireManagerRole, [(0, express_validator_1.param)('id').isInt(), (0, express_validator_1.body)('reason').notEmpty()], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.user.id;
        const result = await payment_service_1.paymentService.createRefund(parseInt(req.params.id), userId, req.body.reason);
        res.json(result);
    }
    catch (error) {
        console.error('[CREATE REFUND ERROR]', error);
        if (error.message === 'Not found') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'Payment not completed') {
            return res.status(400).json({ error: error.message });
        }
        if (error.message === 'No refundable amount') {
            return res.status(400).json({ error: error.message });
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
        const payments = await payment_service_1.paymentService.getUserPayments(userId, parseInt(page), parseInt(limit));
        res.json(payments);
    }
    catch (error) {
        console.error('[USER PAYMENTS ERROR]', error);
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
        const stats = await payment_service_1.paymentService.getStats(period);
        res.json(stats);
    }
    catch (error) {
        console.error('[PAYMENT STATS ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
