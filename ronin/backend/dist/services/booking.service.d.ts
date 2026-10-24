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
export declare class BookingService {
    getUserBookings(userId: number, page?: number, limit?: number): Promise<{
        items: ({
            computer: never;
            payment: never;
            tariff: never;
            receipt: never;
            gamingSessions: never;
            manager: never;
        } & {
            status: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            computerId: number;
            tariffId: number;
            startsAt: Date;
            endsAt: Date;
            totalAmount: number;
            paymentMethod: string;
            paymentId: number | null;
            managerId: number | null;
            isCashPayment: boolean;
            notes: string | null;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findById(id: number): Promise<{
        user: never;
        computer: never;
        payment: never;
        tariff: never;
        receipt: never;
        gamingSessions: never;
        manager: never;
    } & {
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        computerId: number;
        tariffId: number;
        startsAt: Date;
        endsAt: Date;
        totalAmount: number;
        paymentMethod: string;
        paymentId: number | null;
        managerId: number | null;
        isCashPayment: boolean;
        notes: string | null;
    }>;
    checkAvailability(computerId: number, startsAt: Date, endsAt: Date): Promise<boolean>;
    createHold(userId: number, computerId: number, startsAt: Date, endsAt: Date, tariffId: number): Promise<any>;
    create(data: BookingCreateData): Promise<{
        user: never;
        computer: never;
        tariff: never;
    } & {
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        computerId: number;
        tariffId: number;
        startsAt: Date;
        endsAt: Date;
        totalAmount: number;
        paymentMethod: string;
        paymentId: number | null;
        managerId: number | null;
        isCashPayment: boolean;
        notes: string | null;
    }>;
    confirmPayment(bookingId: number, paymentId: number): Promise<{
        user: never;
        computer: never;
        payment: never;
        tariff: never;
    } & {
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        computerId: number;
        tariffId: number;
        startsAt: Date;
        endsAt: Date;
        totalAmount: number;
        paymentMethod: string;
        paymentId: number | null;
        managerId: number | null;
        isCashPayment: boolean;
        notes: string | null;
    }>;
    cancel(bookingId: number, userId: number): Promise<{
        user: never;
        computer: never;
        payment: never;
        tariff: never;
        receipt: never;
    } & {
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        computerId: number;
        tariffId: number;
        startsAt: Date;
        endsAt: Date;
        totalAmount: number;
        paymentMethod: string;
        paymentId: number | null;
        managerId: number | null;
        isCashPayment: boolean;
        notes: string | null;
    }>;
    getActiveBookings(): Promise<({
        user: never;
        computer: never;
        tariff: never;
        gamingSessions: never;
        manager: never;
    } & {
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        computerId: number;
        tariffId: number;
        startsAt: Date;
        endsAt: Date;
        totalAmount: number;
        paymentMethod: string;
        paymentId: number | null;
        managerId: number | null;
        isCashPayment: boolean;
        notes: string | null;
    })[]>;
    getManagerBookings(page?: number, limit?: number, filters?: any): Promise<{
        items: ({
            user: never;
            computer: never;
            payment: never;
            tariff: never;
            receipt: never;
            gamingSessions: never;
            manager: never;
        } & {
            status: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            computerId: number;
            tariffId: number;
            startsAt: Date;
            endsAt: Date;
            totalAmount: number;
            paymentMethod: string;
            paymentId: number | null;
            managerId: number | null;
            isCashPayment: boolean;
            notes: string | null;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    updateStatus(bookingId: number, status: string, userId: number): Promise<{
        user: never;
        computer: never;
        tariff: never;
        gamingSessions: never;
    } & {
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        computerId: number;
        tariffId: number;
        startsAt: Date;
        endsAt: Date;
        totalAmount: number;
        paymentMethod: string;
        paymentId: number | null;
        managerId: number | null;
        isCashPayment: boolean;
        notes: string | null;
    }>;
    getStats(period?: 'today' | 'week' | 'month'): Promise<{
        byStatus: {};
        totalRevenue: number;
    }>;
}
export declare const bookingService: BookingService;
//# sourceMappingURL=booking.service.d.ts.map