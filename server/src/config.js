import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

export const PORT = process.env.PORT || 5000;
export const JWT_SECRET = process.env.JWT_SECRET || 'dardasha-super-secret-key-2026';
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
export const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
export const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Dardasha Security <onboarding@resend.dev>';
export const MONGODB_URI = process.env.MONGODB_URI || '';
export const UPLOAD_DIR = path.join(__dirname, '../uploads');
export const DATA_DIR = path.join(__dirname, '../data');

// Email configurations strictly sourced from environment variables (.env)
export const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
};
