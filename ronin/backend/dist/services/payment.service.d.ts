export interface PaymentAdapter {
    createPayment(amount: number, currency: string, bookingId?: number, userId: number): Promise<{
        providerPaymentId: string;
        redirectUrl?: string;
    }>;
    verifyPayment(providerPaymentId: string): Promise<{
        status: 'SUCCEEDED' | 'FAILED';
        transactionId?: string;
    }>;
    createRefund(providerPaymentId: string, amount: number): Promise<{
        providerRefundId: string;
    }>;
}
export declare class PaymentService {
    private adapters;
    private getAdapter;
    createPayment(userId: number, amount: number, bookingId?: number, provider?: string, isIdempotent?: boolean, idempotencyKey?: string): Promise<any>;
    verifyPayment(paymentId: number): Promise<{
        status: string;
    }>;
    handleWebhook(provider: string, payload: any, signature: string): Promise<{
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        bookingId: number | null;
        idempotencyKey: string | null;
        amount: number;
        currency: string;
        provider: string;
        providerPaymentId: string | null;
        transactionId: string | null;
        isIdempotent: boolean;
        providerRef: string | null;
        webhookReceived: boolean;
    }>;
    createRefund(paymentId: number, userId: number, reason: string): Promise<{
        refund: {
            payment: never;
            refundedByUser: never;
        } & {
            status: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            paymentId: number;
            amount: number;
            reason: string;
            refundedBy: number;
            providerRefundId: string | null;
            isCashRefund: boolean;
        };
        status: string;
        message: any;
        providerRefundId?: undefined;
    } | {
        refund: {
            payment: never;
            refundedByUser: never;
        } & {
            status: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            paymentId: number;
            amount: number;
            reason: string;
            refundedBy: number;
            providerRefundId: string | null;
            isCashRefund: boolean;
        };
        status: string;
        providerRefundId: string;
        message?: undefined;
    }>;
    getUserPayments(userId: number, page?: number, limit?: number): Promise<{
        items: ({
            booking: never;
            refunds: never;
            receipts: never;
        } & {
            status: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            bookingId: number | null;
            idempotencyKey: string | null;
            amount: number;
            currency: string;
            provider: string;
            providerPaymentId: string | null;
            transactionId: string | null;
            isIdempotent: boolean;
            providerRef: string | null;
            webhookReceived: boolean;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getStats(period?: 'today' | 'week' | 'month'): Promise<{
        byStatus: {};
        refunds: {};
    }>;
}
export declare const paymentService: PaymentService;
//# sourceMappingURL=payment.service.d.ts.map