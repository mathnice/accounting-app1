import { Request, Response, NextFunction } from 'express';
import * as AccountModel from '../models/Account';
import { successResponse } from '../utils/response';

export const getAccounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accounts = AccountModel.getAccountsByUser(req.user!.userId);
    return successResponse(res, { accounts: accounts.map(AccountModel.toAccount) });
  } catch (error) { next(error); }
};

export const getAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const account = AccountModel.getAccountById(req.params.id, req.user!.userId);
    return successResponse(res, { account: account ? AccountModel.toAccount(account) : null });
  } catch (error) { next(error); }
};

export const createAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, initialBalance, icon } = req.body;
    const account = AccountModel.createAccount(req.user!.userId, { name, initialBalance, icon });
    return successResponse(res, { account: AccountModel.toAccount(account) }, 201);
  } catch (error) { next(error); }
};

export const updateAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, initialBalance, icon } = req.body;
    const account = AccountModel.updateAccount(req.params.id, req.user!.userId, { name, initialBalance, icon });
    return successResponse(res, { account: account ? AccountModel.toAccount(account) : null });
  } catch (error) { next(error); }
};

export const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    AccountModel.deleteAccount(req.params.id, req.user!.userId);
    return successResponse(res, { message: 'Account deleted' });
  } catch (error) { next(error); }
};

export const setDefaultAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const account = AccountModel.setDefaultAccount(req.params.id, req.user!.userId);
    return successResponse(res, { account: account ? AccountModel.toAccount(account) : null });
  } catch (error) { next(error); }
};

export const getAccountTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return successResponse(res, { transactions: [], total: 0, page: 1, limit: 20 });
  } catch (error) { next(error); }
};

export const initializeAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accounts = AccountModel.initializeDefaultAccounts(req.user!.userId);
    return successResponse(res, { 
      accounts: accounts.map(AccountModel.toAccount),
      message: accounts.length > 0 ? 'Default accounts initialized' : 'Accounts already exist'
    });
  } catch (error) { next(error); }
};
