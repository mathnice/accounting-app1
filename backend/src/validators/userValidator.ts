import { body, ValidationChain } from 'express-validator';

// Email validation
const emailValidation = body('email')
  .trim()
  .notEmpty().withMessage('Email is required')
  .isEmail().withMessage('Invalid email format');

// Password validation
const passwordValidation = body('password')
  .notEmpty().withMessage('Password is required')
  .isLength({ min: 6 }).withMessage('Password must be at least 6 characters');

// Code validation
const codeValidation = body('code')
  .trim()
  .notEmpty().withMessage('Verification code is required')
  .isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits');

// Register validation
export const registerValidation: ValidationChain[] = [
  emailValidation,
  codeValidation,
  passwordValidation,
  body('nickname')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Nickname must be 20 characters or less')
];

// Login validation
export const loginValidation: ValidationChain[] = [
  emailValidation,
  passwordValidation
];

// Code login validation
export const codeLoginValidation: ValidationChain[] = [
  emailValidation,
  codeValidation
];

// Send code validation
export const sendCodeValidation: ValidationChain[] = [
  emailValidation,
  body('type')
    .trim()
    .notEmpty().withMessage('Type is required')
    .isIn(['register', 'login', 'reset']).withMessage('Invalid type')
];

// Reset password validation
export const resetPasswordValidation: ValidationChain[] = [
  emailValidation,
  codeValidation,
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Change password validation
export const changePasswordValidation: ValidationChain[] = [
  body('oldPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Update profile validation
export const updateProfileValidation: ValidationChain[] = [
  body('nickname')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Nickname must be 20 characters or less'),
  body('avatar')
    .optional()
    .trim()
    .isURL().withMessage('Invalid avatar URL'),
  body('reminderEnabled')
    .optional()
    .isBoolean().withMessage('reminderEnabled must be boolean'),
  body('reminderTime')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Invalid time format')
];
