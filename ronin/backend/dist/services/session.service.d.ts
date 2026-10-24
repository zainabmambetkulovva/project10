export declare class GamingSessionService {
    getActiveSessions(): Promise<{
        remainingMinutes: number;
        endTime: Date;
        computer: never;
        booking: never;
        startedByUser: never;
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        computerId: number;
        bookingId: number;
        startedAt: Date;
        endedAt: Date | null;
        startedBy: number;
        endedBy: number | null;
    }[]>;
    findById(id: number): Promise<{
        computer: never;
        booking: never;
        startedByUser: never;
        endedByUser: never;
    } & {
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        computerId: number;
        bookingId: number;
        startedAt: Date;
        endedAt: Date | null;
        startedBy: number;
        endedBy: number | null;
    }>;
    startSession(bookingId: number, computerId: number, startedBy: number): Promise<{
        startedByUser: never;
    } & {
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        computerId: number;
        bookingId: number;
        startedAt: Date;
        endedAt: Date | null;
        startedBy: number;
        endedBy: number | null;
    }>;
    endSession(sessionId: number, endedBy: number): Promise<{
        endedByUser: never;
    } & {
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        computerId: number;
        bookingId: number;
        startedAt: Date;
        endedAt: Date | null;
        startedBy: number;
        endedBy: number | null;
    }>;
    endExpiredSessions(): Promise<{
        processed: number;
    }>;
    getUserSessions(userId: number, page?: number, limit?: number): Promise<{
        items: {
            status: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            computerId: number;
            bookingId: number;
            startedAt: Date;
            endedAt: Date | null;
            startedBy: number;
            endedBy: number | null;
        }[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getStats(period?: 'today' | 'week' | 'month'): Promise<{
        byStatus: {};
        activeCount: number;
    }>;
}
export declare const gamingSessionService: GamingSessionService;
//# sourceMappingURL=session.service.d.ts.map