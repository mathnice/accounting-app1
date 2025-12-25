import { Request, Response } from 'express';
import { getAIService, isAIServiceConfigured } from '../services/ai';
import { getCategoriesByUser } from '../models/Category';

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
