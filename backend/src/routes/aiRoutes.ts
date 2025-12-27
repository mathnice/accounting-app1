import { Router } from 'express';
import { parseSpeechText, recognizeImage, suggestCategories, chat, monthlySummary, smartBookingText, smartBookingImage } from '../controllers/aiController';
import { requireAuth } from '../middlewares/insforgeAuth';

const router = Router();

// All AI routes require authentication
router.use(requireAuth);

// POST /api/ai/speech - Parse speech text to transaction
router.post('/speech', parseSpeechText);

// POST /api/ai/image - Recognize image (object or receipt)
router.post('/image', recognizeImage);

// POST /api/ai/categories - Suggest categories based on description
router.post('/categories', suggestCategories);

// POST /api/ai/chat - AI 智能客服聊天
router.post('/chat', chat);

// GET /api/ai/summary - AI 记账月度总结
router.get('/summary', monthlySummary);

// POST /api/ai/smart-booking/text - 智能记账文字输入
router.post('/smart-booking/text', smartBookingText);

// POST /api/ai/smart-booking/image - 智能记账图片识别
router.post('/smart-booking/image', smartBookingImage);

export default router;
