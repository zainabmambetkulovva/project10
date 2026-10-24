"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../middleware/auth");
const env_1 = require("../config/env");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const SALT_ROUNDS = 10;
router.post('/register', [
    (0, express_validator_1.check)('firstName').trim().notEmpty(),
    (0, express_validator_1.check)('lastName').trim().notEmpty(),
    (0, express_validator_1.check)('phone').trim().notEmpty(),
    (0, express_validator_1.check)('email').trim().optional().isEmail(),
    (0, express_validator_1.check)('password').isLength({ min: 6 }),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { firstName, lastName, phone, email, password } = req.body;
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ phone }, { email }],
            },
        });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const passwordHash = await bcrypt_1.default.hash(password, SALT_ROUNDS);
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
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            phone: user.phone,
            role: user.role,
        }, env_1.config.SESSION_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: env_1.config.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(201).json({
            user,
            token,
            message: 'Registration successful',
        });
    }
    catch (error) {
        console.error('[REGISTER ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/login', [
    (0, express_validator_1.check)('emailOrPhone').trim().notEmpty(),
    (0, express_validator_1.check)('password').notEmpty(),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { emailOrPhone, password } = req.body;
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
        const isPasswordValid = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Login failed' });
        }
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            phone: user.phone,
            role: user.role,
        }, env_1.config.SESSION_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: env_1.config.NODE_ENV === 'production',
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
    }
    catch (error) {
        console.error('[LOGIN ERROR]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/logout', auth_1.authMiddleware, (req, res) => {
    try {
        res.clearCookie('token');
        res.json({ message: 'Logged out' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/me', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
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
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/verify-phone/request', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ error: 'Not found' });
        }
        if (user.isPhoneVerified) {
            return res.status(400).json({ error: 'Phone already verified' });
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await prisma.phoneVerification.create({
            data: {
                phone: user.phone,
                code,
                expiresAt,
                isUsed: false,
            },
        });
        console.log(`[OTP] Code for ${user.phone}: ${code}`);
        res.json({
            message: 'Code sent',
            expiresAt,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/verify-phone/confirm', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { code } = req.body;
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.phone) {
            return res.status(404).json({ error: 'Not found' });
        }
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
        await prisma.user.update({
            where: { id: userId },
            data: {
                isPhoneVerified: true,
            },
        });
        await prisma.phoneVerification.update({
            where: { id: verification.id },
            data: { isUsed: true },
        });
        res.json({
            message: 'Phone verified',
            isPhoneVerified: true,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/google/callback', async (req, res) => {
    const { code, state } = req.query;
    if (!code) {
        return res.redirect(`${env_1.config.FRONTEND_URL}/login?error=no_code`);
    }
    res.redirect(`${env_1.config.FRONTEND_URL}/auth/callback?code=${code}&state=${state}`);
});
exports.default = router;
