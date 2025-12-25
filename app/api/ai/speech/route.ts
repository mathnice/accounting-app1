import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/lib/ai/AIServiceFactory';

/**
 * POST /api/ai/speech
 * Parse speech text to transaction
 * API KEY is securely stored in server environment variables
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: '请提供有效的文本内容' } },
        { status: 400 }
      );
    }

    const aiService = getAIService();
    const result = await aiService.parseTransactionText(text);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[API] Error in /api/ai/speech:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误，请稍后重试' } },
      { status: 500 }
    );
  }
}
