"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tariffService = exports.TariffService = void 0;
const client_1 = require("@prisma/client");
const i18n_1 = require("../config/i18n");
const prisma = new client_1.PrismaClient();
class TariffService {
    async findAll() {
        const tariffs = await prisma.tariff.findMany({
            where: { isActive: true },
            include: { category: true },
            orderBy: { sortOrder: 'asc' },
        });
        return tariffs;
    }
    async findById(id) {
        const tariff = await prisma.tariff.findUnique({
            where: { id },
            include: { category: true },
        });
        if (!tariff) {
            throw new Error((0, i18n_1.i18n)('errors.not_found'));
        }
        return tariff;
    }
    async findByCategoryId(categoryId) {
        const tariffs = await prisma.tariff.findMany({
            where: { categoryId, isActive: true },
            orderBy: { sortOrder: 'asc' },
        });
        return tariffs;
    }
    async findByNameAndCategory(name, categoryId) {
        const tariff = await prisma.tariff.findFirst({
            where: { name, categoryId, isActive: true },
        });
        return tariff;
    }
    async create(data) {
        const tariff = await prisma.tariff.create({ data });
        return tariff;
    }
    async update(id, data) {
        const tariff = await prisma.tariff.update({
            where: { id },
            data,
        });
        return tariff;
    }
    async getStats() {
        const total = await prisma.tariff.count();
        const active = await prisma.tariff.count({ where: { isActive: true } });
        const byCategory = await prisma.tariff.groupBy({
            by: ['categoryId'],
            where: { isActive: true },
            _count: true,
        });
        return { total, active, byCategory };
    }
}
exports.TariffService = TariffService;
exports.tariffService = new TariffService();
