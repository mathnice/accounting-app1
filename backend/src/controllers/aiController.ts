import { Request, Response } from 'express';
import { getAIService, isAIServiceConfigured } from '../services/ai';
import { getCategoriesByUser } from '../models/Category';
import { chatWithAssistant, generateMonthlySummary, ChatMessage, MonthlySummaryData, parseTextForBooking, parseImageForBooking, SmartBookingResult } from '../services/insforgeAIService';
import { insforge } from '../config/insforgeDb';

// Parse speech text to transaction
export const parseSpeechText = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    const userId = req.user?.userId;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Text is required' },
      });
    }

    if (!isAIServiceConfigured()) {
      return res.status(503).json({
        success: false,
        error: { code: 'AI_NOT_CONFIGURED', message: 'AI service is not configured' },
      });
    }

    console.log(`[AI Controller] Parsing speech text for user ${userId}: ${text}`);

    const aiService = getAIService();
    const parsed = await aiService.parseTransactionText(text);

    // Try to match category name to existing category ID
    let categoryId: string | null = null;
    if (userId && parsed.categoryName) {
      const categories = getCategoriesByUser(userId, parsed.type);
      const matchedCategory = categories.find(
        (c) => c.name.toLowerCase() === parsed.categoryName.toLowerCase() ||
               c.name.includes(parsed.categoryName) ||
               parsed.categoryName.includes(c.name)
      );
      if (matchedCategory) {
        categoryId = matchedCategory.id;
      }
    }

    return res.json({
      success: true,
      data: {
        ...parsed,
        categoryId,
      },
    });
  } catch (error) {
    console.error('[AI Controller] Error parsing speech text:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'AI_ERROR', message: 'Failed to parse speech text' },
    });
  }
};

// Recognize image (object or receipt)
export const recognizeImage = async (req: Request, res: Response) => {
  try {
    const { image, mode } = req.body;
    const userId = req.user?.userId;

    if (!image || typeof image !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Image is required' },
      });
    }

    if (!mode || !['object', 'receipt'].includes(mode)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Mode must be "object" or "receipt"' },
      });
    }

    if (!isAIServiceConfigured()) {
      return res.status(503).json({
        success: false,
        error: { code: 'AI_NOT_CONFIGURED', message: 'AI service is not configured' },
      });
    }

    console.log(`[AI Controller] Recognizing image for user ${userId}, mode: ${mode}`);

    const aiService = getAIService();
    const result = await aiService.recognizeImage(image, mode);

    // Try to match category name to existing category ID
    let categoryId: string | null = null;
    const categoryName = mode === 'object' 
      ? result.object?.categoryName 
      : result.receipt?.categoryName;
    
    if (userId && categoryName) {
      const categories = getCategoriesByUser(userId, 'expense');
      const matchedCategory = categories.find(
        (c) => c.name.toLowerCase() === categoryName.toLowerCase() ||
               c.name.includes(categoryName) ||
               categoryName.includes(c.name)
      );
      if (matchedCategory) {
        categoryId = matchedCategory.id;
      }
    }

    return res.json({
      success: true,
      data: {
        ...result,
        categoryId,
      },
    });
  } catch (error) {
    console.error('[AI Controller] Error recognizing image:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'AI_ERROR', message: 'Failed to recognize image' },
    });
  }
};

// Suggest categories based on description
export const suggestCategories = async (req: Request, res: Response) => {
  try {
    const { description } = req.body;
    const userId = req.user?.userId;

    if (!description || typeof description !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Description is required' },
      });
    }

    if (!isAIServiceConfigured()) {
      return res.status(503).json({
        success: false,
        error: { code: 'AI_NOT_CONFIGURED', message: 'AI service is not configured' },
      });
    }

    const aiService = getAIService();
    const suggestions = await aiService.suggestCategories(description);

    // Match category names to IDs
    const categories = userId ? getCategoriesByUser(userId) : [];
    const enrichedSuggestions = suggestions.map((s) => {
      const matched = categories.find(
        (c) => c.name.toLowerCase() === s.categoryName.toLowerCase() ||
               c.name.includes(s.categoryName) ||
               s.categoryName.includes(c.name)
      );
      return {
        ...s,
        categoryId: matched?.id || null,
      };
    });

    // Sort by confidence descending
    enrichedSuggestions.sort((a, b) => b.confidence - a.confidence);

    return res.json({
      success: true,
      data: {
        suggestions: enrichedSuggestions.slice(0, 3),
      },
    });
  } catch (error) {
    console.error('[AI Controller] Error suggesting categories:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'AI_ERROR', message: 'Failed to suggest categories' },
    });
  }
};


// AI 智能客服 - 聊天对话
export const chat = async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    const userId = req.user?.userId;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: '消息内容不能为空' },
      });
    }

    console.log(`[AI Controller] Chat request from user ${userId}: ${message.substring(0, 50)}...`);

    // 转换历史记录格式
    const conversationHistory: ChatMessage[] = (history || []).map((h: any) => ({
      role: h.role as 'user' | 'assistant',
      content: h.content,
    }));

    const response = await chatWithAssistant(message, conversationHistory);

    return res.json({
      success: true,
      data: {
        message: response,
      },
    });
  } catch (error: any) {
    console.error('[AI Controller] Chat error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'AI_ERROR', message: error.message || 'AI 服务暂时不可用' },
    });
  }
};

