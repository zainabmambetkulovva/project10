"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmsService = exports.CMSService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class CMSService {
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
    async getByKey(key) {
        const block = await prisma.cmsBlock.findUnique({
            where: { key },
            include: { cards: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
        });
        return block;
    }
    async getCards() {
        const cards = await prisma.cmsCard.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
        });
        return cards;
    }
    async getQuotes() {
        const quotes = await prisma.quote.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
        });
        return quotes;
    }
    async createBlock(data) {
        const block = await prisma.cmsBlock.create({
            data,
        });
        return block;
    }
    async updateBlock(id, data) {
        const block = await prisma.cmsBlock.update({
            where: { id },
            data,
        });
        return block;
    }
    async deleteBlock(id) {
        await prisma.cmsBlock.delete({
            where: { id },
        });
        return { success: true };
    }
    async createCard(data) {
        const card = await prisma.cmsCard.create({
            data,
        });
        return card;
    }
    async updateCard(id, data) {
        const card = await prisma.cmsCard.update({
            where: { id },
            data,
        });
        return card;
    }
    async deleteCard(id) {
        await prisma.cmsCard.delete({
            where: { id },
        });
        return { success: true };
    }
    async createQuote(data) {
        const quote = await prisma.quote.create({
            data,
        });
        return quote;
    }
    async updateQuote(id, data) {
        const quote = await prisma.quote.update({
            where: { id },
            data,
        });
        return quote;
    }
    async deleteQuote(id) {
        await prisma.quote.delete({
            where: { id },
        });
        return { success: true };
    }
    async getLandingContent() {
        const blocks = await this.getBlocks();
        const quotes = await this.getQuotes();
        return { blocks, quotes };
    }
}
exports.CMSService = CMSService;
exports.cmsService = new CMSService();
