export declare class ReceiptService {
    createReceipt(bookingId: number): Promise<{
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        bookingId: number;
        amount: number;
        receiptNumber: string;
        qrToken: string;
        qrUrl: string | null;
        isRefunded: boolean;
        refundedAt: Date | null;
    }>;
    getReceiptByBookingId(bookingId: number): Promise<{
        booking: never;
    } & {
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        bookingId: number;
        amount: number;
        receiptNumber: string;
        qrToken: string;
        qrUrl: string | null;
        isRefunded: boolean;
        refundedAt: Date | null;
    }>;
    getReceiptByToken(token: string): Promise<{
        booking: any;
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        bookingId: number;
        amount: number;
        receiptNumber: string;
        qrToken: string;
        qrUrl: string | null;
        isRefunded: boolean;
        refundedAt: Date | null;
    }>;
    getUserReceipts(userId: number, page?: number, limit?: number): Promise<{
        items: {
            status: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            bookingId: number;
            amount: number;
            receiptNumber: string;
            qrToken: string;
            qrUrl: string | null;
            isRefunded: boolean;
            refundedAt: Date | null;
        }[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    markAsRefunded(receiptId: number): Promise<{
        booking: never;
    } & {
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        bookingId: number;
        amount: number;
        receiptNumber: string;
        qrToken: string;
        qrUrl: string | null;
        isRefunded: boolean;
        refundedAt: Date | null;
    }>;
    checkReceiptStatus(receiptId: number): Promise<({
        booking: never;
    } & {
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        bookingId: number;
        amount: number;
        receiptNumber: string;
        qrToken: string;
        qrUrl: string | null;
        isRefunded: boolean;
        refundedAt: Date | null;
    }) | {
        status: string;
        message: any;
        booking: never;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        bookingId: number;
        amount: number;
        receiptNumber: string;
        qrToken: string;
        qrUrl: string | null;
        isRefunded: boolean;
        refundedAt: Date | null;
    }>;
    getStats(period?: 'today' | 'week' | 'month'): Promise<{
        byStatus: {};
        total: number;
        totalAmount: number;
    }>;
}
export declare const receiptService: ReceiptService;
//# sourceMappingURL=receipt.service.d.ts.map