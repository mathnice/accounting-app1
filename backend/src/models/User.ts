import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import config from '../config';

export interface IUser {
  id: string;
  email: string;
  password: string;
  nickname: string;
  avatar: string;
  email_verified: number;
  reminder_enabled: number;
  reminder_time: string;
  created_at: string;
  updated_at: string;
}

// Create user
export const createUser = (email: string, password: string, nickname?: string): IUser => {
  const id = uuidv4();
  const hashedPassword = bcrypt.hashSync(password, config.bcryptRounds);
  const now = new Date().toISOString();
  
  db.prepare(`
    INSERT INTO users (id, email, password, nickname, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, email, hashedPassword, nickname || `User${email.split('@')[0].slice(0, 6)}`, now, now);
  
  return findUserById(id)!;
};

// Find user by ID
export const findUserById = (id: string): IUser | null => {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as IUser | null;
};

// Find user by email
export const findUserByEmail = (email: string): IUser | null => {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as IUser | null;
};

// Update user
export const updateUser = (id: string, data: Partial<IUser>): IUser | null => {
  const fields: string[] = [];
  const values: any[] = [];
  
  if (data.nickname !== undefined) { fields.push('nickname = ?'); values.push(data.nickname); }
  if (data.avatar !== undefined) { fields.push('avatar = ?'); values.push(data.avatar); }
  if (data.email_verified !== undefined) { fields.push('email_verified = ?'); values.push(data.email_verified); }
  if (data.reminder_enabled !== undefined) { fields.push('reminder_enabled = ?'); values.push(data.reminder_enabled); }
  if (data.reminder_time !== undefined) { fields.push('reminder_time = ?'); values.push(data.reminder_time); }
  if (data.password !== undefined) { 
    fields.push('password = ?'); 
    values.push(bcrypt.hashSync(data.password, config.bcryptRounds)); 
  }
  
  if (fields.length === 0) return findUserById(id);
  
  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id);
  
  db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return findUserById(id);
};

// Verify password
export const comparePassword = (password: string, hashedPassword: string): boolean => {
  return bcrypt.compareSync(password, hashedPassword);
};

// Convert to safe user object (without password)
export const toSafeUser = (user: IUser) => {
  const { password, ...safeUser } = user;
  return {
    _id: safeUser.id,
    email: safeUser.email,
    nickname: safeUser.nickname,
    avatar: safeUser.avatar,
    emailVerified: !!safeUser.email_verified,
    reminderEnabled: !!safeUser.reminder_enabled,
    reminderTime: safeUser.reminder_time,
    createdAt: safeUser.created_at,
    updatedAt: safeUser.updated_at
  };
};
