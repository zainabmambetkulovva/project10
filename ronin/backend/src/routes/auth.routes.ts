import { Router } from 'express';
import { body, check, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';
import { authMiddleware, requireRole } from '../middleware/auth';
import { config } from '../config/env';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

// Регистрация пользователя
router.post(
  '/register',
  [
    check('firstName').trim().notEmpty(),
    check('lastName').trim().notEmpty(),
    check('phone').trim().notEmpty(),
    check('email').trim().optional().isEmail(),
    check('password').isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { firstName, lastName, phone, email, password } = req.body;

      // Проверяем, существует ли пользователь
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ phone }, { email }],
        },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Хешируем пароль
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      // Создаем пользователя
      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          phone,
          email: email || null,
          passwordHash,
          role: 'CUSTOMER',
          isPhoneVerified: false,
          isActive: true,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          isPhoneVerified: true,
          createdAt: true,
        },
      });

      // Генерируем токен
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        config.SESSION_SECRET,
        { expiresIn: '7d' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        user,
        token,
        message: 'Registration successful',
      });
    } catch (error) {
      console.error('[REGISTER ERROR]', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Вход пользователя
router.post(
  '/login',
  [
    check('emailOrPhone').trim().notEmpty(),
    check('password').notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { emailOrPhone, password } = req.body;

      // Ищем пользователя по email или телефону
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email: emailOrPhone }, { phone: emailOrPhone }],
        },
      });

      if (!user) {
        return res.status(401).json({ error: 'Login failed' });
      }

      if (!user.passwordHash) {
        return res.status(401).json({ error: 'Login failed' });
      }

      // Проверяем пароль
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Login failed' });
      }

      // Генерируем токен
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        config.SESSION_SECRET,
        { expiresIn: '7d' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isPhoneVerified: user.isPhoneVerified,
          locale: user.locale,
          characterId: user.characterId,
        },
        token,
        message: 'Login successful',
      });
    } catch (error) {
      console.error('[LOGIN ERROR]', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

// Выход пользователя
router.post('/logout', authMiddleware, (req, res) => {
  try {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Получение текущего пользователя
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isPhoneVerified: true,
        locale: true,
        isActive: true,
        characterId: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Начало подтверждения телефона (отправка OTP)
router.post('/verify-phone/request', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'Not found' });
    }

    // Проверяем, не подтвержден ли телефон уже
    if (user.isPhoneVerified) {
      return res.status(400).json({ error: 'Phone already verified' });
    }

    // Генерируем OTP код
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    // Сохраняем верификацию
    await prisma.phoneVerification.create({
      data: {
        phone: user.phone!,
        code,
        expiresAt,
        isUsed: false,
      },
    });

    // TODO: Отправить SMS через провайдера
    console.log(`[OTP] Code for ${user.phone}: ${code}`);

    res.json({
      message: 'Code sent',
      expiresAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Подтверждение телефона (проверка OTP)
router.post('/verify-phone/confirm', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { code } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.phone) {
      return res.status(404).json({ error: 'Not found' });
    }

    // Находим активную верификацию
    const verification = await prisma.phoneVerification.findFirst({
      where: {
        phone: user.phone,
        code,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification) {
      return res.status(400).json({ error: 'Invalid OTP code' });
    }

    // Обновляем пользователя
    await prisma.user.update({
      where: { id: userId },
      data: {
        isPhoneVerified: true,
      },
    });

    // Помечаем верификацию как использованную
    await prisma.phoneVerification.update({
      where: { id: verification.id },
      data: { isUsed: true },
    });

    res.json({
      message: 'Phone verified',
      isPhoneVerified: true,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Google OAuth callback
router.get('/google/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.redirect(`${config.FRONTEND_URL}/login?error=no_code`);
  }

  // TODO: Обработать OAuth callback от Google
  // 1. Обменять code на access token
  // 2. Получить данные пользователя от Google
  // 3. Найти или создать пользователя
  // 4. Создать токен и перенаправить на frontend

  res.redirect(`${config.FRONTEND_URL}/auth/callback?code=${code}&state=${state}`);
});

export default router;







