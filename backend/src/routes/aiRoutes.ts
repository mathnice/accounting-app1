import { Router } from 'express';
import { parseSpeechText, recognizeImage, suggestCategories } from '../controllers/aiController';
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

export default router;
