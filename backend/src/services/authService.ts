import jwt from 'jsonwebtoken';
import config from '../config';
import * as UserModel from '../models/User';
import * as VerificationCodeModel from '../models/VerificationCode';
import { sendVerificationEmail } from './emailService';
import { createUnauthorizedError, createConflictError, createNotFoundError, createBadRequestError } from '../utils/errors';

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Generate JWT token
export const generateToken = (user: UserModel.IUser): string => {
  const payload: JwtPayload = { userId: user.id, email: user.email };
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn } as jwt.SignOptions);
};

// Verify JWT token
export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, config.jwtSecret) as JwtPayload;
  } catch (error) {
    if ((error as Error).name === 'TokenExpiredError') {
      throw createUnauthorizedError('Token expired');
    }
    throw createUnauthorizedError('Invalid token');
  }
};

// Send verification code
export const sendVerificationCode = async (email: string, type: string) => {
  // Check rate limit
  if (VerificationCodeModel.hasRecentCode(email, type)) {
    throw createBadRequestError('Please wait 1 minute before requesting another code');
  }

  // For registration, check if email already exists
  if (type === 'register') {
    const existing = UserModel.findUserByEmail(email);
    if (existing) throw createConflictError('Email already registered');
  }

  // For login/reset, check if user exists
  if (type === 'login' || type === 'reset') {
    const user = UserModel.findUserByEmail(email);
    if (!user) throw createNotFoundError('Email not registered');
  }

  const codeRecord = VerificationCodeModel.createVerificationCode(email, type);
  await sendVerificationEmail(email, codeRecord.code);
  return { message: 'Verification code sent' };
};

// User registration with email verification
export const registerUser = async (email: string, code: string, password: string, nickname?: string) => {
  // Verify code
  const isValid = VerificationCodeModel.verifyCode(email, code, 'register');
  if (!isValid) throw createBadRequestError('Invalid or expired verification code');

  const existing = UserModel.findUserByEmail(email);
  if (existing) throw createConflictError('Email already registered');

  const user = UserModel.createUser(email, password, nickname);
  UserModel.updateUser(user.id, { email_verified: 1 });
  const token = generateToken(user);
  return { user: UserModel.toSafeUser(UserModel.findUserById(user.id)!), token };
};

// Login with email and password
export const loginWithPassword = async (email: string, password: string) => {
  const user = UserModel.findUserByEmail(email);
  if (!user) throw createUnauthorizedError('Email or password incorrect');

  const isMatch = UserModel.comparePassword(password, user.password);
  if (!isMatch) throw createUnauthorizedError('Email or password incorrect');

  const token = generateToken(user);
  return { user: UserModel.toSafeUser(user), token };
};

// Login with email verification code
export const loginWithCode = async (email: string, code: string) => {
  const isValid = VerificationCodeModel.verifyCode(email, code, 'login');
  if (!isValid) throw createBadRequestError('Invalid or expired verification code');

  let user = UserModel.findUserByEmail(email);
  if (!user) {
    throw createNotFoundError('Email not registered');
  }

  const token = generateToken(user);
  return { user: UserModel.toSafeUser(user), token };
};

// Reset password
export const resetPassword = async (email: string, code: string, newPassword: string) => {
  const isValid = VerificationCodeModel.verifyCode(email, code, 'reset');
  if (!isValid) throw createBadRequestError('Invalid or expired verification code');

  const user = UserModel.findUserByEmail(email);
  if (!user) throw createNotFoundError('User not found');
  UserModel.updateUser(user.id, { password: newPassword });
};

// Change password
export const changePassword = async (userId: string, oldPassword: string, newPassword: string) => {
  const user = UserModel.findUserById(userId);
  if (!user) throw createNotFoundError('User not found');

  const isMatch = UserModel.comparePassword(oldPassword, user.password);
  if (!isMatch) throw createUnauthorizedError('Current password incorrect');

  UserModel.updateUser(userId, { password: newPassword });
};

// Get user by ID
export const getUserById = async (userId: string) => {
  const user = UserModel.findUserById(userId);
  if (!user) throw createNotFoundError('User not found');
  return UserModel.toSafeUser(user);
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: any) => {
  const user = UserModel.updateUser(userId, {
    nickname: updates.nickname,
    avatar: updates.avatar,
    reminder_enabled: updates.reminderEnabled ? 1 : 0,
    reminder_time: updates.reminderTime
  });
  if (!user) throw createNotFoundError('User not found');
  return UserModel.toSafeUser(user);
};
