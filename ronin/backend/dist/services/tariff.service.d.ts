export declare class TariffService {
    findAll(): Promise<({
        category: never;
    } & {
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        categoryId: number;
        durationMinutes: number;
        nameKy: string | null;
        nameEn: string | null;
        description: string | null;
        price: number;
        sortOrder: number;
    })[]>;
    findById(id: number): Promise<{
        category: never;
    } & {
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        categoryId: number;
        durationMinutes: number;
        nameKy: string | null;
        nameEn: string | null;
        description: string | null;
        price: number;
        sortOrder: number;
    }>;
    findByCategoryId(categoryId: number): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        categoryId: number;
        durationMinutes: number;
        nameKy: string | null;
        nameEn: string | null;
        description: string | null;
        price: number;
        sortOrder: number;
    }[]>;
    findByNameAndCategory(name: string, categoryId: number): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        categoryId: number;
        durationMinutes: number;
        nameKy: string | null;
        nameEn: string | null;
        description: string | null;
        price: number;
        sortOrder: number;
    } | null>;
    create(data: {
        name: string;
        nameKy?: string;
        nameEn?: string;
        description?: string;
        descriptionKy?: string;
        descriptionEn?: string;
        durationMinutes: number;
        price: number;
        categoryId: number;
        isActive: boolean;
        sortOrder: number;
    }): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        categoryId: number;
        durationMinutes: number;
        nameKy: string | null;
        nameEn: string | null;
        description: string | null;
        price: number;
        sortOrder: number;
    }>;
    update(id: number, data: {
        name?: string;
        nameKy?: string;
        nameEn?: string;
        description?: string;
        descriptionKy?: string;
        descriptionEn?: string;
        durationMinutes?: number;
        price?: number;
        categoryId?: number;
        isActive?: boolean;
        sortOrder?: number;
    }): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        categoryId: number;
        durationMinutes: number;
        nameKy: string | null;
        nameEn: string | null;
        description: string | null;
        price: number;
        sortOrder: number;
    }>;
    getStats(): Promise<{
        total: number;
        active: number;
        byCategory: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.TariffGroupByOutputType, "categoryId"[]> & {
            _count: number;
        })[];
    }>;
}
export declare const tariffService: TariffService;
//# sourceMappingURL=tariff.service.d.ts.map