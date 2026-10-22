import { PrismaClient } from '@prisma/client';
import { i18n } from '../config/i18n';

const prisma = new PrismaClient();

export class NotificationService {
  /**
   * Создать уведомление
   */
  async createNotification(
    userId: number,
    title: string,
    message: string,
    type: 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED' | 'SESSION_STARTED' | 'SESSION_ENDED' | 'REFUND_PROCESSED' | 'CHARACTER_PURCHASED' | 'OTHER',
    link?: string
  ) {
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

  /**
   * Получить уведомления пользователя
   */
  async getUserNotifications(userId: number, page = 1, limit = 20) {
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

  /**
   * Получить непрочитанные уведомления
   */
  async getUnreadCount(userId: number) {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return count;
  }

  /**
   * Пометить уведомление как прочитанное
   */
  async markAsRead(notificationId: number, userId: number) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error(i18n.t('errors.not_found'));
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });

    return { success: true };
  }

  /**
   * Пометить все уведомления как прочитанные
   */
  async markAllAsRead(userId: number) {
    await prisma.notification.updateMany({
      where: { userId },
      data: { isRead: true, readAt: new Date() },
    });

    return { success: true };
  }

  /**
   * Удалить уведомление
   */
  async deleteNotification(notificationId: number, userId: number) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error(i18n.t('errors.not_found'));
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return { success: true };
  }

  /**
   * Создать уведомление о бронировании
   */
  async notifyBookingCreated(bookingId: number, userId: number) {
    return this.createNotification(
      userId,
      i18n.t('notifications.booking_created_title'),
      i18n.t('notifications.booking_created_message'),
      'BOOKING_CONFIRMED',
      `/app/booking/${bookingId}`
    );
  }

  /**
   * Создать уведомление об окончании сессии
   */
  async notifySessionEnded(bookingId: number, userId: number) {
    return this.createNotification(
      userId,
      i18n.t('notifications.session_ended_title'),
      i18n.t('notifications.session_ended_message'),
      'SESSION_ENDED',
      `/app/receipts`
    );
  }

  /**
   * Создать уведомление об оплате
   */
  async notifyPaymentSuccess(paymentId: number, userId: number) {
    return this.createNotification(
      userId,
      i18n.t('notifications.payment_success_title'),
      i18n.t('notifications.payment_success_message'),
      'PAYMENT_SUCCESS',
      `/app/receipts`
    );
  }

  /**
   * Создать уведомление об ошибке оплаты
   */
  async notifyPaymentFailed(paymentId: number, userId: number) {
    return this.createNotification(
      userId,
      i18n.t('notifications.payment_failed_title'),
      i18n.t('notifications.payment_failed_message'),
      'PAYMENT_FAILED',
      `/app/purchases`
    );
  }
}

export const notificationService = new NotificationService();
