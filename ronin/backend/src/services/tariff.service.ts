import { PrismaClient } from '@prisma/client';
import { i18n } from '../config/i18n';

const prisma = new PrismaClient();

export class TariffService {
  /**
   * Получить все тарифы
   */
  async findAll() {
    const tariffs = await prisma.tariff.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { sortOrder: 'asc' },
    });
    return tariffs;
  }

  /**
   * Получить тариф по ID
   */
  async findById(id: number) {
    const tariff = await prisma.tariff.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!tariff) {
      throw new Error(i18n.t('errors.not_found'));
    }

    return tariff;
  }

  /**
   * Получить тарифы по категории
   */
  async findByCategoryId(categoryId: number) {
    const tariffs = await prisma.tariff.findMany({
      where: { categoryId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return tariffs;
  }

  /**
   * Получить тариф по названию и категории
   */
  async findByNameAndCategory(name: string, categoryId: number) {
    const tariff = await prisma.tariff.findFirst({
      where: { name, categoryId, isActive: true },
    });

    return tariff;
  }

  /**
   * Создать тариф (ADMIN)
   */
  async create(data: {
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
  }) {
    const tariff = await prisma.tariff.create({ data });
    return tariff;
  }

  /**
   * Обновить тариф (ADMIN)
   */
  async update(id: number, data: {
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
  }) {
    const tariff = await prisma.tariff.update({
      where: { id },
      data,
    });

    return tariff;
  }

  /**
   * Получить статистику тарифов
   */
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

export const tariffService = new TariffService();
