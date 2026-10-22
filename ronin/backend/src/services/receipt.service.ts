import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { i18n } from '../config/i18n';

const prisma = new PrismaClient();

export class ReceiptService {
  /**
   * Создать электронный чек
   */
  async createReceipt(bookingId: number) {
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
      throw new Error(i18n.t('errors.not_found'));
    }

    // Проверяем, не создан ли уже чек
    const existingReceipt = await prisma.receipt.findUnique({
      where: { bookingId },
    });

    if (existingReceipt) {
      return existingReceipt;
    }

    // Генерируем уникальный токен для проверки
    const qrToken = uuidv4();
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

  /**
   * Получить чек по ID бронирования
   */
  async getReceiptByBookingId(bookingId: number) {
    const receipt = await prisma.receipt.findUnique({
      where: { bookingId },
      include: {
        booking: { include: { computer: { include: { category: true } }, tariff: true, user: true } },
      },
    });

    if (!receipt) {
      throw new Error(i18n.t('errors.receipt_not_found'));
    }

    return receipt;
  }

  /**
   * Получить чек по токену проверки
   */
  async getReceiptByToken(token: string) {
    const receipt = await prisma.receipt.findUnique({
      where: { qrToken: token },
      include: {
        booking: { include: { computer: { include: { category: true } }, tariff: true } },
      },
    });

    if (!receipt) {
      throw new Error(i18n.t('errors.receipt_not_found'));
    }

    // Не возвращаем персональные данные пользователя
    const publicReceipt = {
      ...receipt,
      booking: {
        ...receipt.booking,
        user: undefined,
      },
    };

    return publicReceipt;
  }

  /**
   * Получить чеки пользователя
   */
  async getUserReceipts(userId: number, page = 1, limit = 20) {
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

  /**
   * Обновить статус чека после возврата
   */
  async markAsRefunded(receiptId: number) {
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

  /**
   * Проверить статус чека
   */
  async checkReceiptStatus(receiptId: number) {
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
      include: {
        booking: true,
      },
    });

    if (!receipt) {
      throw new Error(i18n.t('errors.not_found'));
    }

    // Проверяем, истек ли срок
    if (receipt.booking.endsAt < new Date()) {
      await prisma.receipt.update({
        where: { id: receiptId },
        data: { status: 'EXPIRED' },
      });

      return { ...receipt, status: 'EXPIRED', message: i18n.t('receipts.expired') };
    }

    return receipt;
  }

  /**
   * Получить статистику чеков
   */
  async getStats(period: 'today' | 'week' | 'month' = 'today') {
    const now = new Date();
    let startDate: Date;

    if (period === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
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

export const receiptService = new ReceiptService();
