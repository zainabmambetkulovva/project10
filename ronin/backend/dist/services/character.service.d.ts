export declare class CharacterService {
    findAll(): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        imageUrl: string | null;
        description: string;
        price: number;
        sortOrder: number;
        isFree: boolean;
    }[]>;
    findById(id: number): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        imageUrl: string | null;
        description: string;
        price: number;
        sortOrder: number;
        isFree: boolean;
    }>;
    getFreeCharacters(): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        imageUrl: string | null;
        description: string;
        price: number;
        sortOrder: number;
        isFree: boolean;
    }[]>;
    getPaidCharacters(): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        imageUrl: string | null;
        description: string;
        price: number;
        sortOrder: number;
        isFree: boolean;
    }[]>;
    getUserCharacters(userId: number): Promise<any>;
    setMainCharacter(userId: number, characterId: number): Promise<{
        success: boolean;
    }>;
    purchaseCharacter(userId: number, characterId: number, paymentMethod: 'ONLINE' | 'CASH', paymentId?: number): Promise<{
        success: boolean;
        message: any;
        purchaseId?: undefined;
        payment?: undefined;
    } | {
        success: boolean;
        purchaseId: any;
        payment: any;
        message: any;
    } | {
        success: boolean;
        purchaseId: any;
        message: any;
        payment?: undefined;
    }>;
    confirmPurchase(purchaseId: number): Promise<{
        success: boolean;
    }>;
    createCharacter(data: {
        name: string;
        description: string;
        imageUrl?: string;
        price: number;
        isFree: boolean;
        isActive: boolean;
        sortOrder: number;
    }): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        imageUrl: string | null;
        description: string;
        price: number;
        sortOrder: number;
        isFree: boolean;
    }>;
    updateCharacter(id: number, data: {
        name?: string;
        description?: string;
        imageUrl?: string;
        price?: number;
        isFree?: boolean;
        isActive?: boolean;
        sortOrder?: number;
    }): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        imageUrl: string | null;
        description: string;
        price: number;
        sortOrder: number;
        isFree: boolean;
    }>;
    getStats(): Promise<{
        total: number;
        free: number;
        paid: number;
        active: number;
    }>;
}
export declare const characterService: CharacterService;
//# sourceMappingURL=character.service.d.ts.map