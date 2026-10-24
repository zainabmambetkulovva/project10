export declare class CMSService {
    getBlocks(): Promise<any>;
    getByKey(key: string): Promise<any>;
    getCards(): Promise<any>;
    getQuotes(): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        sortOrder: number;
        text: string;
        textKy: string | null;
        textEn: string | null;
        author: string | null;
        authorKy: string | null;
        authorEn: string | null;
    }[]>;
    createBlock(data: {
        key: string;
        title: string;
        titleKy?: string;
        titleEn?: string;
        type: 'TEXT' | 'CAROUSEL' | 'FEATURES' | 'PRICING' | 'TESTIMONIALS' | 'CTA';
        content?: string;
        contentKy?: string;
        contentEn?: string;
        imageUrl?: string;
        sortOrder: number;
        isActive: boolean;
    }): Promise<any>;
    updateBlock(id: number, data: {
        title?: string;
        titleKy?: string;
        titleEn?: string;
        content?: string;
        contentKy?: string;
        contentEn?: string;
        imageUrl?: string;
        sortOrder?: number;
        isActive?: boolean;
    }): Promise<any>;
    deleteBlock(id: number): Promise<{
        success: boolean;
    }>;
    createCard(data: {
        blockId: number;
        title: string;
        titleKy?: string;
        titleEn?: string;
        description?: string;
        descriptionKy?: string;
        descriptionEn?: string;
        imageUrl?: string;
        sortOrder: number;
        isActive: boolean;
    }): Promise<any>;
    updateCard(id: number, data: {
        title?: string;
        titleKy?: string;
        titleEn?: string;
        description?: string;
        descriptionKy?: string;
        descriptionEn?: string;
        imageUrl?: string;
        sortOrder?: number;
        isActive?: boolean;
    }): Promise<any>;
    deleteCard(id: number): Promise<{
        success: boolean;
    }>;
    createQuote(data: {
        text: string;
        textKy?: string;
        textEn?: string;
        author?: string;
        authorKy?: string;
        authorEn?: string;
        imageUrl?: string;
        isActive: boolean;
        sortOrder: number;
    }): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        sortOrder: number;
        text: string;
        textKy: string | null;
        textEn: string | null;
        author: string | null;
        authorKy: string | null;
        authorEn: string | null;
    }>;
    updateQuote(id: number, data: {
        text?: string;
        textKy?: string;
        textEn?: string;
        author?: string;
        authorKy?: string;
        authorEn?: string;
        imageUrl?: string;
        isActive?: boolean;
        sortOrder?: number;
    }): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        imageUrl: string | null;
        sortOrder: number;
        text: string;
        textKy: string | null;
        textEn: string | null;
        author: string | null;
        authorKy: string | null;
        authorEn: string | null;
    }>;
    deleteQuote(id: number): Promise<{
        success: boolean;
    }>;
    getLandingContent(): Promise<{
        blocks: any;
        quotes: {
            id: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            imageUrl: string | null;
            sortOrder: number;
            text: string;
            textKy: string | null;
            textEn: string | null;
            author: string | null;
            authorKy: string | null;
            authorEn: string | null;
        }[];
    }>;
}
export declare const cmsService: CMSService;
//# sourceMappingURL=cms.service.d.ts.map