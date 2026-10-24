export declare class NotificationService {
    createNotification(userId: number, title: string, message: string, type: 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED' | 'SESSION_STARTED' | 'SESSION_ENDED' | 'REFUND_PROCESSED' | 'CHARACTER_PURCHASED' | 'OTHER', link?: string): Promise<{
        message: string;
        type: string;
        id: number;
        createdAt: Date;
        userId: number;
        link: string | null;
        title: string;
        titleKy: string | null;
        titleEn: string | null;
        messageKy: string | null;
        messageEn: string | null;
        isRead: boolean;
        readAt: Date | null;
    }>;
    getUserNotifications(userId: number, page?: number, limit?: number): Promise<{
        items: {
            message: string;
            type: string;
            id: number;
            createdAt: Date;
            userId: number;
            link: string | null;
            title: string;
            titleKy: string | null;
            titleEn: string | null;
            messageKy: string | null;
            messageEn: string | null;
            isRead: boolean;
            readAt: Date | null;
        }[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getUnreadCount(userId: number): Promise<number>;
    markAsRead(notificationId: number, userId: number): Promise<{
        success: boolean;
    }>;
    markAllAsRead(userId: number): Promise<{
        success: boolean;
    }>;
    deleteNotification(notificationId: number, userId: number): Promise<{
        success: boolean;
    }>;
    notifyBookingCreated(bookingId: number, userId: number): Promise<{
        message: string;
        type: string;
        id: number;
        createdAt: Date;
        userId: number;
        link: string | null;
        title: string;
        titleKy: string | null;
        titleEn: string | null;
        messageKy: string | null;
        messageEn: string | null;
        isRead: boolean;
        readAt: Date | null;
    }>;
    notifySessionEnded(bookingId: number, userId: number): Promise<{
        message: string;
        type: string;
        id: number;
        createdAt: Date;
        userId: number;
        link: string | null;
        title: string;
        titleKy: string | null;
        titleEn: string | null;
        messageKy: string | null;
        messageEn: string | null;
        isRead: boolean;
        readAt: Date | null;
    }>;
    notifyPaymentSuccess(paymentId: number, userId: number): Promise<{
        message: string;
        type: string;
        id: number;
        createdAt: Date;
        userId: number;
        link: string | null;
        title: string;
        titleKy: string | null;
        titleEn: string | null;
        messageKy: string | null;
        messageEn: string | null;
        isRead: boolean;
        readAt: Date | null;
    }>;
    notifyPaymentFailed(paymentId: number, userId: number): Promise<{
        message: string;
        type: string;
        id: number;
        createdAt: Date;
        userId: number;
        link: string | null;
        title: string;
        titleKy: string | null;
        titleEn: string | null;
        messageKy: string | null;
        messageEn: string | null;
        isRead: boolean;
        readAt: Date | null;
    }>;
}
export declare const notificationService: NotificationService;
//# sourceMappingURL=notification.service.d.ts.map