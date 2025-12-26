import { Request, Response, NextFunction } from 'express';
import * as AccountModel from '../models/AccountInsforge';
import { successResponse } from '../utils/response';

export const getAccounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accounts = await AccountModel.getAccountsByUser(req.user!.userId);
    return successResponse(res, { accounts: accounts.map(AccountModel.toAccount) });
  } catch (error) { next(error); }
};

export const getAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const account = await AccountModel.getAccountById(req.params.id, req.user!.userId);
    return successResponse(res, { account: account ? AccountModel.toAccount(account) : null });
  } catch (error) { next(error); }
};

export const createAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, initialBalance, icon } = req.body;
    const account = await AccountModel.createAccount(req.user!.userId, { name, initialBalance, icon });
    if (!account) {
      return res.status(500).json({ success: false, error: { message: 'Failed to create account' } });
    }
    return successResponse(res, { account: AccountModel.toAccount(account) }, 201);
  } catch (error) { next(error); }
};

export const updateAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, icon } = req.body;
    const account = await AccountModel.updateAccount(req.params.id, req.user!.userId, { name, icon });
    return successResponse(res, { account: account ? AccountModel.toAccount(account) : null });
  } catch (error) { next(error); }
};

export const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await AccountModel.deleteAccount(req.params.id, req.user!.userId);
    return successResponse(res, { message: 'Account deleted' });
  } catch (error) { next(error); }
};

export const setDefaultAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: Implement set default account
    return successResponse(res, { account: null });
  } catch (error) { next(error); }
};

export const getAccountTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return successResponse(res, { transactions: [], total: 0, page: 1, limit: 20 });
  } catch (error) { next(error); }
};

export const initializeAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accounts = await AccountModel.initializeDefaultAccounts(req.user!.userId);
    // 如果没有新建账户，获取现有账户
    if (accounts.length === 0) {
      const existingAccounts = await AccountModel.getAccountsByUser(req.user!.userId);
      return successResponse(res, { 
        accounts: existingAccounts.map(AccountModel.toAccount),
        message: 'Accounts already exist'
      });
    }
    return successResponse(res, { 
      accounts: accounts.map(AccountModel.toAccount),
      message: 'Default accounts initialized'
    });
  } catch (error) { next(error); }
};
