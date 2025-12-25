import { Request, Response, NextFunction } from 'express';
import { successResponse } from '../utils/response';

export const pushChanges = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return successResponse(res, { synced: 0, conflicts: [] });
  } catch (error) { next(error); }
};

export const pullChanges = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return successResponse(res, { changes: [], serverTime: new Date().toISOString() });
  } catch (error) { next(error); }
};

export const createBackup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return successResponse(res, { backup: {} });
  } catch (error) { next(error); }
};

export const restoreBackup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return successResponse(res, { message: '数据恢复成功' });
  } catch (error) { next(error); }
};
