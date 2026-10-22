import { PrismaClient } from '@prisma/client';
import { i18n } from '../config/i18n';

const prisma = new PrismaClient();

export class CMSService {
  /**
   * Получить все CMS блоки
   */
  async getBlocks() {
    const blocks = await prisma.cmsBlock.findMany({
      where: { isActive: true },
      include: {
        cards: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return blocks;
  }

  /**
   * Получить блок по ключу
   */
  async getByKey(key: string) {
    const block = await prisma.cmsBlock.findUnique({
      where: { key },
      include: { cards: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
    });

    return block;
  }

  /**
   * Получить все карточки
   */
  async getCards() {
    const cards = await prisma.cmsCard.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return cards;
  }

  /**
   * Получить все цитаты
   */
  async getQuotes() {
    const quotes = await prisma.quote.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return quotes;
  }

  /**
   * Создать блок (ADMIN)
   */
  async createBlock(data: {
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
  }) {
    const block = await prisma.cmsBlock.create({
      data,
    });

    return block;
  }

  /**
   * Обновить блок (ADMIN)
   */
  async updateBlock(id: number, data: {
    title?: string;
    titleKy?: string;
    titleEn?: string;
    content?: string;
    contentKy?: string;
    contentEn?: string;
    imageUrl?: string;
    sortOrder?: number;
    isActive?: boolean;
  }) {
    const block = await prisma.cmsBlock.update({
      where: { id },
      data,
    });

    return block;
  }

  /**
   * Удалить блок (ADMIN)
   */
  async deleteBlock(id: number) {
    await prisma.cmsBlock.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * Создать карточку (ADMIN)
   */
  async createCard(data: {
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
  }) {
    const card = await prisma.cmsCard.create({
      data,
    });

    return card;
  }

  /**
   * Обновить карточку (ADMIN)
   */
  async updateCard(id: number, data: {
    title?: string;
    titleKy?: string;
    titleEn?: string;
    description?: string;
    descriptionKy?: string;
    descriptionEn?: string;
    imageUrl?: string;
    sortOrder?: number;
    isActive?: boolean;
  }) {
    const card = await prisma.cmsCard.update({
      where: { id },
      data,
    });

    return card;
  }

  /**
   * Удалить карточку (ADMIN)
   */
  async deleteCard(id: number) {
    await prisma.cmsCard.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * Создать цитату (ADMIN)
   */
  async createQuote(data: {
    text: string;
    textKy?: string;
    textEn?: string;
    author?: string;
    authorKy?: string;
    authorEn?: string;
    imageUrl?: string;
    isActive: boolean;
    sortOrder: number;
  }) {
    const quote = await prisma.quote.create({
      data,
    });

    return quote;
  }

  /**
   * Обновить цитату (ADMIN)
   */
  async updateQuote(id: number, data: {
    text?: string;
    textKy?: string;
    textEn?: string;
    author?: string;
    authorKy?: string;
    authorEn?: string;
    imageUrl?: string;
    isActive?: boolean;
    sortOrder?: number;
  }) {
    const quote = await prisma.quote.update({
      where: { id },
      data,
    });

    return quote;
  }

  /**
   * Удалить цитату (ADMIN)
   */
  async deleteQuote(id: number) {
    await prisma.quote.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * Получить содержимое для landing page
   */
  async getLandingContent() {
    const blocks = await this.getBlocks();
    const quotes = await this.getQuotes();

    return { blocks, quotes };
  }
}

export const cmsService = new CMSService();
