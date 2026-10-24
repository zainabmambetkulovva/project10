"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gamingSessionService = exports.GamingSessionService = void 0;
const client_1 = require("@prisma/client");
const i18n_1 = require("../config/i18n");
const prisma = new client_1.PrismaClient();
class GamingSessionService {
    async getActiveSessions() {
        const sessions = await prisma.gamingSession.findMany({
            where: { status: 'ACTIVE' },
            include: {
                booking: { include: { user: true, computer: true, tariff: true } },
                computer: { include: { category: true } },
                startedByUser: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: {
                startedAt: 'desc',
            },
        });
        return sessions.map(session => {
            const endTime = new Date(session.startedAt.getTime() + session.booking.tariff.durationMinutes * 60 * 1000);
            const now = new Date();
            const remaining = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 60000));
            return {
                ...session,
                remainingMinutes: remaining,
                endTime,
            };
        });
    }
    async findById(id) {
        const session = await prisma.gamingSession.findUnique({
            where: { id },
            include: {
                booking: { include: { user: true, computer: { include: { category: true } }, tariff: true } },
                computer: true,
                startedByUser: { select: { id: true, firstName: true, lastName: true } },
                endedByUser: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        if (!session) {
            throw new Error((0, i18n_1.i18n)('errors.not_found'));
        }
        return session;
    }
    async startSession(bookingId, computerId, startedBy) {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { computer: true, status: true },
        });
        if (!booking) {
            throw new Error((0, i18n_1.i18n)('errors.booking_not_found'));
        }
        if (booking.status !== 'CONFIRMED' && booking.status !== 'ACTIVE') {
            throw new Error((0, i18n_1.i18n)('errors.booking_not_confirmed'));
        }
        if (booking.computerId !== computerId) {
            throw new Error((0, i18n_1.i18n)('errors.computer_mismatch'));
        }
        const existingSession = await prisma.gamingSession.findFirst({
            where: {
                bookingId,
                status: 'ACTIVE',
            },
        });
        if (existingSession) {
            throw new Error((0, i18n_1.i18n)('errors.session_already_started'));
        }
        const session = await prisma.gamingSession.create({
            data: {
                bookingId,
                computerId,
                startedAt: new Date(),
                status: 'ACTIVE',
                startedBy,
            },
            include: {
                startedByUser: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        await prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'ACTIVE' },
        });
        await prisma.computer.update({
            where: { id: computerId },
            data: { status: 'IN_USE' },
        });
        return session;
    }
    async endSession(sessionId, endedBy) {
        const session = await prisma.gamingSession.findUnique({
            where: { id: sessionId },
            include: {
                booking: true,
                computer: true,
                startedByUser: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        if (!session) {
            throw new Error((0, i18n_1.i18n)('errors.not_found'));
        }
        if (session.status !== 'ACTIVE') {
            throw new Error((0, i18n_1.i18n)('errors.session_not_active'));
        }
        const updatedSession = await prisma.gamingSession.update({
            where: { id: sessionId },
            data: {
                status: 'COMPLETED',
                endedAt: new Date(),
                endedBy,
            },
            include: {
                endedByUser: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        if (session.booking.endsAt <= new Date()) {
            await prisma.booking.update({
                where: { id: session.bookingId },
                data: { status: 'COMPLETED' },
            });
        }
        else {
            await prisma.booking.update({
                where: { id: session.bookingId },
                data: { status: 'ACTIVE' },
            });
        }
        await prisma.computer.update({
            where: { id: session.computerId },
            data: { status: 'AVAILABLE' },
        });
        return updatedSession;
    }
    async endExpiredSessions() {
        const sessions = await prisma.gamingSession.findMany({
            where: {
                status: 'ACTIVE',
                startedAt: {
                    lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
                },
            },
            include: {
                booking: true,
                computer: true,
            },
        });
        for (const session of sessions) {
            if (session.booking.endsAt <= new Date()) {
                try {
                    await this.endSession(session.id, 0);
                }
                catch (error) {
                    console.error(`[EXPIRED SESSION ERROR] ${session.id}:`, error);
                }
            }
        }
        return { processed: sessions.length };
    }
    async getUserSessions(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const sessions = await prisma.gamingSession.findMany({
            where: {
                booking: { userId },
            },
            skip,
            take: limit,
            include: {
                booking: { include: { computer: true, tariff: true } },
                computer: true,
                startedByUser: { select: { id: true, firstName: true, lastName: true } },
                endedByUser: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: {
                startedAt: 'desc',
            },
        });
        const total = await prisma.gamingSession.count({
            where: {
                booking: { userId },
            },
        });
        return {
            items: sessions,
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
        const stats = await prisma.gamingSession.groupBy({
            by: ['status'],
            where: {
                createdAt: { gte: startDate },
            },
            _count: true,
        });
        const activeCount = await prisma.gamingSession.count({
            where: { status: 'ACTIVE' },
        });
        return {
            byStatus: stats.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
            activeCount,
        };
    }
}
exports.GamingSessionService = GamingSessionService;
exports.gamingSessionService = new GamingSessionService();
