import { Router } from 'express';
import * as statisticsController from '../controllers/statisticsController';
import { validate } from '../middlewares/validate';
import { requireAuth } from '../middlewares/insforgeAuth';
import {
  summaryValidation,
  categoryStatsValidation,
  trendValidation,
  reportValidation
} from '../validators/statisticsValidator';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// 获取收支汇总
router.get('/summary', validate(summaryValidation), statisticsController.getSummary);

// 获取分类统计
router.get('/category', validate(categoryStatsValidation), statisticsController.getCategoryStats);

// 获取趋势数据
router.get('/trend', validate(trendValidation), statisticsController.getTrendData);

// 生成报表
router.post('/report', validate(reportValidation), statisticsController.generateReport);

export default router;
