"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting seed...');
    const categories = await Promise.all([
        prisma.computerCategory.create({
            data: {
                name: 'Comfort',
                description: 'Классические компьютеры для повседневного использования',
                sortOrder: 1,
            },
            select: { id: true, name: true },
        }),
        prisma.computerCategory.create({
            data: {
                name: 'Standard',
                description: 'Универсальные компьютеры с хорошей производительностью',
                sortOrder: 2,
            },
            select: { id: true, name: true },
        }),
        prisma.computerCategory.create({
            data: {
                name: 'Premium',
                description: 'Высокопроизводительные компьютеры для игр и работы',
                sortOrder: 3,
            },
            select: { id: true, name: true },
        }),
        prisma.computerCategory.create({
            data: {
                name: 'Ronin Rooms',
                description: 'Закрытые кабинеты для командной работы и турниров',
                sortOrder: 4,
            },
            select: { id: true, name: true },
        }),
    ]);
    console.log(`✅ Created ${categories.length} categories`);
    const computers = [];
    for (let i = 0; i < 96; i++) {
        const categoryId = categories[i % 4].id;
        const number = i + 1;
        let specifications = '';
        let equipment = '';
        if (i < 24) {
            specifications = 'Intel Core i5-10400F / 16GB RAM / 512GB SSD / NVIDIA GTX 1650';
            equipment = 'Mechanical keyboard, Gaming mouse, 27" monitor';
        }
        else if (i < 48) {
            specifications = 'Intel Core i5-12400F / 32GB RAM / 1TB NVMe SSD / NVIDIA RTX 3060';
            equipment = 'Mechanical keyboard, Gaming mouse, 27" 144Hz monitor';
        }
        else if (i < 72) {
            specifications = 'Intel Core i7-13700K / 64GB RAM / 2TB NVMe SSD / NVIDIA RTX 4070';
            equipment = 'RGB mechanical keyboard, High-end gaming mouse, 32" 165Hz monitor';
        }
        else {
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
    const characters = await Promise.all([
        prisma.character.create({
            data: {
                name: 'Рыцарь',
                description: 'Доблестный воин, защитник слабых',
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
                description: 'Мастер магии и заклинаний',
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
                description: 'Мастер дальнего боя',
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
                description: 'Природный охотник',
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
                description: 'Светлый рыцарь, защитник веры',
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
                description: 'Мастер скрытности и теней',
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
                description: 'Эксперт по технологиям и технике',
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
                description: 'Повелитель неба и ветра',
                imageUrl: 'https://images.unsplash.com/photo-1504603735695-329cc8535258?w=400&h=400&fit=crop&q=80',
                price: 0,
                isFree: true,
                isActive: true,
                sortOrder: 8,
            },
        }),
        prisma.character.create({
            data: {
                name: 'Супермен',
                description: 'Неограниченная сила и неуязвимость',
                imageUrl: 'https://images.unsplash.com/photo-1535442979339-7529a885628c?w=400&h=400&fit=crop&q=80',
                price: 50000,
                isFree: false,
                isActive: true,
                sortOrder: 9,
            },
        }),
        prisma.character.create({
            data: {
                name: 'Бэтмен',
                description: 'Гений, миллиардер, филантроп',
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
                description: 'Невероятная выносливость и защита',
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
                description: 'Самая быстрая сущность вселенной',
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
                description: 'Правитель океанов и морских обитателей',
                imageUrl: 'https://images.unsplash.com/photo-1544043536-c2578d931495?w=400&h=400&fit=crop&q=80',
                price: 50000,
                isFree: false,
                isActive: true,
                sortOrder: 13,
            },
        }),
    ]);
    console.log(`✅ Created ${characters.length} characters`);
    const tariffs = await Promise.all([
        prisma.tariff.create({
            data: {
                name: '1 час Comfort',
                description: '1 час игры на компьютере Comfort',
                durationMinutes: 60,
                price: 12000,
                categoryId: categories[0].id,
                isActive: true,
                sortOrder: 1,
            },
        }),
        prisma.tariff.create({
            data: {
                name: '1 час Standard',
                description: '1 час игры на компьютере Standard',
                durationMinutes: 60,
                price: 30000,
                categoryId: categories[1].id,
                isActive: true,
                sortOrder: 2,
            },
        }),
        prisma.tariff.create({
            data: {
                name: '1 час Premium',
                description: '1 час игры на компьютере Premium',
                durationMinutes: 60,
                price: 50000,
                categoryId: categories[2].id,
                isActive: true,
                sortOrder: 3,
            },
        }),
        prisma.tariff.create({
            data: {
                name: '1 час Ronin Rooms',
                description: '1 час игры в закрытом кабинете',
                durationMinutes: 60,
                price: 60000,
                categoryId: categories[3].id,
                isActive: true,
                sortOrder: 4,
            },
        }),
        prisma.tariff.create({
            data: {
                name: '3 часа (любой)',
                description: '3 часа игры на любом компьютере',
                durationMinutes: 180,
                price: 30000,
                categoryId: categories[0].id,
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
