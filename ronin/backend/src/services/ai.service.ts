import { i18n } from '../config/i18n';
import { config } from '../config/env';
import { computerService } from './computer.service';
import { tariffService } from './tariff.service';
import { bookingService } from './booking.service';
import { characterService } from './character.service';
import { cmsService } from './cms.service';

// Имитация AI адаптеров
class AIAdapter {
  async ask(question: string, context: any): Promise<{ answer: string; sources: string[] }> {
    return {
      answer: `I can help with: ${question}. Context: ${JSON.stringify(context)}`,
      sources: [],
    };
  }
}

class OpenAIAdapter extends AIAdapter {
  private apiKey: string;
  private model: string;

  constructor() {
    super();
    this.apiKey = config.OPENAI_API_KEY || '';
    this.model = config.OPENAI_MODEL || 'gpt-4o-mini';
  }

  async ask(question: string, context: any): Promise<{ answer: string; sources: string[] }> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // В реальном коде здесь был бы вызов OpenAI API
    return {
      answer: `OpenAI: ${question}`,
      sources: [],
    };
  }
}

class GeminiAdapter extends AIAdapter {
  private apiKey: string;
  private model: string;

  constructor() {
    super();
    this.apiKey = config.GEMINI_API_KEY || '';
    this.model = config.GEMINI_MODEL || 'gemini-pro';
  }

  async ask(question: string, context: any): Promise<{ answer: string; sources: string[] }> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    // В реальном коде здесь был бы вызов Gemini API
    return {
      answer: `Gemini: ${question}`,
      sources: [],
    };
  }
}

export class AIService {
  private adapters: Record<string, AIAdapter | null> = {
    openai: config.OPENAI_API_KEY ? new OpenAIAdapter() : null,
    gemini: config.GEMINI_API_KEY ? new GeminiAdapter() : null,
  };

  private getAdapter() {
    if (config.AI_PROVIDER === 'openai') {
      return this.adapters.openai;
    }
    if (config.AI_PROVIDER === 'gemini') {
      return this.adapters.gemini;
    }
    return null;
  }

  /**
   * Задать вопрос AI
   */
  async ask(question: string, userId?: number) {
    // Проверяем, включен ли AI
    if (!config.AI_ENABLED || !config.AI_PROVIDER || config.AI_PROVIDER === 'none') {
      throw new Error(i18n('ai.disabled'));
    }

    const adapter = this.getAdapter();
    if (!adapter) {
      throw new Error(`AI provider ${config.AI_PROVIDER} not configured`);
    }

    // Получаем контекст
    const context = await this.getContext();

    // Задаем вопрос
    const result = await adapter.ask(question, context);

    // Создаем сообщение в истории
    if (userId) {
      // Здесь можно добавить сохранение в БД
    }

    return result;
  }

  /**
   * Получить контекст для AI
   */
  private async getContext() {
    const [computers, tariffs, characters, cmsBlocks] = await Promise.all([
      computerService.getStats(),
      tariffService ? tariffService.getStats() : null,
      characterService.getStats(),
      cmsService.getBlocks(),
    ]);

    return {
      computers,
      tariffs,
      characters,
      cmsBlocks,
      location: i18n('ai.location'),
      timezone: i18n('ai.timezone'),
    };
  }

  /**
   * Получить статистику AI запросов
   */
  async getStats() {
    // В реальном коде здесь был бы подсчет запросов из БД
    return {
      totalRequests: 0,
      errors: 0,
    };
  }
}

export const aiService = new AIService();

