import { PrismaClient } from '@prisma/client';
import { i18n } from '../config/i18n';
import { computerService } from './computer.service';
import { paymentService } from './payment.service';

const prisma = new PrismaClient();

export interface BookingCreateData {
  userId: number;
  computerId: number;
  tariffId: number;
  startsAt: Date;
  endsAt: Date;
  paymentMethod: 'ONLINE' | 'CASH';
  isCashPayment?: boolean;
  managerId?: number;
  notes?: string;
}

export interface BookingUpdateData {
  status?: string;
  totalAmount?: number;
  notes?: string;
}

export class BookingService {
  /**
   * Получить бронирования пользователя
   */
  async getUserBookings(userId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const bookings = await prisma.booking.findMany({
      where: { userId },
      skip,
      take: limit,
      include: {
        computer: { include: { category: true } },
        tariff: true,
        payment: true,
        receipt: true,
        gamingSessions: true,
        manager: true,
      },
      orderBy: {
        startsAt: 'desc',
      },
    });

    const total = await prisma.booking.count({ where: { userId } });

    return {
      items: bookings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Получить бронирование по ID
   */
  async findById(id: number) {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
        computer: { include: { category: true } },
        tariff: true,
        payment: true,
        receipt: true,
        gamingSessions: true,
        manager: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!booking) {
      throw new Error(i18n('errors.not_found'));
    }

    return booking;
  }

  /**
   * Проверить доступность компьютера
   */
  async checkAvailability(computerId: number, startsAt: Date, endsAt: Date): Promise<boolean> {
    // Проверяем активные бронирования
    const existingBooking = await prisma.booking.findFirst({
      where: {
        computerId,
        status: {
          in: ['PENDING_PAYMENT', 'CONFIRMED', 'ACTIVE'],
        },
        OR: [
          {
            startsAt: { lte: endsAt },
            endsAt: { gt: startsAt },
          },
          {
            startsAt: { lt: endsAt },
            endsAt: { gte: endsAt },
          },
        ],
      },
    });

    if (existingBooking) {
      return false;
    }

    // Проверяем активные сессии
    const existingSession = await prisma.gamingSession.findFirst({
      where: {
        computerId,
        status: 'ACTIVE',
        startedAt: { lte: endsAt },
        endedAt: null,
      },
    });

    if (existingSession) {
      return false;
    }

    return true;
  }

  /**
   * Создать временное удержание бронирования
   */
  async createHold(userId: number, computerId: number, startsAt: Date, endsAt: Date, tariffId: number) {
    const hold = await prisma.bookingHold.create({
      data: {
        userId,
        computerId,
        tariffId,
        startsAt,
        endsAt,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 минут
      },
    });

    return hold;
  }

  /**
   * Создать бронирование
   */
  async create(data: BookingCreateData) {
    // Проверяем компьютер
    const computer = await computerService.findById(data.computerId);
    
    if (computer.status === 'MAINTENANCE') {
      throw new Error(i18n('errors.computer_maintenance'));
    }

    // Проверяем доступность
    const isAvailable = await this.checkAvailability(data.computerId, data.startsAt, data.endsAt);
    if (!isAvailable) {
      throw new Error(i18n('errors.computer_unavailable'));
    }

    // Проверяем тариф
    const tariff = await prisma.tariff.findUnique({
      where: { id: data.tariffId },
    });

    if (!tariff) {
      throw new Error(i18n('errors.tariff_not_found'));
    }

    if (!tariff.isActive) {
      throw new Error(i18n('errors.tariff_inactive'));
    }

    if (tariff.categoryId !== computer.categoryId) {
      throw new Error(i18n('errors.tariff_category_mismatch'));
    }

    // Рассчитываем стоимость
    const durationMinutes = Math.ceil((data.endsAt.getTime() - data.startsAt.getTime()) / (1000 * 60));
    const totalAmount = Math.ceil((durationMinutes / tariff.durationMinutes) * tariff.price);

    // Создаем бронирование
    const booking = await prisma.booking.create({
      data: {
        userId: data.userId,
        computerId: data.computerId,
        tariffId: data.tariffId,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        totalAmount,
        status: data.paymentMethod === 'CASH' ? 'CONFIRMED' : 'PENDING_PAYMENT',
        paymentMethod: data.paymentMethod,
        managerId: data.managerId,
        isCashPayment: data.isCashPayment,
        notes: data.notes,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, phone: true } },
        computer: { include: { category: true } },
        tariff: true,
      },
    });

