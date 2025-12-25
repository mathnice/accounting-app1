import { Request, Response, NextFunction } from 'express';
import * as statisticsService from '../services/statisticsService';
import { successResponse } from '../utils/response';

export const getSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period, startDate, endDate } = req.query;
    const result = statisticsService.getSummary(
      req.user!.userId,
      period as statisticsService.TimePeriod,
      startDate as string,
      endDate as string
    );
    return successResponse(res, result);
  } catch (error) { next(error); }
};

export const getCategoryStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type = 'expense', period, startDate, endDate } = req.query;
    const result = statisticsService.getCategoryStats(
      req.user!.userId,
      type as string,
      period as statisticsService.TimePeriod,
      startDate as string,
      endDate as string
    );
    return successResponse(res, { categories: result });
  } catch (error) { next(error); }
};

export const getTrendData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = 'week' } = req.query;
    const result = statisticsService.getTrendData(req.user!.userId, period as statisticsService.TimePeriod);
    return successResponse(res, { data: result });
  } catch (error) { next(error); }
};

export const generateReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return successResponse(res, { transactions: [] });
  } catch (error) { next(error); }
};
