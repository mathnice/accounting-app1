import { Request, Response, NextFunction } from 'express';
import * as TransactionModel from '../models/TransactionInsforge';
import { insforge } from '../config/insforgeDb';
import { successResponse } from '../utils/response';

export const getTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, startDate, endDate, type, categoryId, accountId } = req.query;
    const result = await TransactionModel.getTransactions(req.user!.userId, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      startDate: startDate as string,
      endDate: endDate as string,
      type: type as TransactionModel.TransactionType,
      categoryId: categoryId as string,
      accountId: accountId as string
    });

    // 获取分类和账户信息
    const categoryIds = [...new Set(result.transactions.map(tx => tx.category_id))];
    const accountIds = [...new Set(result.transactions.map(tx => tx.account_id))];

    const { data: categories } = await insforge.database.from('categories').select('*');
    const { data: accounts } = await insforge.database.from('accounts').select('*');

    const categoryMap = new Map((categories || []).map((c: any) => [c.id, c]));
    const accountMap = new Map((accounts || []).map((a: any) => [a.id, a]));

    const transactions = result.transactions.map(tx => {
      const category = categoryMap.get(tx.category_id);
      const account = accountMap.get(tx.account_id);
      return TransactionModel.toTransaction(tx, 
        category ? { _id: category.id, name: category.name, icon: category.icon, color: category.color } : tx.category_id,
        account ? { _id: account.id, name: account.name, icon: account.icon } : tx.account_id
      );
    });

    return successResponse(res, { transactions, total: result.total, page: result.page, limit: result.limit });
  } catch (error) { next(error); }
};

export const getTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tx = await TransactionModel.getTransactionById(req.params.id, req.user!.userId);
    return successResponse(res, { transaction: tx ? TransactionModel.toTransaction(tx) : null });
  } catch (error) { next(error); }
};

export const createTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accountId, categoryId, type, amount, date, note, paymentMethod } = req.body;
    const tx = await TransactionModel.createTransaction(req.user!.userId, { accountId, categoryId, type, amount, date, note, paymentMethod });
    if (!tx) {
      return res.status(500).json({ success: false, error: { message: 'Failed to create transaction' } });
    }
    return successResponse(res, { transaction: TransactionModel.toTransaction(tx) }, 201);
  } catch (error) { next(error); }
};

export const updateTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tx = await TransactionModel.updateTransaction(req.params.id, req.user!.userId, req.body);
    return successResponse(res, { transaction: tx ? TransactionModel.toTransaction(tx) : null });
  } catch (error) { next(error); }
};

export const deleteTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await TransactionModel.deleteTransaction(req.params.id, req.user!.userId);
    return successResponse(res, { message: 'Transaction deleted' });
  } catch (error) { next(error); }
};

export const batchDeleteTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ids } = req.body;
    const deletedCount = await TransactionModel.batchDeleteTransactions(ids, req.user!.userId);
    return successResponse(res, { deletedCount });
  } catch (error) { next(error); }
};

export const batchExportTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await TransactionModel.getTransactions(req.user!.userId, { limit: 10000 });
    const headers = ['Date', 'Type', 'Amount', 'Note'];
    const rows = result.transactions.map(t => [t.date, t.type === 'income' ? 'Income' : 'Expense', (t.amount / 100).toFixed(2), t.note]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    return res.send('\uFEFF' + csv);
  } catch (error) { next(error); }
};