    return booking;
  }

  /**
   * Подтвердить бронирование после оплаты
   */
  async confirmPayment(bookingId: number, paymentId: number) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error(i18n('errors.not_found'));
    }

    if (booking.status !== 'PENDING_PAYMENT') {
      throw new Error(i18n('errors.booking_not_pending'));
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        paymentId,
      },
      include: {
        user: true,
        computer: { include: { category: true } },
        tariff: true,
        payment: true,
      },
    });

    return updatedBooking;
  }

  /**
   * Отменить бронирование
   */
  async cancel(bookingId: number, userId: number) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true, payment: true, receipt: true },
    });

    if (!booking) {
      throw new Error(i18n('errors.not_found'));
    }

    if (booking.userId !== userId && booking.managerId !== userId) {
      throw new Error(i18n('errors.forbidden'));
    }

    if (booking.status !== 'PENDING_PAYMENT' && booking.status !== 'CONFIRMED') {
      throw new Error(i18n('errors.cannot_cancel'));
    }

    // Если есть оплата, создаем возврат
    if (booking.paymentId) {
      await paymentService.createRefund(booking.paymentId, userId, i18n('refunds.booking_cancelled'));
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
      },
      include: {
        user: true,
        computer: true,
        tariff: true,
        payment: true,
        receipt: true,
      },
    });

    return updatedBooking;
  }

  /**
   * Получить активные бронирования
   */
  async getActiveBookings() {
    const bookings = await prisma.booking.findMany({
      where: {
        status: {
          in: ['CONFIRMED', 'ACTIVE'],
        },
        startsAt: { lte: new Date() },
        endsAt: { gte: new Date() },
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, phone: true } },
        computer: { include: { category: true } },
        tariff: true,
        gamingSessions: true,
        manager: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: {
        startsAt: 'asc',
      },
    });

    return bookings;
  }

  /**
   * Получить бронирования для менеджера
   */
  async getManagerBookings(page = 1, limit = 20, filters: any = {}) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { user: { firstName: { contains: filters.search, mode: 'insensitive' } } },
        { user: { lastName: { contains: filters.search, mode: 'insensitive' } } },
        { computer: { number: { contains: filters.search } } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
        computer: { include: { category: true } },
        tariff: true,
        payment: true,
        receipt: true,
        gamingSessions: true,
        manager: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: {
        startsAt: 'desc',
      },
    });

    const total = await prisma.booking.count({ where });

    return {
      items: bookings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Обновить статус бронирования
   */
  async updateStatus(bookingId: number, status: string, userId: number) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error(i18n('errors.not_found'));
    }

    // Валидация переходов статусов
    const allowedTransitions: any = {
      'PENDING_PAYMENT': ['CONFIRMED', 'CANCELLED', 'EXPIRED'],
      'CONFIRMED': ['ACTIVE', 'CANCELLED', 'COMPLETED'],
      'ACTIVE': ['COMPLETED'],
    };

    if (allowedTransitions[booking.status] && !allowedTransitions[booking.status].includes(status)) {
      throw new Error(i18n('errors.invalid_status_transition'));
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        user: true,
        computer: true,
        tariff: true,
        gamingSessions: true,
      },
    });

    return updatedBooking;
  }

  /**
   * Получить статистику бронирований
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

    const stats = await prisma.booking.groupBy({
      by: ['status'],
      where: {
        createdAt: { gte: startDate },
      },
      _count: true,
    });

    const totalRevenue = await prisma.booking.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate },
      },
    });

    return {
      byStatus: stats.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
      totalRevenue: totalRevenue._sum.totalAmount || 0,
    };
  }
}

export const bookingService = new BookingService();

