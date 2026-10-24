"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const booking_service_1 = require("../services/booking.service");
const receipt_service_1 = require("../services/receipt.service");
const router = (0, express_1.Router)();
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
        const bookings = await booking_service_1.bookingService.getUserBookings(userId, parseInt(page), parseInt(limit));
        res.json(bookings);
    }
    catch (error) {
        console.error('[USER BOOKINGS ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/', auth_1.authMiddleware, auth_1.requireManagerRole, [
    (0, express_validator_1.check)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.check)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.check)('status').optional().isIn(['PENDING_PAYMENT', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED']),
    (0, express_validator_1.check)('search').optional().isString(),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { page = '1', limit = '20', status, search } = req.query;
        const bookings = await booking_service_1.bookingService.getManagerBookings(parseInt(page), parseInt(limit), { status, search });
        res.json(bookings);
    }
    catch (error) {
        console.error('[MANAGER BOOKINGS ERROR]', error);
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
        const stats = await booking_service_1.bookingService.getStats(period);
        res.json(stats);
    }
    catch (error) {
        console.error('[STATS ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/active', auth_1.authMiddleware, auth_1.requireManagerRole, async (req, res) => {
    try {
        const bookings = await booking_service_1.bookingService.getActiveBookings();
        res.json(bookings);
    }
    catch (error) {
        console.error('[ACTIVE BOOKINGS ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/', auth_1.authMiddleware, [
    (0, express_validator_1.body)('computerId').isInt(),
    (0, express_validator_1.body)('tariffId').isInt(),
    (0, express_validator_1.body)('startsAt').isISO8601(),
    (0, express_validator_1.body)('endsAt').isISO8601(),
    (0, express_validator_1.body)('paymentMethod').isIn(['ONLINE', 'CASH']),
    (0, express_validator_1.body)('managerId').optional().isInt(),
    (0, express_validator_1.body)('notes').optional().isString(),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.user.id;
        const { computerId, tariffId, startsAt, endsAt, paymentMethod, managerId, notes } = req.body;
        const booking = await booking_service_1.bookingService.create({
            userId,
            computerId,
            tariffId,
            startsAt: new Date(startsAt),
            endsAt: new Date(endsAt),
            paymentMethod: paymentMethod,
            managerId: managerId ? parseInt(managerId) : undefined,
            notes: notes || undefined,
        });
        res.status(201).json(booking);
    }
    catch (error) {
        console.error('[CREATE BOOKING ERROR]', error);
        if (error.message === 'Computer under maintenance') {
            return res.status(400).json({ error: error.message });
        }
        if (error.message === 'Computer unavailable') {
            return res.status(400).json({ error: error.message });
        }
        if (error.message === 'Tariff not found') {
            return res.status(400).json({ error: error.message });
        }
        if (error.message === 'Tariff inactive') {
            return res.status(400).json({ error: error.message });
        }
        if (error.message === 'Tariff category mismatch') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/:id/confirm-payment', auth_1.authMiddleware, auth_1.requireManagerRole, [(0, express_validator_1.param)('id').isInt()], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const booking = await booking_service_1.bookingService.confirmPayment(parseInt(req.params.id), 0);
        await receipt_service_1.receiptService.createReceipt(booking.id);
        res.json(booking);
    }
    catch (error) {
        console.error('[CONFIRM PAYMENT ERROR]', error);
        if (error.message === 'Not found') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'Booking not pending') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/:id/cancel', auth_1.authMiddleware, [(0, express_validator_1.param)('id').isInt()], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.user.id;
        const booking = await booking_service_1.bookingService.cancel(parseInt(req.params.id), userId);
        res.json(booking);
    }
    catch (error) {
        console.error('[CANCEL BOOKING ERROR]', error);
        if (error.message === 'Not found') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'Forbidden') {
            return res.status(403).json({ error: error.message });
        }
        if (error.message === 'Cannot cancel') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.patch('/:id/status', auth_1.authMiddleware, auth_1.requireManagerRole, [(0, express_validator_1.param)('id').isInt(), (0, express_validator_1.body)('status').isIn(['PENDING_PAYMENT', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED'])], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const booking = await booking_service_1.bookingService.updateStatus(parseInt(req.params.id), req.body.status, req.user.id);
        res.json(booking);
    }
    catch (error) {
        console.error('[UPDATE STATUS ERROR]', error);
        if (error.message === 'Not found') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'Invalid status transition') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = router;
