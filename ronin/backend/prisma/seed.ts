import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create 4 computer categories
  const categories = await Promise.all([
    prisma.computerCategory.create({
      data: {
        name: 'Comfort',
        nameKy: 'Комфорт',
        nameEn: 'Comfort',
        description: 'Классические компьютеры для повседневного использования',
        descriptionKy: 'Күнделікті пайдалану үшін қарапайым компьютерлер',
        descriptionEn: 'Standard computers for everyday use',
        sortOrder: 1,
      },
      select: { id: true, name: true },
    }),
    prisma.computerCategory.create({
      data: {
        name: 'Standard',
        nameKy: 'Стандарт',
        nameEn: 'Standard',
        description: 'Универсальные компьютеры с хорошей производительностью',
        descriptionKy: 'Жақсы өнімділігі бар әмбебап компьютерлер',
        descriptionEn: 'Universal computers with good performance',
        sortOrder: 2,
      },
      select: { id: true, name: true },
    }),
    prisma.computerCategory.create({
      data: {
        name: 'Premium',
        nameKy: 'Премиум',
        nameEn: 'Premium',
        description: 'Высокопроизводительные компьютеры для игр и работы',
        descriptionKy: 'Ойын және жұмыс үшін өнімділігі жоғары компьютерлер',
        descriptionEn: 'High-performance computers for gaming and work',
        sortOrder: 3,
      },
      select: { id: true, name: true },
    }),
    prisma.computerCategory.create({
      data: {
        name: 'Ronin Rooms',
        nameKy: 'RONIN Rooms',
        nameEn: 'Ronin Rooms',
        description: 'Закрытые кабинеты для командной работы и турниров',
        descriptionKy: 'Топтық жұмыс және турнирлер үшін жабдықталған кеңес орны',
        descriptionEn: 'Private rooms for team work and tournaments',
        sortOrder: 4,
      },
      select: { id: true, name: true },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create 96 computers (24 per category)
  const computers = [];
  for (let i = 0; i < 96; i++) {
    const categoryId = categories[i % 4].id;
    const number = i + 1;

    let specifications = '';
    let equipment = '';

    if (i < 24) {
      // Comfort
      specifications = 'Intel Core i5-10400F / 16GB RAM / 512GB SSD / NVIDIA GTX 1650';
      equipment = 'Mechanical keyboard, Gaming mouse, 27" monitor';
    } else if (i < 48) {
      // Standard
      specifications = 'Intel Core i5-12400F / 32GB RAM / 1TB NVMe SSD / NVIDIA RTX 3060';
      equipment = 'Mechanical keyboard, Gaming mouse, 27" 144Hz monitor';
    } else if (i < 72) {
      // Premium
      specifications = 'Intel Core i7-13700K / 64GB RAM / 2TB NVMe SSD / NVIDIA RTX 4070';
      equipment = 'RGB mechanical keyboard, High-end gaming mouse, 32" 165Hz monitor';
    } else {
      // Ronin Rooms
      specifications = 'Intel Core i9-13900K / 128GB RAM / 4TB NVMe SSD / NVIDIA RTX 4080';
      equipment = 'RGB mechanical keyboard, High-end gaming mouse, 43" 144Hz monitor';
    }

    const status = Math.random() > 0.1 ? 'AVAILABLE' : 'MAINTENANCE';

    const computer = await prisma.computer.create({
      data: {
        number,
        categoryId,
        specifications,
        equipment,
        imageUrl: `https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&h=400&fit=crop&q=80`,
        status,
      },
      select: { id: true, number: true },
    });
    computers.push(computer);
  }

  console.log(`✅ Created ${computers.length} computers`);

  // Create 13 characters (8 free, 5 paid)
  const characters = await Promise.all([
    // Free characters
    prisma.character.create({
      data: {
        name: 'Рыцарь',
        nameKy: 'Рыцарь',
        nameEn: 'Knight',
        description: 'Доблестный воин, защитник слабых',
        descriptionKy: 'Кәрігерсіз соғысшы, әлсіздерді қорғаушы',
        descriptionEn: 'Valiant warrior, protector of the weak',
        imageUrl: 'https://images.unsplash.com/photo-1560253023-3ec5d502959c?w=400&h=400&fit=crop&q=80',
        price: 0,
        isFree: true,
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.character.create({
      data: {
        name: 'Маг',
        nameKy: 'Маг',
        nameEn: 'Mage',
        description: 'Мастер магии и заклинаний',
        descriptionKy: 'Жадығыштық пен бұйрықтардың ұстазы',
        descriptionEn: 'Master of magic and spells',
        imageUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=400&fit=crop&q=80',
        price: 0,
        isFree: true,
        isActive: true,
        sortOrder: 2,
      },
    }),
    prisma.character.create({
      data: {
        name: 'Рейнджер',
        nameKy: 'Рейнджер',
        nameEn: 'Ranger',
        description: 'Мастер дальнего боя',
        descriptionKy: 'Алыс соғыс ұстазы',
        descriptionEn: 'Master of long-range combat',
        imageUrl: 'https://images.unsplash.com/photo-1544367563-1b7d26939111?w=400&h=400&fit=crop&q=80',
        price: 0,
        isFree: true,
        isActive: true,
        sortOrder: 3,
      },
    }),
    prisma.character.create({
      data: {
        name: 'Хантер',
        nameKy: 'Хантер',
        nameEn: 'Hunter',
        description: 'Природный охотник',
        descriptionKy: 'Табиғаттық егесі',
        descriptionEn: 'Nature hunter',
        imageUrl: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=400&h=400&fit=crop&q=80',
        price: 0,
        isFree: true,
        isActive: true,
        sortOrder: 4,
      },
    }),
    prisma.character.create({
      data: {
        name: 'Паладин',
        nameKy: 'Паладин',
        nameEn: 'Paladin',
        description: 'Светлый рыцарь, защитник веры',
        descriptionKy: 'Жарқын рыцарь, сенімді қорғаушы',
        descriptionEn: 'Light knight, defender of faith',
        imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop&q=80',
        price: 0,
        isFree: true,
        isActive: true,
        sortOrder: 5,
      },
    }),
    prisma.character.create({
      data: {
        name: 'Шадоу',
        nameKy: 'Шадоу',
        nameEn: 'Shadow',
        description: 'Мастер скрытности и теней',
        descriptionKy: 'Мұқияттылық пен күңілді ұстазы',
        descriptionEn: 'Master of stealth and shadows',
        imageUrl: 'https://images.unsplash.com/photo-1518453051524-33d15126844b?w=400&h=400&fit=crop&q=80',
        price: 0,
        isFree: true,
        isActive: true,
        sortOrder: 6,
      },
    }),
    prisma.character.create({
      data: {
        name: 'Механик',
        nameKy: 'Механик',
        nameEn: 'Mechanic',
        description: 'Эксперт по технологиям и технике',
        descriptionKy: 'Технологиялар мен техниканың эксперті',
        descriptionEn: 'Technology and machinery expert',
        imageUrl: 'https://images.unsplash.com/photo-1552642639-1768d7653598?w=400&h=400&fit=crop&q=80',
        price: 0,
        isFree: true,
        isActive: true,
        sortOrder: 7,
      },
    }),
    prisma.character.create({
      data: {
        name: 'Скай',
        nameKy: 'Скай',
        nameEn: 'Sky',
        description: 'Повелитель неба и ветра',
        descriptionKy: 'Аспан мен желдің ұстазы',
        descriptionEn: 'Master of sky and wind',
        imageUrl: 'https://images.unsplash.com/photo-1504603735695-329cc8535258?w=400&h=400&fit=crop&q=80',
        price: 0,
        isFree: true,
        isActive: true,
        sortOrder: 8,
      },
    }),
    // Paid characters
    prisma.character.create({
      data: {
        name: 'Супермен',
        nameKy: 'Супермен',
        nameEn: 'Superman',
        description: 'Неограниченная сила и неуязвимость',
        descriptionKy: 'Шектеусіз күш пен жаралай алмайтындық',
        descriptionEn: 'Limitless strength and invincibility',
        imageUrl: 'https://images.unsplash.com/photo-1535442979339-7529a885628c?w=400&h=400&fit=crop&q=80',
        price: 50000, // 50000 KGS
        isFree: false,
        isActive: true,
        sortOrder: 9,
      },
    }),
    prisma.character.create({
      data: {
        name: 'Бэтмен',
        nameKy: 'Бэтмен',
        nameEn: 'Batman',
        description: 'Гений, миллиардер, филантроп',
        descriptionKy: 'Гений, миллионер, филантроп',
        descriptionEn: 'Genius, billionaire, philanthropist',
        imageUrl: 'https://images.unsplash.com/photo-1509347528169-24516c277555?w=400&h=400&fit=crop&q=80',
        price: 50000,
        isFree: false,
        isActive: true,
        sortOrder: 10,
      },
    }),
    prisma.character.create({
      data: {
        name: 'Черепашка',
        nameKy: 'Черепашка',
        nameEn: 'Turtle',
        description: 'Невероятная выносливость и защита',
        descriptionKy: 'Таңқаларлық төзімділік пен қорғаныс',
        descriptionEn: 'Incredible endurance and protection',
        imageUrl: 'https://images.unsplash.com/photo-1515378960530-7c0da62481a1?w=400&h=400&fit=crop&q=80',
        price: 50000,
        isFree: false,
        isActive: true,
        sortOrder: 11,
      },
    }),
    prisma.character.create({
      data: {
        name: 'Желтірі',
        nameKy: 'Желтірі',
        nameEn: 'Flash',
        description: 'Самая быстрая сущность вселенной',
        descriptionKy: 'Әлемнің ең жылдам субъектісі',
        descriptionEn: 'The fastest entity in the universe',
        imageUrl: 'https://images.unsplash.com/photo-1504533639-9a0f18707333?w=400&h=400&fit=crop&q=80',
        price: 50000,
        isFree: false,
        isActive: true,
        sortOrder: 12,
      },
    }),
    prisma.character.create({
      data: {
        name: 'Аквамен',
        nameKy: 'Аквамен',
        nameEn: 'Aquaman',
        description: 'Правитель океанов и морских обитателей',
        descriptionKy: 'Мұхиттар мен теңіз мекендейтіндердің өкілі',
        descriptionEn: 'Ruler of oceans and sea creatures',
        imageUrl: 'https://images.unsplash.com/photo-1544043536-c2578d931495?w=400&h=400&fit=crop&q=80',
        price: 50000,
        isFree: false,
        isActive: true,
        sortOrder: 13,
      },
    }),
  ]);

  console.log(`✅ Created ${characters.length} characters`);

  // Create tariffs (5 tariffs with prices from TZ: 120 / 300 / 500 / 600 / 300 сом)
  // Interpreting these as: Comfort=120, Standard=300, Premium=500, Ronin Rooms=600, and 300 for some specific package
  const tariffs = await Promise.all([
    prisma.tariff.create({
      data: {
        name: '1 час Comfort',
        nameKy: '1 сағат Comfort',
        nameEn: '1 hour Comfort',
        description: '1 час игры на компьютере Comfort',
        descriptionKy: 'Comfort компьютерінде 1 сағат ойын',
        descriptionEn: '1 hour of gaming on Comfort computer',
        durationMinutes: 60,
        price: 12000, // 120 soms in cents
        categoryId: categories[0].id,
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.tariff.create({
      data: {
        name: '1 час Standard',
        nameKy: '1 сағат Standard',
        nameEn: '1 hour Standard',
        description: '1 час игры на компьютере Standard',
        descriptionKy: 'Standard компьютерінде 1 сағат ойын',
        descriptionEn: '1 hour of gaming on Standard computer',
        durationMinutes: 60,
        price: 30000, // 300 soms in cents
        categoryId: categories[1].id,
        isActive: true,
        sortOrder: 2,
      },
    }),
    prisma.tariff.create({
      data: {
        name: '1 час Premium',
        nameKy: '1 сағат Premium',
        nameEn: '1 hour Premium',
        description: '1 час игры на компьютере Premium',
        descriptionKy: 'Premium компьютерінде 1 сағат ойын',
        descriptionEn: '1 hour of gaming on Premium computer',
        durationMinutes: 60,
        price: 50000, // 500 soms in cents
        categoryId: categories[2].id,
        isActive: true,
        sortOrder: 3,
      },
    }),
    prisma.tariff.create({
      data: {
        name: '1 час Ronin Rooms',
        nameKy: '1 сағат Ronin Rooms',
        nameEn: '1 hour Ronin Rooms',
        description: '1 час игры в закрытом кабинете',
        descriptionKy: 'Жабдықталған кеңес орнында 1 сағат ойын',
        descriptionEn: '1 hour of gaming in private room',
        durationMinutes: 60,
        price: 60000, // 600 soms in cents
        categoryId: categories[3].id,
        isActive: true,
        sortOrder: 4,
      },
    }),
    prisma.tariff.create({
      data: {
        name: '3 часа (любой)',
        nameKy: '3 сағат (кез келген)',
        nameEn: '3 hours (any)',
        description: '3 часа игры на любом компьютере',
        descriptionKy: 'Кез келген компьютерде 3 сағат ойын',
        descriptionEn: '3 hours of gaming on any computer',
        durationMinutes: 180,
        price: 30000, // 300 soms in cents (bulk discount)
        categoryId: categories[0].id, // Default to Comfort
        isActive: true,
        sortOrder: 5,
      },
    }),
  ]);

  console.log(`✅ Created ${tariffs.length} tariffs`);

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
