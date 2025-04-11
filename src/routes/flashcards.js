import express from 'express';
import { generateFlashcardsFromText, generateFlashcardsFromTopic } from '../controllers/flashcardsController.js';

const router = express.Router();

router.post('/generate-from-text', generateFlashcardsFromText);
router.post('/generate-from-topic', generateFlashcardsFromTopic);

export default router;
