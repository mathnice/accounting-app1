import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';

export interface IVerificationCode {
  id: string;
  email: string;
  code: string;
  type: string;
  expires_at: string;
  used: number;
  created_at: string;
}

// Generate 6-digit code
const generateCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create verification code
export const createVerificationCode = (email: string, type: string): IVerificationCode => {
  const id = uuidv4();
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
  const now = new Date().toISOString();

  // Delete old unused codes for this email and type
  db.prepare('DELETE FROM verification_codes WHERE email = ? AND type = ? AND used = 0').run(email, type);

  db.prepare(`
    INSERT INTO verification_codes (id, email, code, type, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, email, code, type, expiresAt, now);

  return { id, email, code, type, expires_at: expiresAt, used: 0, created_at: now };
};

// Verify code
export const verifyCode = (email: string, code: string, type: string): boolean => {
  const record = db.prepare(`
    SELECT * FROM verification_codes 
    WHERE email = ? AND code = ? AND type = ? AND used = 0 AND expires_at > ?
    ORDER BY created_at DESC LIMIT 1
  `).get(email, code, type, new Date().toISOString()) as IVerificationCode | null;

  if (!record) return false;

  // Mark as used
  db.prepare('UPDATE verification_codes SET used = 1 WHERE id = ?').run(record.id);
  return true;
};

// Check if code exists (for rate limiting)
export const hasRecentCode = (email: string, type: string): boolean => {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
  const record = db.prepare(`
    SELECT * FROM verification_codes 
    WHERE email = ? AND type = ? AND created_at > ?
    LIMIT 1
  `).get(email, type, oneMinuteAgo);
  return !!record;
};
