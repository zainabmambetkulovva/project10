# RONIN - Premium Gaming Club Platform

Премиум платформа управления компьютерным клубом RONIN в Бишкеке, Кыргызстан.

## 🚀 Особенности

- 🎮 Управление 96 компьютерами в 4 категориях
- 📅 Система бронирования с предотвращением двойных броней
- 💳 Онлайн-оплата и наличная оплата через менеджера
- 👾 13 персонажей (8 бесплатных + 5 платных)
- 🧾 Электронные чеки с QR-кодами
- 🕹️ Управление игровыми сессиями
- 👮 Панели менеджера и администратора
- 🌐 Мультиязычность: KY/RU/EN
- 🎨 Современный дизайн с анимациями
- 🤖 AI-помощник

## 🛠️ Технологический стек

### Backend
- Node.js + Express
- Neon PostgreSQL (через Prisma ORM)
- TypeScript
- JWT аутентификация
- i18n для мультиязычности

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- Radix UI

## 📁 Структура проекта

```
ronin/
├── backend/           # Express backend сервер
│   ├── src/
│   │   ├── config/   # Конфигурация
│   │   ├── services/ # Бизнес-логика
│   │   ├── routes/   # API роуты
│   │   ├── middleware/ # Промежуточное ПО
│   │   └── server.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── package.json
├── frontend/          # Next.js frontend приложение
│   ├── src/
│   │   ├── app/      # Страницы Next.js
│   │   ├── components/ # UI компоненты
│   │   └── lib/      # Утилиты
│   └── package.json
└── docs/              # Документация
```

## 🚀 Быстрый старт

### Требования
- Node.js >= 18
- PostgreSQL (Neon)

### Установка

```bash
# Установить зависимости
cd ronin/backend && npm install
cd ../frontend && npm install

# Настроить переменные окружения
cp backend/.env.example backend/.env
# Отредактируйте backend/.env и добавьте настройки

# Запустить миграции
cd backend
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Запустить серверы
cd backend && npm run dev
cd frontend && npm run dev
```

## 🌐 Мультиязычность

По умолчанию язык: **Русский (ru)**

Поддерживаемые языки: ky, ru, en

## 📊 База данных

Схема БД включает:
- Users (пользователи)
- Characters (персонажи)
- Computers (компьютеры)
- Bookings (бронирования)
- Payments (платежи)
- Receipts (чеки)
- Gaming Sessions (сессии)
- CMS (контент-менеджмент)
- и другие...

## 📖 Документация

- [Архитектура](docs/ARCHITECTURE.md)
- [База данных](docs/DATABASE.md)
- [Развёртывание](docs/DEPLOYMENT.md)
- [Настройка окружения](docs/ENVIRONMENT.md)
- [Платежи](docs/PAYMENTS.md)
- [Аутентификация](docs/AUTHENTICATION.md)
- [Безопасность](docs/SECURITY.md)

## 🤝 Разработка

```bash
# Запустить dev серверы
npm run dev

# Запустить linter
npm run lint

# Проверить типы
npm run typecheck

# Собрать для продакшена
npm run build
```

## 📄 Лицензия

MIT License

## 👥 Авторы

RONIN Team

## 🙏 Благодарности

Спасибо за использование RONIN!

---

**Приятного использования! 🎮**
