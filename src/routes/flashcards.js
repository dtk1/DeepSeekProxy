import express from 'express';
import {
  generateFlashcardsFromText,
  generateFlashcardsFromTopic,
  generateFlashcardsFromUrl
} from '../controllers/flashcardsController.js';

const router = express.Router();

router.post('/generate-from-text', generateFlashcardsFromText);
router.post('/generate-from-topic', generateFlashcardsFromTopic);
router.post('/generate-from-url', generateFlashcardsFromUrl); // ✅ новый роут

export default router;
