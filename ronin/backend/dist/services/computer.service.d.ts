export interface ComputerFilter {
    categoryId?: number;
    status?: string;
    search?: string;
    minSpecifications?: string;
}
export interface ComputerRecommendation {
    type: 'BEST' | 'OPTIMAL' | 'POWERFUL' | 'SUITABLE';
    computerId: number;
    reason: string;
    reasonKy?: string;
    reasonEn?: string;
}
export declare class ComputerService {
    findAll(filter?: ComputerFilter, page?: number, limit?: number): Promise<{
        items: ({
            category: never;
        } & {
            number: number;
            status: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            equipment: string | null;
            specifications: string | null;
            categoryId: number;
            imageUrl: string | null;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findById(id: number): Promise<{
        category: never;
        bookings: never;
    } & {
        number: number;
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        equipment: string | null;
        specifications: string | null;
        categoryId: number;
        imageUrl: string | null;
    }>;
    findByNumber(number: number): Promise<({
        category: never;
    } & {
        number: number;
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        equipment: string | null;
        specifications: string | null;
        categoryId: number;
        imageUrl: string | null;
    }) | null>;
    findAvailable(startsAt: Date, endsAt: Date, categoryId?: number): Promise<({
        category: never;
    } & {
        number: number;
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        equipment: string | null;
        specifications: string | null;
        categoryId: number;
        imageUrl: string | null;
    })[]>;
    isComputerAvailable(computerId: number, startsAt: Date, endsAt: Date): Promise<boolean>;
    getStats(): Promise<{
        total: number;
        available: number;
        inUse: number;
        maintenance: number;
        byCategory: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.ComputerGroupByOutputType, "categoryId"[]> & {
            _count: number;
        })[];
    }>;
    getRecommendations(categoryId?: number, durationMinutes?: number, budget?: number): Promise<ComputerRecommendation[]>;
    create(data: {
        number: number;
        categoryId: number;
        specifications?: string;
        equipment?: string;
        imageUrl?: string;
        status?: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
    }): Promise<{
        category: never;
    } & {
        number: number;
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        equipment: string | null;
        specifications: string | null;
        categoryId: number;
        imageUrl: string | null;
    }>;
    update(id: number, data: {
        categoryId?: number;
        specifications?: string;
        equipment?: string;
        imageUrl?: string;
        status?: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
    }): Promise<{
        category: never;
    } & {
        number: number;
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        equipment: string | null;
        specifications: string | null;
        categoryId: number;
        imageUrl: string | null;
    }>;
    setMaintenance(id: number): Promise<{
        category: never;
    } & {
        number: number;
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        equipment: string | null;
        specifications: string | null;
        categoryId: number;
        imageUrl: string | null;
    }>;
    setActive(id: number): Promise<{
        category: never;
    } & {
        number: number;
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        equipment: string | null;
        specifications: string | null;
        categoryId: number;
        imageUrl: string | null;
    }>;
    archive(id: number): Promise<{
        number: number;
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        equipment: string | null;
        specifications: string | null;
        categoryId: number;
        imageUrl: string | null;
    }>;
}
export declare const computerService: ComputerService;
//# sourceMappingURL=computer.service.d.ts.map