import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/lib/ai/AIServiceFactory';

/**
 * POST /api/ai/image
 * Recognize image (object or receipt)
 * API KEY is securely stored in server environment variables
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, mode = 'object' } = body;

    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: '请提供有效的图片数据' } },
        { status: 400 }
      );
    }

    if (mode !== 'object' && mode !== 'receipt') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_MODE', message: '模式必须是 object 或 receipt' } },
        { status: 400 }
      );
    }

    const aiService = getAIService();
    const result = await aiService.recognizeImage(image, mode);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[API] Error in /api/ai/image:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误，请稍后重试' } },
      { status: 500 }
    );
  }
}
