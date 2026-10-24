"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiptService = exports.ReceiptService = void 0;
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const i18n_1 = require("../config/i18n");
const prisma = new client_1.PrismaClient();
class ReceiptService {
    async createReceipt(bookingId) {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
                computer: { include: { category: true } },
                tariff: true,
                payment: true,
            },
        });
        if (!booking) {
            throw new Error((0, i18n_1.i18n)('errors.not_found'));
        }
        const existingReceipt = await prisma.receipt.findUnique({
            where: { bookingId },
        });
        if (existingReceipt) {
            return existingReceipt;
        }
        const qrToken = (0, uuid_1.v4)();
        const receiptNumber = `R-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const receipt = await prisma.receipt.create({
            data: {
                bookingId,
                receiptNumber,
                qrToken,
                amount: booking.totalAmount,
                status: 'VALID',
            },
            include: {
                booking: { include: { computer: { include: { category: true } }, tariff: true } },
            },
        });
        return receipt;
    }
    async getReceiptByBookingId(bookingId) {
        const receipt = await prisma.receipt.findUnique({
            where: { bookingId },
            include: {
                booking: { include: { computer: { include: { category: true } }, tariff: true, user: true } },
            },
        });
        if (!receipt) {
            throw new Error((0, i18n_1.i18n)('errors.receipt_not_found'));
        }
        return receipt;
    }
    async getReceiptByToken(token) {
        const receipt = await prisma.receipt.findUnique({
            where: { qrToken: token },
            include: {
                booking: { include: { computer: { include: { category: true } }, tariff: true } },
            },
        });
        if (!receipt) {
            throw new Error((0, i18n_1.i18n)('errors.receipt_not_found'));
        }
        const publicReceipt = {
            ...receipt,
            booking: {
                ...receipt.booking,
                user: undefined,
            },
        };
        return publicReceipt;
    }
    async getUserReceipts(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const receipts = await prisma.receipt.findMany({
            where: {
                booking: { userId },
            },
            skip,
            take: limit,
            include: {
                booking: { include: { computer: { include: { category: true } }, tariff: true } },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        const total = await prisma.receipt.count({
            where: {
                booking: { userId },
            },
        });
        return {
            items: receipts,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    async markAsRefunded(receiptId) {
        const receipt = await prisma.receipt.update({
            where: { id: receiptId },
            data: {
                status: 'REFUNDED',
                refundedAt: new Date(),
            },
            include: {
                booking: { include: { computer: { include: { category: true } }, tariff: true } },
            },
        });
        return receipt;
    }
    async checkReceiptStatus(receiptId) {
        const receipt = await prisma.receipt.findUnique({
            where: { id: receiptId },
            include: {
                booking: true,
            },
        });
        if (!receipt) {
            throw new Error((0, i18n_1.i18n)('errors.not_found'));
        }
        if (receipt.booking.endsAt < new Date()) {
            await prisma.receipt.update({
                where: { id: receiptId },
                data: { status: 'EXPIRED' },
            });
            return { ...receipt, status: 'EXPIRED', message: (0, i18n_1.i18n)('receipts.expired') };
        }
        return receipt;
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
        const stats = await prisma.receipt.groupBy({
            by: ['status'],
            where: {
                createdAt: { gte: startDate },
            },
            _count: true,
            _sum: { amount: true },
        });
        return {
            byStatus: stats.reduce((acc, s) => ({ ...acc, [s.status]: { count: s._count, amount: s._sum.amount || 0 } }), {}),
            total: stats.reduce((sum, s) => sum + s._count, 0),
            totalAmount: stats.reduce((sum, s) => sum + (s._sum.amount || 0), 0),
        };
    }
}
exports.ReceiptService = ReceiptService;
exports.receiptService = new ReceiptService();
