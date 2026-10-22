import { PrismaClient } from '@prisma/client';
import { i18n } from '../config/i18n';
import { paymentService } from './payment.service';

const prisma = new PrismaClient();

export class CharacterService {
  /**
   * Получить все персонажи
   */
  async findAll() {
    const characters = await prisma.character.findMany({
      where: { isActive: true },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return characters;
  }

  /**
   * Получить персонажа по ID
   */
  async findById(id: number) {
    const character = await prisma.character.findUnique({
      where: { id },
    });

    if (!character) {
      throw new Error(i18n.t('errors.not_found'));
    }

    return character;
  }

  /**
   * Получить бесплатные персонажи
   */
  async getFreeCharacters() {
    const characters = await prisma.character.findMany({
      where: { isFree: true, isActive: true },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return characters;
  }

  /**
   * Получить платные персонажи
   */
  async getPaidCharacters() {
    const characters = await prisma.character.findMany({
      where: { isFree: false, isActive: true },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return characters;
  }

  /**
   * Получить персонажи пользователя
   */
  async getUserCharacters(userId: number) {
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

  /**
   * Выбрать основного персонажа
   */
  async setMainCharacter(userId: number, characterId: number) {
    const userCharacter = await prisma.userCharacter.findFirst({
      where: { userId, characterId },
    });

    if (!userCharacter) {
      throw new Error(i18n.t('errors.character_not_owned'));
    }

    // Сначала снимаем у всех флаг main
    await prisma.userCharacter.updateMany({
      where: { userId },
      data: { isMain: false },
    });

    // Устанавливаем флаг main выбранному
    await prisma.userCharacter.update({
      where: { id: userCharacter.id },
      data: { isMain: true },
    });

    return { success: true };
  }

  /**
   * Приобрести персонажа
   */
  async purchaseCharacter(userId: number, characterId: number, paymentMethod: 'ONLINE' | 'CASH', paymentId?: number) {
    const character = await prisma.character.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      throw new Error(i18n.t('errors.not_found'));
    }

    if (character.isFree) {
      throw new Error(i18n.t('errors.character_free'));
    }

    // Проверяем, есть ли уже у пользователя этот персонаж
    const existing = await prisma.userCharacter.findFirst({
      where: { userId, characterId },
    });

    if (existing) {
      throw new Error(i18n.t('errors.character_already_owned'));
    }

    // Проверяем, есть ли уже активная покупка
    const existingPurchase = await prisma.characterPurchase.findFirst({
      where: {
        userId,
        characterId,
        status: 'PENDING',
      },
    });

    if (existingPurchase) {
      throw new Error(i18n.t('errors.purchase_pending'));
    }

    // Создаем запись покупки
    const purchase = await prisma.characterPurchase.create({
      data: {
        userId,
        characterId,
        amount: character.price,
        paymentId: paymentId || null,
        status: 'PENDING',
      },
    });

    // Если бесплатный персонаж, сразу подтверждаем
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

      return { success: true, message: i18n.t('characters.free_selected') };
    }

    // Если платный, создаем платеж
    if (paymentMethod === 'ONLINE') {
      const payment = await paymentService.createPayment(userId, character.price, undefined, 'custom', true, `char-${characterId}-${userId}-${Date.now()}`);

      return {
        success: true,
        purchaseId: purchase.id,
        payment,
        message: i18n.t('characters.payment_required'),
      };
    }

    return {
      success: true,
      purchaseId: purchase.id,
      message: i18n.t('characters.payment_required'),
    };
  }

  /**
   * Подтвердить покупку персонажа
   */
  async confirmPurchase(purchaseId: number) {
    const purchase = await prisma.characterPurchase.findUnique({
      where: { id: purchaseId },
      include: { character: true, user: true },
    });

    if (!purchase) {
      throw new Error(i18n.t('errors.not_found'));
    }

    if (purchase.status !== 'PENDING') {
      throw new Error(i18n.t('errors.purchase_not_pending'));
    }

    // Если бесплатный, просто добавляем
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

    // Проверяем, был ли платеж успешным
    if (!purchase.paymentId) {
      throw new Error(i18n.t('errors.payment_required'));
    }

    const payment = await prisma.payment.findUnique({
      where: { id: purchase.paymentId },
    });

    if (!payment || payment.status !== 'SUCCEEDED') {
      throw new Error(i18n.t('errors.payment_not_completed'));
    }

    // Создаем запись о владении персонажем
    await prisma.userCharacter.create({
      data: {
        userId: purchase.userId,
        characterId: purchase.characterId,
        isMain: false,
      },
    });

    // Обновляем статус покупки
    await prisma.characterPurchase.update({
      where: { id: purchaseId },
      data: { status: 'CONFIRMED' },
    });

    return { success: true };
  }

  /**
   * Создать персонажа (ADMIN)
   */
  async createCharacter(data: {
    name: string;
    description: string;
    imageUrl?: string;
    price: number;
    isFree: boolean;
    isActive: boolean;
    sortOrder: number;
  }) {
    const character = await prisma.character.create({
      data,
    });

    return character;
  }

  /**
   * Обновить персонажа (ADMIN)
   */
  async updateCharacter(id: number, data: {
    name?: string;
    description?: string;
    imageUrl?: string;
    price?: number;
    isFree?: boolean;
    isActive?: boolean;
    sortOrder?: number;
  }) {
    const character = await prisma.character.update({
      where: { id },
      data,
    });

    return character;
  }

  /**
   * Получить статистику персонажей
   */
  async getStats() {
    const total = await prisma.character.count();
    const free = await prisma.character.count({ where: { isFree: true } });
    const paid = await prisma.character.count({ where: { isFree: false } });
    const active = await prisma.character.count({ where: { isActive: true } });

    return { total, free, paid, active };
  }
}

export const characterService = new CharacterService();
