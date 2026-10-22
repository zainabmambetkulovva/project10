import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { i18n } from '../config/i18n';
import { config } from '../config/env';

const prisma = new PrismaClient();

export interface PaymentAdapter {
  createPayment(amount: number, currency: string, bookingId?: number, userId: number): Promise<{ providerPaymentId: string; redirectUrl?: string }>;
  verifyPayment(providerPaymentId: string): Promise<{ status: 'SUCCEEDED' | 'FAILED'; transactionId?: string }>;
  createRefund(providerPaymentId: string, amount: number): Promise<{ providerRefundId: string }>;
}

export class PaymentService {
  private adapters: Record<string, PaymentAdapter | null> = {
    'custom': null,
    'e-pay.kg': null,
    'payme': null,
    'zip': null,
    'chipchap': null,
  };

  /**
   * Получить адаптер платежного провайдера
   */
  private getAdapter(provider: string): PaymentAdapter | null {
    if (provider === 'custom') {
      return null;
    }
    return this.adapters[provider] || null;
  }

  /**
   * Создать платеж
   */
  async createPayment(
    userId: number,
    amount: number,
    bookingId?: number,
    provider: string = config.PAYMENT_PROVIDER || 'custom',
    isIdempotent: boolean = false,
    idempotencyKey?: string
  ) {
    // Проверяем idempotency key
    if (isIdempotent && idempotencyKey) {
      const existing = await prisma.idempotencyKey.findUnique({
        where: { key: idempotencyKey },
      });

      if (existing) {
        // Возвращаем существующий результат
        const result = JSON.parse(existing.result || '{}');
        return result;
      }
    }

    // Проверяем наличие настроек провайдера
    if (provider !== 'custom') {
      const adapter = this.getAdapter(provider);
      if (!adapter) {
        throw new Error(`Payment provider ${provider} not configured`);
      }
    }

    // Создаем платеж
    const payment = await prisma.payment.create({
      data: {
        userId,
        bookingId: bookingId || null,
        amount,
        currency: 'KGS',
        provider: provider as any,
        status: 'PENDING',
        isIdempotent,
        idempotencyKey: idempotencyKey || undefined,
      },
    });

    // Если custom провайдер, сразу подтверждаем
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
        message: i18n.t('payments.custom_success'),
      };
    }

    // Если есть адаптер, создаем платеж через него
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
      } catch (error) {
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
      message: i18n.t('payments.pending'),
    };
  }

  /**
   * Проверить статус платежа
   */
  async verifyPayment(paymentId: number) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error(i18n.t('errors.not_found'));
    }

    if (payment.status !== 'PENDING') {
      return { status: payment.status };
    }

    // Если custom, проверяем через webhook
    if (payment.provider === 'custom') {
      throw new Error(i18n.t('payments.webhook_required'));
    }

    // Если есть адаптер, проверяем через него
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
      } catch (error) {
        console.error('[VERIFY PAYMENT ERROR]', error);
        return { status: 'PENDING' };
      }
    }

    return { status: 'PENDING' };
  }

  /**
   * Обработка webhook от платежного провайдера
   */
  async handleWebhook(provider: string, payload: any, signature: string) {
    // Проверяем подпись webhook
    if (provider === 'custom') {
      // Для custom провайдера проверяем простую подпись
      if (!signature || signature !== config.PAYMENT_WEBHOOK_SECRET) {
        throw new Error(i18n.t('errors.invalid_signature'));
      }
    } else {
      const adapter = this.getAdapter(provider);
      if (adapter) {
        // Проверяем подпись через адаптер
        // Реализация зависит от провайдера
      }
    }

    // Находим платеж по providerPaymentId
    const { payment_id, status, transaction_id } = payload;

    const payment = await prisma.payment.findFirst({
      where: {
        providerPaymentId: payment_id,
        provider,
      },
    });

    if (!payment) {
      throw new Error(i18n.t('errors.payment_not_found'));
    }

    // Обновляем статус
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: status as any,
        transactionId: transaction_id,
        webhookReceived: true,
      },
    });

    return updatedPayment;
  }

  /**
   * Создать возврат
   */
  async createRefund(paymentId: number, userId: number, reason: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { refunds: true, booking: true },
    });

    if (!payment) {
      throw new Error(i18n.t('errors.not_found'));
    }

    if (payment.status !== 'SUCCEEDED') {
      throw new Error(i18n.t('errors.payment_not_completed'));
    }

    // Проверяем, сколько можно вернуть
    const refundedAmount = payment.refunds.reduce((sum, r) => sum + r.amount, 0);
    const refundableAmount = payment.amount - refundedAmount;

    if (refundableAmount <= 0) {
      throw new Error(i18n.t('errors.no_refundable_amount'));
    }

    // Создаем возврат
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

    // Если custom провайдер, сразу подтверждаем возврат
    if (payment.provider === 'custom') {
      await prisma.refund.update({
        where: { id: refund.id },
        data: {
          status: 'SUCCEEDED',
          providerRefundId: `custom-refund-${refund.id}-${Date.now()}`,
        },
      });

      // Обновляем статус чека
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
        message: i18n.t('refunds.custom_success'),
      };
    }

    // Если есть адаптер, создаем возврат через него
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
      } catch (error) {
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
      message: i18n.t('refunds.pending'),
    };
  }

  /**
   * Получить историю платежей пользователя
   */
  async getUserPayments(userId: number, page = 1, limit = 20) {
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

  /**
   * Получить статистику платежей
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

export const paymentService = new PaymentService();
