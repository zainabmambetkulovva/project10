"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const client_1 = require("@prisma/client");
const i18n_1 = require("../config/i18n");
const prisma = new client_1.PrismaClient();
class NotificationService {
    async createNotification(userId, title, message, type, link) {
        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                link: link || null,
            },
        });
        return notification;
    }
    async getUserNotifications(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const notifications = await prisma.notification.findMany({
            where: { userId },
            skip,
            take: limit,
            orderBy: {
                createdAt: 'desc',
            },
        });
        const total = await prisma.notification.count({ where: { userId } });
        return {
            items: notifications,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getUnreadCount(userId) {
        const count = await prisma.notification.count({
            where: {
                userId,
                isRead: false,
            },
        });
        return count;
    }
    async markAsRead(notificationId, userId) {
        const notification = await prisma.notification.findFirst({
            where: { id: notificationId, userId },
        });
        if (!notification) {
            throw new Error((0, i18n_1.i18n)('errors.not_found'));
        }
        await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true, readAt: new Date() },
        });
        return { success: true };
    }
    async markAllAsRead(userId) {
        await prisma.notification.updateMany({
            where: { userId },
            data: { isRead: true, readAt: new Date() },
        });
        return { success: true };
    }
    async deleteNotification(notificationId, userId) {
        const notification = await prisma.notification.findFirst({
            where: { id: notificationId, userId },
        });
        if (!notification) {
            throw new Error((0, i18n_1.i18n)('errors.not_found'));
        }
        await prisma.notification.delete({
            where: { id: notificationId },
        });
        return { success: true };
    }
    async notifyBookingCreated(bookingId, userId) {
        return this.createNotification(userId, (0, i18n_1.i18n)('notifications.booking_created_title'), (0, i18n_1.i18n)('notifications.booking_created_message'), 'BOOKING_CONFIRMED', `/app/booking/${bookingId}`);
    }
    async notifySessionEnded(bookingId, userId) {
        return this.createNotification(userId, (0, i18n_1.i18n)('notifications.session_ended_title'), (0, i18n_1.i18n)('notifications.session_ended_message'), 'SESSION_ENDED', `/app/receipts`);
    }
    async notifyPaymentSuccess(paymentId, userId) {
        return this.createNotification(userId, (0, i18n_1.i18n)('notifications.payment_success_title'), (0, i18n_1.i18n)('notifications.payment_success_message'), 'PAYMENT_SUCCESS', `/app/receipts`);
    }
    async notifyPaymentFailed(paymentId, userId) {
        return this.createNotification(userId, (0, i18n_1.i18n)('notifications.payment_failed_title'), (0, i18n_1.i18n)('notifications.payment_failed_message'), 'PAYMENT_FAILED', `/app/purchases`);
    }
}
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
