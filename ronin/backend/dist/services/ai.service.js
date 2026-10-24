"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = exports.AIService = void 0;
const i18n_1 = require("../config/i18n");
const env_1 = require("../config/env");
const computer_service_1 = require("./computer.service");
const tariff_service_1 = require("./tariff.service");
const character_service_1 = require("./character.service");
const cms_service_1 = require("./cms.service");
class AIAdapter {
    async ask(question, context) {
        return {
            answer: `I can help with: ${question}. Context: ${JSON.stringify(context)}`,
            sources: [],
        };
    }
}
class OpenAIAdapter extends AIAdapter {
    constructor() {
        super();
        this.apiKey = env_1.config.OPENAI_API_KEY || '';
        this.model = env_1.config.OPENAI_MODEL || 'gpt-4o-mini';
    }
    async ask(question, context) {
        if (!this.apiKey) {
            throw new Error('OpenAI API key not configured');
        }
        return {
            answer: `OpenAI: ${question}`,
            sources: [],
        };
    }
}
class GeminiAdapter extends AIAdapter {
    constructor() {
        super();
        this.apiKey = env_1.config.GEMINI_API_KEY || '';
        this.model = env_1.config.GEMINI_MODEL || 'gemini-pro';
    }
    async ask(question, context) {
        if (!this.apiKey) {
            throw new Error('Gemini API key not configured');
        }
        return {
            answer: `Gemini: ${question}`,
            sources: [],
        };
    }
}
class AIService {
    constructor() {
        this.adapters = {
            openai: env_1.config.OPENAI_API_KEY ? new OpenAIAdapter() : null,
            gemini: env_1.config.GEMINI_API_KEY ? new GeminiAdapter() : null,
        };
    }
    getAdapter() {
        if (env_1.config.AI_PROVIDER === 'openai') {
            return this.adapters.openai;
        }
        if (env_1.config.AI_PROVIDER === 'gemini') {
            return this.adapters.gemini;
        }
        return null;
    }
    async ask(question, userId) {
        if (!env_1.config.AI_ENABLED || !env_1.config.AI_PROVIDER || env_1.config.AI_PROVIDER === 'none') {
            throw new Error((0, i18n_1.i18n)('ai.disabled'));
        }
        const adapter = this.getAdapter();
        if (!adapter) {
            throw new Error(`AI provider ${env_1.config.AI_PROVIDER} not configured`);
        }
        const context = await this.getContext();
        const result = await adapter.ask(question, context);
        if (userId) {
        }
        return result;
    }
    async getContext() {
        const [computers, tariffs, characters, cmsBlocks] = await Promise.all([
            computer_service_1.computerService.getStats(),
            tariff_service_1.tariffService ? tariff_service_1.tariffService.getStats() : null,
            character_service_1.characterService.getStats(),
            cms_service_1.cmsService.getBlocks(),
        ]);
        return {
            computers,
            tariffs,
            characters,
            cmsBlocks,
            location: (0, i18n_1.i18n)('ai.location'),
            timezone: (0, i18n_1.i18n)('ai.timezone'),
        };
    }
    async getStats() {
        return {
            totalRequests: 0,
            errors: 0,
        };
    }
}
exports.AIService = AIService;
exports.aiService = new AIService();
