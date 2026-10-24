export declare class AIService {
    private adapters;
    private getAdapter;
    ask(question: string, userId?: number): Promise<{
        answer: string;
        sources: string[];
    }>;
    private getContext;
    getStats(): Promise<{
        totalRequests: number;
        errors: number;
    }>;
}
export declare const aiService: AIService;
//# sourceMappingURL=ai.service.d.ts.map