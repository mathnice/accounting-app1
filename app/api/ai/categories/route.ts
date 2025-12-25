import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/lib/ai/AIServiceFactory';

/**
 * POST /api/ai/categories
 * Suggest categories based on description
 * API KEY is securely stored in server environment variables
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description } = body;

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: '请提供有效的描述' } },
        { status: 400 }
      );
    }

    const aiService = getAIService();
    const suggestions = await aiService.suggestCategories(description);

    return NextResponse.json({
      success: true,
      data: { suggestions },
    });
  } catch (error) {
    console.error('[API] Error in /api/ai/categories:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误，请稍后重试' } },
      { status: 500 }
    );
  }
}
