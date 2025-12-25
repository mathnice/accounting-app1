import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { successResponse } from '../utils/response';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code, password, nickname } = req.body;
    const result = await authService.registerUser(email, code, password, nickname);
    return successResponse(res, { token: result.token, user: result.user }, 201);
  } catch (error) { next(error); }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginWithPassword(email, password);
    return successResponse(res, { token: result.token, user: result.user });
  } catch (error) { next(error); }
};

export const codeLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code } = req.body;
    const result = await authService.loginWithCode(email, code);
    return successResponse(res, { token: result.token, user: result.user });
  } catch (error) { next(error); }
};

export const sendCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, type } = req.body;
    const result = await authService.sendVerificationCode(email, type);
    return successResponse(res, result);
  } catch (error) { next(error); }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code, newPassword } = req.body;
    await authService.resetPassword(email, code, newPassword);
    return successResponse(res, { message: 'Password reset successful' });
  } catch (error) { next(error); }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getUserById(req.user!.userId);
    return successResponse(res, { user });
  } catch (error) { next(error); }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.updateUserProfile(req.user!.userId, req.body);
    return successResponse(res, { user });
  } catch (error) { next(error); }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { oldPassword, newPassword } = req.body;
    await authService.changePassword(req.user!.userId, oldPassword, newPassword);
    return successResponse(res, { message: 'Password changed successfully' });
  } catch (error) { next(error); }
};
