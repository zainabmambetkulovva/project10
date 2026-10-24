"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.coerce.number().default(5000),
    DATABASE_URL: zod_1.z.string(),
    DATABASE_URL_UNPOOLED: zod_1.z.string().optional(),
    REDIS_URL: zod_1.z.string().optional(),
    SESSION_SECRET: zod_1.z.string().min(32),
    DEFAULT_LOCALE: zod_1.z.enum(['ky', 'ru', 'en']).default('ru'),
    SUPPORTED_LOCALES: zod_1.z.string().default('ky,ru,en'),
    FRONTEND_URL: zod_1.z.string().default('http://localhost:3000'),
    GOOGLE_CLIENT_ID: zod_1.z.string().optional(),
    GOOGLE_CLIENT_SECRET: zod_1.z.string().optional(),
    GOOGLE_CALLBACK_URL: zod_1.z.string().optional(),
    SMS_PROVIDER: zod_1.z.enum(['twilio', 'smsru', 'custom']).default('custom'),
    SMS_API_KEY: zod_1.z.string().optional(),
    SMS_API_SECRET: zod_1.z.string().optional(),
    SMS_SENDER_ID: zod_1.z.string().optional(),
    EMAIL_PROVIDER: zod_1.z.enum(['resend', 'nodemailer', 'custom']).default('nodemailer'),
    EMAIL_API_KEY: zod_1.z.string().optional(),
    EMAIL_FROM: zod_1.z.string().optional(),
    PAYMENT_PROVIDER: zod_1.z.enum(['e-pay.kg', 'payme', 'custom']).default('custom'),
    PAYMENT_API_KEY: zod_1.z.string().optional(),
    PAYMENT_API_SECRET: zod_1.z.string().optional(),
    PAYMENT_WEBHOOK_SECRET: zod_1.z.string().optional(),
    PAYMENT_MERCHANT_ID: zod_1.z.string().optional(),
    PAYMENT_RETURN_URL: zod_1.z.string().optional(),
    PAYMENT_CANCEL_URL: zod_1.z.string().optional(),
    S3_ENDPOINT: zod_1.z.string().optional(),
    S3_REGION: zod_1.z.string().default('us-east-1'),
    S3_BUCKET: zod_1.z.string().optional(),
    S3_ACCESS_KEY_ID: zod_1.z.string().optional(),
    S3_SECRET_ACCESS_KEY: zod_1.z.string().optional(),
    S3_PUBLIC_BASE_URL: zod_1.z.string().optional(),
    AI_PROVIDER: zod_1.z.enum(['openai', 'gemini', 'none']).default('none'),
    OPENAI_API_KEY: zod_1.z.string().optional(),
    OPENAI_MODEL: zod_1.z.string().default('gpt-4o-mini'),
    GEMINI_API_KEY: zod_1.z.string().optional(),
    GEMINI_MODEL: zod_1.z.string().default('gemini-pro'),
    AI_ENABLED: zod_1.z.coerce.boolean().default(false),
    CRON_SECRET: zod_1.z.string().min(32),
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});
const env = envSchema.parse(process.env);
exports.config = env;
