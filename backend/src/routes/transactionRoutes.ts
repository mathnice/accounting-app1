import { Router } from 'express';
import * as transactionController from '../controllers/transactionController';
import { validate } from '../middlewares/validate';
import { requireAuth } from '../middlewares/insforgeAuth';
import {
  createTransactionValidation,
  updateTransactionValidation,
  deleteTransactionValidation,
  batchDeleteValidation,
  getTransactionsValidation,
  batchExportValidation
} from '../validators/transactionValidator';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// 获取交易记录列表
router.get('/', validate(getTransactionsValidation), transactionController.getTransactions);

// 获取交易记录详情
router.get('/:id', validate(deleteTransactionValidation), transactionController.getTransaction);

// 创建交易记录
router.post('/', validate(createTransactionValidation), transactionController.createTransaction);

// 更新交易记录
router.put('/:id', validate(updateTransactionValidation), transactionController.updateTransaction);

// 删除交易记录
router.delete('/:id', validate(deleteTransactionValidation), transactionController.deleteTransaction);

// 批量删除
router.post('/batch/delete', validate(batchDeleteValidation), transactionController.batchDeleteTransactions);

// 批量导出
router.post('/batch/export', validate(batchExportValidation), transactionController.batchExportTransactions);

export default router;