// AI 记账总结 - 生成月度财务分析
export const monthlySummary = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { year, month } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '请先登录' },
      });
    }

    // 获取年月参数，默认当前月
    const now = new Date();
    const targetYear = year ? parseInt(year as string) : now.getFullYear();
    const targetMonth = month ? parseInt(month as string) : now.getMonth() + 1;

    // 计算日期范围
    const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
    const endDate = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0];

    console.log(`[AI Controller] Generating monthly summary for user ${userId}, ${targetYear}-${targetMonth}`);

    // 获取本月交易数据
    const { data: transactions } = await insforge.database
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    // 获取分类信息
    const { data: categories } = await insforge.database
      .from('categories')
      .select('*')
      .eq('user_id', userId);

    const categoryMap = new Map((categories || []).map((c: any) => [c.id, c.name]));

    // 计算统计数据
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals = new Map<string, { amount: number; count: number }>();

    const transactionData = (transactions || []).map((tx: any) => {
      const categoryName = categoryMap.get(tx.category_id) || '未分类';
      
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
        // 只统计支出分类
        const current = categoryTotals.get(categoryName) || { amount: 0, count: 0 };
        current.amount += tx.amount;
        current.count += 1;
        categoryTotals.set(categoryName, current);
      }

      return {
        type: tx.type as 'income' | 'expense',
        amount: tx.amount,
        categoryName,
        date: tx.date,
        note: tx.note,
      };
    });

    // 构建分类统计
    const categoryStats = Array.from(categoryTotals.entries()).map(([name, data]) => ({
      categoryName: name,
      amount: data.amount,
      count: data.count,
      percentage: totalExpense > 0 ? (data.amount / totalExpense) * 100 : 0,
    }));

    const summaryData: MonthlySummaryData = {
      year: targetYear,
      month: targetMonth,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactions: transactionData,
      categoryStats,
    };

    // 如果没有交易数据，返回提示
    if (transactionData.length === 0) {
      return res.json({
        success: true,
        data: {
          summary: `${targetYear}年${targetMonth}月暂无记账数据。\n\n开始记录您的收支吧！养成记账习惯，让财务管理更轻松。`,
          stats: {
            year: targetYear,
            month: targetMonth,
            totalIncome: 0,
            totalExpense: 0,
            balance: 0,
            transactionCount: 0,
          },
        },
      });
    }

    // 调用 AI 生成总结
    const summary = await generateMonthlySummary(summaryData);

    return res.json({
      success: true,
      data: {
        summary,
        stats: {
          year: targetYear,
          month: targetMonth,
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
          transactionCount: transactionData.length,
          topCategories: categoryStats.sort((a, b) => b.amount - a.amount).slice(0, 3),
        },
      },
    });
  } catch (error: any) {
    console.error('[AI Controller] Monthly summary error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'AI_ERROR', message: error.message || 'AI 服务暂时不可用' },
    });
  }
};


// 智能记账 - 文字输入
export const smartBookingText = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    const userId = req.user?.userId;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: '请输入记账描述' },
      });
    }

    console.log(`[AI Controller] Smart booking text for user ${userId}: ${text.substring(0, 50)}...`);

    const result = await parseTextForBooking(text);

    // 尝试匹配分类 ID
    let categoryId: string | null = null;
    if (userId && result.categoryName) {
      const { data: categories } = await insforge.database
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .eq('type', result.type);

      const matchedCategory = (categories || []).find(
        (c: any) => c.name === result.categoryName || 
                    c.name.includes(result.categoryName) ||
                    result.categoryName.includes(c.name)
      );
      if (matchedCategory) {
        categoryId = matchedCategory.id;
      }
    }

    // 获取默认账户
    let accountId: string | null = null;
    if (userId) {
      const { data: accounts } = await insforge.database
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_default', true)
        .limit(1);

      if (accounts && accounts.length > 0) {
        accountId = accounts[0].id;
      } else {
        // 如果没有默认账户，取第一个账户
        const { data: allAccounts } = await insforge.database
          .from('accounts')
          .select('*')
          .eq('user_id', userId)
          .limit(1);
        if (allAccounts && allAccounts.length > 0) {
          accountId = allAccounts[0].id;
        }
      }
    }

    return res.json({
      success: true,
      data: {
        ...result,
        categoryId,
        accountId,
      },
    });
  } catch (error: any) {
    console.error('[AI Controller] Smart booking text error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'AI_ERROR', message: error.message || 'AI 服务暂时不可用' },
    });
  }
};

// 智能记账 - 图片识别
export const smartBookingImage = async (req: Request, res: Response) => {
  try {
    const { image } = req.body;
    const userId = req.user?.userId;

    if (!image || typeof image !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: '请上传图片' },
      });
    }

    console.log(`[AI Controller] Smart booking image for user ${userId}`);

    const result = await parseImageForBooking(image);

    // 尝试匹配分类 ID
    let categoryId: string | null = null;
    if (userId && result.categoryName) {
      const { data: categories } = await insforge.database
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .eq('type', result.type);

      const matchedCategory = (categories || []).find(
        (c: any) => c.name === result.categoryName || 
                    c.name.includes(result.categoryName) ||
                    result.categoryName.includes(c.name)
      );
      if (matchedCategory) {
        categoryId = matchedCategory.id;
      }
    }

    // 获取默认账户
    let accountId: string | null = null;
    if (userId) {
      const { data: accounts } = await insforge.database
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_default', true)
        .limit(1);

      if (accounts && accounts.length > 0) {
        accountId = accounts[0].id;
      } else {
        const { data: allAccounts } = await insforge.database
          .from('accounts')
          .select('*')
          .eq('user_id', userId)
          .limit(1);
        if (allAccounts && allAccounts.length > 0) {
          accountId = allAccounts[0].id;
        }
      }
    }

    return res.json({
      success: true,
      data: {
        ...result,
        categoryId,
        accountId,
      },
    });
  } catch (error: any) {
    console.error('[AI Controller] Smart booking image error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'AI_ERROR', message: error.message || 'AI 服务暂时不可用' },
    });
  }
};
