import { PrismaClient } from '@prisma/client';
import { config } from '../config/env';
import { i18n } from '../config/i18n';

const prisma = new PrismaClient();

export interface ComputerFilter {
  categoryId?: number;
  status?: string;
  search?: string;
  minSpecifications?: string;
}

export interface ComputerRecommendation {
  type: 'BEST' | 'OPTIMAL' | 'POWERFUL' | 'SUITABLE';
  computerId: number;
  reason: string;
  reasonKy?: string;
  reasonEn?: string;
}

export class ComputerService {
  /**
   * Получить все компьютеры с фильтрацией
   */
  async findAll(filter: ComputerFilter = {}, page = 1, limit = 24) {
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (filter.categoryId) {
      where.categoryId = filter.categoryId;
    }
    
    if (filter.status) {
      where.status = filter.status;
    }
    
    if (filter.search) {
      where.OR = [
        { number: { contains: filter.search, mode: 'insensitive' } },
        { specifications: { contains: filter.search, mode: 'insensitive' } },
        { equipment: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const computers = await prisma.computer.findMany({
      where,
      skip,
      take: limit,
      include: {
        category: true,
      },
      orderBy: {
        number: 'asc',
      },
    });

    const total = await prisma.computer.count({ where });

    return {
      items: computers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Получить компьютер по ID
   */
  async findById(id: number) {
    const computer = await prisma.computer.findUnique({
      where: { id },
      include: {
        category: true,
        bookings: {
          where: {
            status: {
              in: ['PENDING_PAYMENT', 'CONFIRMED', 'ACTIVE'],
            },
          },
        },
      },
    });

    if (!computer) {
      throw new Error(i18n.t('errors.not_found'));
    }

    return computer;
  }

  /**
   * Получить компьютер по номеру
   */
  async findByNumber(number: number) {
    const computer = await prisma.computer.findUnique({
      where: { number },
      include: {
        category: true,
      },
    });

    return computer;
  }

  /**
   * Получить доступные компьютеры для бронирования
   */
  async findAvailable(startsAt: Date, endsAt: Date, categoryId?: number) {
    // Получаем все компьютеры выбранной категории
    const where: any = { status: 'AVAILABLE' };
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const computers = await prisma.computer.findMany({
      where,
      include: {
        category: true,
      },
    });

    // Проверяем доступность каждого компьютера
    const availableComputers = [];
    for (const computer of computers) {
      const isAvailable = await this.isComputerAvailable(computer.id, startsAt, endsAt);
      if (isAvailable) {
        availableComputers.push(computer);
      }
    }

    return availableComputers;
  }

  /**
   * Проверить доступность компьютера
   */
  async isComputerAvailable(computerId: number, startsAt: Date, endsAt: Date): Promise<boolean> {
    // Проверяем активные бронирования
    const existingBooking = await prisma.booking.findFirst({
      where: {
        computerId,
        status: {
          in: ['PENDING_PAYMENT', 'CONFIRMED', 'ACTIVE'],
        },
        OR: [
          {
            startsAt: { lte: endsAt },
            endsAt: { gt: startsAt },
          },
          {
            startsAt: { lt: endsAt },
            endsAt: { gte: endsAt },
          },
        ],
      },
    });

    if (existingBooking) {
      return false;
    }

    // Проверяем активные сессии
    const existingSession = await prisma.gamingSession.findFirst({
      where: {
        computerId,
        status: 'ACTIVE',
        startedAt: { lte: endsAt },
        endedAt: null,
      },
    });

    if (existingSession) {
      return false;
    }

    return true;
  }

  /**
   * Получить статистику компьютеров
   */
  async getStats() {
    const total = await prisma.computer.count();
    const available = await prisma.computer.count({ where: { status: 'AVAILABLE' } });
    const inUse = await prisma.computer.count({ where: { status: 'IN_USE' } });
    const maintenance = await prisma.computer.count({ where: { status: 'MAINTENANCE' } });

    const byCategory = await prisma.computer.groupBy({
      by: ['categoryId'],
      _count: true,
    });

    return {
      total,
      available,
      inUse,
      maintenance,
      byCategory,
    };
  }

  /**
   * Получить рекомендации компьютеров
   */
  async getRecommendations(
    categoryId?: number,
    durationMinutes?: number,
    budget?: number
  ): Promise<ComputerRecommendation[]> {
    const recommendations: ComputerRecommendation[] = [];

    // Получаем все компьютеры категории
    const where: any = { status: 'AVAILABLE' };
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const computers = await prisma.computer.findMany({
      where,
      include: {
        category: true,
      },
    });

    if (computers.length === 0) {
      return [];
    }

    // Определяем лучший компьютер на основе характеристик
    let bestComputer = computers[0];
    let bestScore = 0;

    for (const computer of computers) {
      let score = 0;
      
      // Скрипты для оценки компьютера
      const specs = computer.specifications?.toLowerCase() || '';
      const equipment = computer.equipment?.toLowerCase() || '';
      
      // Баллы за процессор
      if (specs.includes('i9') || specs.includes('ryzen 9')) {
        score += 100;
      } else if (specs.includes('i7') || specs.includes('ryzen 7')) {
        score += 80;
      } else if (specs.includes('i5') || specs.includes('ryzen 5')) {
        score += 60;
      } else if (specs.includes('i3') || specs.includes('ryzen 3')) {
        score += 40;
      }

      // Баллы за видеокарту
      if (specs.includes('rtx 4080') || specs.includes('rtx 4090')) {
        score += 100;
      } else if (specs.includes('rtx 4070') || specs.includes('rtx 3080')) {
        score += 80;
      } else if (specs.includes('rtx 3060') || specs.includes('rtx 3070')) {
        score += 60;
      } else if (specs.includes('gtx 1650') || specs.includes('rtx 2060')) {
        score += 40;
      }

      // Баллы за RAM
      if (specs.includes('128gb')) {
        score += 50;
      } else if (specs.includes('64gb')) {
        score += 40;
      } else if (specs.includes('32gb')) {
        score += 30;
      } else if (specs.includes('16gb')) {
        score += 20;
      }

      // Баллы за монитор
      if (equipment.includes('43')) {
        score += 30;
      } else if (equipment.includes('32')) {
        score += 20;
      } else if (equipment.includes('27')) {
        score += 10;
      }

      // Баллы за высокую частоту монитора
      if (equipment.includes('165hz') || equipment.includes('144hz')) {
        score += 15;
      }

      if (score > bestScore) {
        bestScore = score;
        bestComputer = computer;
      }
    }

    // Добавляем рекомендации
    const categoryNames = {
      ky: { Comfort: 'Комфорт', Standard: 'Стандарт', Premium: 'Премиум', 'Ronin Rooms': 'RONIN Rooms' },
      en: { Comfort: 'Comfort', Standard: 'Standard', Premium: 'Premium', 'Ronin Rooms': 'Ronin Rooms' },
    };

    const currentLang = i18n.language || 'ru';
    const lang = currentLang === 'ky' ? 'ky' : currentLang === 'en' ? 'en' : 'ru';

    recommendations.push({
      type: 'BEST',
      computerId: bestComputer.id,
      reason: `Лучший компьютер в категории ${bestComputer.category.name}`,
      reasonKy: `Ең жақсы компьютер - ${categoryNames[lang][bestComputer.category.name] || bestComputer.category.name}`,
      reasonEn: `Best computer in ${bestComputer.category.name || ''} category`,
    });

    if (computers.length > 1) {
      const optimal = computers.find(c => c.id !== bestComputer.id);
      if (optimal) {
        recommendations.push({
          type: 'OPTIMAL',
          computerId: optimal.id,
          reason: `Оптимальное соотношение цены и качества`,
          reasonKy: 'Жақсы құны мен сапасының үйлесімділігі',
          reasonEn: `Optimal price-to-quality ratio`,
        });
      }
    }

    return recommendations;
  }

  /**
   * Создать компьютер
   */
  async create(data: {
    number: number;
    categoryId: number;
    specifications?: string;
    equipment?: string;
    imageUrl?: string;
    status?: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
  }) {
    const computer = await prisma.computer.create({
      data,
      include: { category: true },
    });

    return computer;
  }

  /**
   * Обновить компьютер
   */
  async update(id: number, data: {
    categoryId?: number;
    specifications?: string;
    equipment?: string;
    imageUrl?: string;
    status?: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
  }) {
    const computer = await prisma.computer.update({
      where: { id },
      data,
      include: { category: true },
    });

    return computer;
  }

  /**
   * Установить компьютер на обслуживание
   */
  async setMaintenance(id: number) {
    const computer = await prisma.computer.update({
      where: { id },
      data: { status: 'MAINTENANCE' },
      include: { category: true },
    });

    return computer;
  }

  /**
   * Вернуть компьютер из обслуживания
   */
  async setActive(id: number) {
    const computer = await prisma.computer.update({
      where: { id },
      data: { status: 'AVAILABLE' },
      include: { category: true },
    });

    return computer;
  }

  /**
   * Архивировать компьютер
   */
  async archive(id: number) {
    // В будущем можно добавить поле isArchived
    return await prisma.computer.update({
      where: { id },
      data: { status: 'MAINTENANCE' },
    });
  }
}

export const computerService = new ComputerService();
