"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = exports.PaymentService = void 0;
const client_1 = require("@prisma/client");
const i18n_1 = require("../config/i18n");
const env_1 = require("../config/env");
const prisma = new client_1.PrismaClient();
class PaymentService {
    constructor() {
        this.adapters = {
            'custom': null,
            'e-pay.kg': null,
            'payme': null,
            'zip': null,
            'chipchap': null,
        };
    }
    getAdapter(provider) {
        if (provider === 'custom') {
            return null;
        }
        return this.adapters[provider] || null;
    }
    async createPayment(userId, amount, bookingId, provider = env_1.config.PAYMENT_PROVIDER || 'custom', isIdempotent = false, idempotencyKey) {
        if (isIdempotent && idempotencyKey) {
            const existing = await prisma.idempotencyKey.findUnique({
                where: { key: idempotencyKey },
            });
            if (existing) {
                const result = JSON.parse(existing.result || '{}');
                return result;
            }
        }
        if (provider !== 'custom') {
            const adapter = this.getAdapter(provider);
            if (!adapter) {
                throw new Error(`Payment provider ${provider} not configured`);
            }
        }
        const payment = await prisma.payment.create({
            data: {
                userId,
                bookingId: bookingId || null,
                amount,
                currency: 'KGS',
                provider: provider,
                status: 'PENDING',
                isIdempotent,
                idempotencyKey: idempotencyKey || undefined,
            },
        });
        if (provider === 'custom') {
            await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: 'SUCCEEDED',
                    providerPaymentId: `custom-${payment.id}-${Date.now()}`,
                    transactionId: `custom-${payment.id}-${Date.now()}`,
                },
            });
            return {
                payment,
                status: 'SUCCEEDED',
                message: (0, i18n_1.i18n)('payments.custom_success'),
            };
        }
        const adapter = this.getAdapter(provider);
        if (adapter) {
            try {
                const result = await adapter.createPayment(amount, 'KGS', bookingId, userId);
                await prisma.payment.update({
                    where: { id: payment.id },
                    data: {
                        providerPaymentId: result.providerPaymentId,
                    },
                });
                return {
                    payment,
                    status: 'PENDING',
                    redirectUrl: result.redirectUrl,
                    providerPaymentId: result.providerPaymentId,
                };
            }
            catch (error) {
                await prisma.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: 'FAILED',
                    },
                });
                throw error;
            }
        }
        return {
            payment,
            status: 'PENDING',
            message: (0, i18n_1.i18n)('payments.pending'),
        };
    }
    async verifyPayment(paymentId) {
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
        });
        if (!payment) {
            throw new Error((0, i18n_1.i18n)('errors.not_found'));
        }
        if (payment.status !== 'PENDING') {
            return { status: payment.status };
        }
        if (payment.provider === 'custom') {
            throw new Error((0, i18n_1.i18n)('payments.webhook_required'));
        }
        const adapter = this.getAdapter(payment.provider);
        if (adapter && payment.providerPaymentId) {
            try {
                const result = await adapter.verifyPayment(payment.providerPaymentId);
                await prisma.payment.update({
                    where: { id: paymentId },
                    data: {
                        status: result.status,
                        transactionId: result.transactionId || payment.id.toString(),
                    },
                });
                return { status: result.status };
            }
            catch (error) {
                console.error('[VERIFY PAYMENT ERROR]', error);
                return { status: 'PENDING' };
            }
        }
        return { status: 'PENDING' };
    }
    async handleWebhook(provider, payload, signature) {
        if (provider === 'custom') {
            if (!signature || signature !== env_1.config.PAYMENT_WEBHOOK_SECRET) {
                throw new Error((0, i18n_1.i18n)('errors.invalid_signature'));
            }
        }
        else {
            const adapter = this.getAdapter(provider);
            if (adapter) {
            }
        }
        const { payment_id, status, transaction_id } = payload;
        const payment = await prisma.payment.findFirst({
            where: {
                providerPaymentId: payment_id,
                provider,
            },
        });
        if (!payment) {
            throw new Error((0, i18n_1.i18n)('errors.payment_not_found'));
        }
        const updatedPayment = await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: status,
                transactionId: transaction_id,
                webhookReceived: true,
            },
        });
        return updatedPayment;
    }
    async createRefund(paymentId, userId, reason) {
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: { refunds: true, booking: true },
        });
        if (!payment) {
            throw new Error((0, i18n_1.i18n)('errors.not_found'));
        }
        if (payment.status !== 'SUCCEEDED') {
            throw new Error((0, i18n_1.i18n)('errors.payment_not_completed'));
        }
        const refundedAmount = payment.refunds.reduce((sum, r) => sum + r.amount, 0);
        const refundableAmount = payment.amount - refundedAmount;
        if (refundableAmount <= 0) {
            throw new Error((0, i18n_1.i18n)('errors.no_refundable_amount'));
        }
        const refund = await prisma.refund.create({
            data: {
                paymentId,
                amount: refundableAmount,
                reason,
                refundedBy: userId,
                status: 'PENDING',
            },
            include: {
                payment: true,
                refundedByUser: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        if (payment.provider === 'custom') {
            await prisma.refund.update({
                where: { id: refund.id },
                data: {
                    status: 'SUCCEEDED',
                    providerRefundId: `custom-refund-${refund.id}-${Date.now()}`,
                },
            });
            if (payment.bookingId) {
                await prisma.receipt.updateMany({
                    where: { bookingId: payment.bookingId },
                    data: {
                        status: 'REFUNDED',
                        refundedAt: new Date(),
                    },
                });
            }
            return {
                refund,
                status: 'SUCCEEDED',
                message: (0, i18n_1.i18n)('refunds.custom_success'),
            };
        }
        const adapter = this.getAdapter(payment.provider);
        if (adapter) {
            try {
                const result = await adapter.createRefund(payment.providerPaymentId, refundableAmount);
                await prisma.refund.update({
                    where: { id: refund.id },
                    data: {
                        providerRefundId: result.providerRefundId,
                    },
                });
                return {
                    refund,
                    status: 'PENDING',
                    providerRefundId: result.providerRefundId,
                };
            }
            catch (error) {
                await prisma.refund.update({
                    where: { id: refund.id },
                    data: {
                        status: 'FAILED',
                    },
                });
                throw error;
            }
        }
        return {
            refund,
            status: 'PENDING',
            message: (0, i18n_1.i18n)('refunds.pending'),
        };
    }
    async getUserPayments(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const payments = await prisma.payment.findMany({
            where: { userId },
            skip,
            take: limit,
            include: {
                booking: { include: { computer: { include: { category: true } }, tariff: true } },
                refunds: true,
                receipts: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        const total = await prisma.payment.count({ where: { userId } });
        return {
            items: payments,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getStats(period = 'today') {
        const now = new Date();
        let startDate;
        if (period === 'today') {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }
        else if (period === 'week') {
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }
        else {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        const stats = await prisma.payment.groupBy({
            by: ['status'],
            where: {
                createdAt: { gte: startDate },
            },
            _count: true,
            _sum: { amount: true },
        });
        const refunds = await prisma.refund.groupBy({
            by: ['status'],
            where: {
                createdAt: { gte: startDate },
            },
            _count: true,
            _sum: { amount: true },
        });
        return {
            byStatus: stats.reduce((acc, s) => ({ ...acc, [s.status]: { count: s._count, amount: s._sum.amount || 0 } }), {}),
            refunds: refunds.reduce((acc, s) => ({ ...acc, [s.status]: { count: s._count, amount: s._sum.amount || 0 } }), {}),
        };
    }
}
exports.PaymentService = PaymentService;
exports.paymentService = new PaymentService();
