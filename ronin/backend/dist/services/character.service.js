"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.characterService = exports.CharacterService = void 0;
const client_1 = require("@prisma/client");
const i18n_1 = require("../config/i18n");
const payment_service_1 = require("./payment.service");
const prisma = new client_1.PrismaClient();
class CharacterService {
    async findAll() {
        const characters = await prisma.character.findMany({
            where: { isActive: true },
            orderBy: {
                sortOrder: 'asc',
            },
        });
        return characters;
    }
    async findById(id) {
        const character = await prisma.character.findUnique({
            where: { id },
        });
        if (!character) {
            throw new Error((0, i18n_1.i18n)('errors.not_found'));
        }
        return character;
    }
    async getFreeCharacters() {
        const characters = await prisma.character.findMany({
            where: { isFree: true, isActive: true },
            orderBy: {
                sortOrder: 'asc',
            },
        });
        return characters;
    }
    async getPaidCharacters() {
        const characters = await prisma.character.findMany({
            where: { isFree: false, isActive: true },
            orderBy: {
                sortOrder: 'asc',
            },
        });
        return characters;
    }
    async getUserCharacters(userId) {
        const userCharacters = await prisma.userCharacter.findMany({
            where: { userId },
            include: {
                character: true,
            },
            orderBy: {
                isMain: 'desc',
                character: { sortOrder: 'asc' },
            },
        });
        return userCharacters.map(uc => ({
            ...uc,
            character: uc.character,
        }));
    }
    async setMainCharacter(userId, characterId) {
        const userCharacter = await prisma.userCharacter.findFirst({
            where: { userId, characterId },
        });
        if (!userCharacter) {
            throw new Error((0, i18n_1.i18n)('errors.character_not_owned'));
        }
        await prisma.userCharacter.updateMany({
            where: { userId },
            data: { isMain: false },
        });
        await prisma.userCharacter.update({
            where: { id: userCharacter.id },
            data: { isMain: true },
        });
        return { success: true };
    }
    async purchaseCharacter(userId, characterId, paymentMethod, paymentId) {
        const character = await prisma.character.findUnique({
            where: { id: characterId },
        });
        if (!character) {
            throw new Error((0, i18n_1.i18n)('errors.not_found'));
        }
        if (character.isFree) {
            throw new Error((0, i18n_1.i18n)('errors.character_free'));
        }
        const existing = await prisma.userCharacter.findFirst({
            where: { userId, characterId },
        });
        if (existing) {
            throw new Error((0, i18n_1.i18n)('errors.character_already_owned'));
        }
        const existingPurchase = await prisma.characterPurchase.findFirst({
            where: {
                userId,
                characterId,
                status: 'PENDING',
            },
        });
        if (existingPurchase) {
            throw new Error((0, i18n_1.i18n)('errors.purchase_pending'));
        }
        const purchase = await prisma.characterPurchase.create({
            data: {
                userId,
                characterId,
                amount: character.price,
                paymentId: paymentId || null,
                status: 'PENDING',
            },
        });
        if (character.isFree) {
            await prisma.characterPurchase.update({
                where: { id: purchase.id },
                data: { status: 'CONFIRMED' },
            });
            await prisma.userCharacter.create({
                data: {
                    userId,
                    characterId,
                    isMain: true,
                },
            });
            return { success: true, message: (0, i18n_1.i18n)('characters.free_selected') };
        }
        if (paymentMethod === 'ONLINE') {
            const payment = await payment_service_1.paymentService.createPayment(userId, character.price, undefined, 'custom', true, `char-${characterId}-${userId}-${Date.now()}`);
            return {
                success: true,
                purchaseId: purchase.id,
                payment,
                message: (0, i18n_1.i18n)('characters.payment_required'),
            };
        }
        return {
            success: true,
            purchaseId: purchase.id,
            message: (0, i18n_1.i18n)('characters.payment_required'),
        };
    }
    async confirmPurchase(purchaseId) {
        const purchase = await prisma.characterPurchase.findUnique({
            where: { id: purchaseId },
            include: { character: true, user: true },
        });
        if (!purchase) {
            throw new Error((0, i18n_1.i18n)('errors.not_found'));
        }
        if (purchase.status !== 'PENDING') {
            throw new Error((0, i18n_1.i18n)('errors.purchase_not_pending'));
        }
        if (purchase.character.isFree) {
            await prisma.userCharacter.create({
                data: {
                    userId: purchase.userId,
                    characterId: purchase.characterId,
                    isMain: false,
                },
            });
            await prisma.characterPurchase.update({
                where: { id: purchaseId },
                data: { status: 'CONFIRMED' },
            });
            return { success: true };
        }
        if (!purchase.paymentId) {
            throw new Error((0, i18n_1.i18n)('errors.payment_required'));
        }
        const payment = await prisma.payment.findUnique({
            where: { id: purchase.paymentId },
        });
        if (!payment || payment.status !== 'SUCCEEDED') {
            throw new Error((0, i18n_1.i18n)('errors.payment_not_completed'));
        }
        await prisma.userCharacter.create({
            data: {
                userId: purchase.userId,
                characterId: purchase.characterId,
                isMain: false,
            },
        });
        await prisma.characterPurchase.update({
            where: { id: purchaseId },
            data: { status: 'CONFIRMED' },
        });
        return { success: true };
    }
    async createCharacter(data) {
        const character = await prisma.character.create({
            data,
        });
        return character;
    }
    async updateCharacter(id, data) {
        const character = await prisma.character.update({
            where: { id },
            data,
        });
        return character;
    }
    async getStats() {
        const total = await prisma.character.count();
        const free = await prisma.character.count({ where: { isFree: true } });
        const paid = await prisma.character.count({ where: { isFree: false } });
        const active = await prisma.character.count({ where: { isActive: true } });
        return { total, free, paid, active };
    }
}
exports.CharacterService = CharacterService;
exports.characterService = new CharacterService();
