import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string(),
  DATABASE_URL_UNPOOLED: z.string().optional(),
  REDIS_URL: z.string().optional(),
  SESSION_SECRET: z.string().min(32),
  DEFAULT_LOCALE: z.enum(['ky', 'ru', 'en']).default('ru'),
  SUPPORTED_LOCALES: z.string().default('ky,ru,en'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),

  // SMS Provider
  SMS_PROVIDER: z.enum(['twilio', 'smsru', 'custom']).default('custom'),
  SMS_API_KEY: z.string().optional(),
  SMS_API_SECRET: z.string().optional(),
  SMS_SENDER_ID: z.string().optional(),

  // Email Provider
  EMAIL_PROVIDER: z.enum(['resend', 'nodemailer', 'custom']).default('nodemailer'),
  EMAIL_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  // Payment Provider
  PAYMENT_PROVIDER: z.enum(['e-pay.kg', 'payme', 'custom']).default('custom'),
  PAYMENT_API_KEY: z.string().optional(),
  PAYMENT_API_SECRET: z.string().optional(),
  PAYMENT_WEBHOOK_SECRET: z.string().optional(),
  PAYMENT_MERCHANT_ID: z.string().optional(),
  PAYMENT_RETURN_URL: z.string().optional(),
  PAYMENT_CANCEL_URL: z.string().optional(),

  // S3
  S3_ENDPOINT: z.string().optional(),
  S3_REGION: z.string().default('us-east-1'),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_BASE_URL: z.string().optional(),

  // AI
  AI_PROVIDER: z.enum(['openai', 'gemini', 'none']).default('none'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-pro'),
  AI_ENABLED: z.coerce.boolean().default(false),

  // Cron
  CRON_SECRET: z.string().min(32),

  // Logger
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

const env = envSchema.parse(process.env);

export { env as config };
