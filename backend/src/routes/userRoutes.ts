import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  registerValidation,
  loginValidation,
  codeLoginValidation,
  sendCodeValidation,
  resetPasswordValidation,
  changePasswordValidation,
  updateProfileValidation
} from '../validators/userValidator';

const router = Router();

// Public routes
router.post('/register', validate(registerValidation), userController.register);
router.post('/login', validate(loginValidation), userController.login);
router.post('/login/code', validate(codeLoginValidation), userController.codeLogin);
router.post('/code/send', validate(sendCodeValidation), userController.sendCode);
router.post('/password/reset', validate(resetPasswordValidation), userController.resetPassword);

// Protected routes
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, validate(updateProfileValidation), userController.updateProfile);
router.put('/password', authMiddleware, validate(changePasswordValidation), userController.changePassword);

export default router;
