import { Router } from 'express';
import * as accountController from '../controllers/accountController';
import { validate } from '../middlewares/validate';
import { requireAuth } from '../middlewares/insforgeAuth';
import {
  createAccountValidation,
  updateAccountValidation,
  deleteAccountValidation,
  getAccountValidation
} from '../validators/accountValidator';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// 获取账户列表
router.get('/', accountController.getAccounts);

// 初始化默认账户
router.post('/initialize', accountController.initializeAccount);

// 获取账户详情
router.get('/:id', validate(getAccountValidation), accountController.getAccount);

// 获取账户流水
router.get('/:id/transactions', validate(getAccountValidation), accountController.getAccountTransactions);

// 创建账户
router.post('/', validate(createAccountValidation), accountController.createAccount);

// 更新账户
router.put('/:id', validate(updateAccountValidation), accountController.updateAccount);

// 设置默认账户
router.put('/:id/default', validate(getAccountValidation), accountController.setDefaultAccount);

// 删除账户
router.delete('/:id', validate(deleteAccountValidation), accountController.deleteAccount);

export default router;
