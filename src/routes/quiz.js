import express from 'express';
import { generateQuiz, generateQuizFromTopic, generateQuizFromUrl } from '../controllers/quizController.js';

const router = express.Router();

router.post('/generate', generateQuiz);
router.post('/generate-from-topic', generateQuizFromTopic);
router.post('/generate-from-url', generateQuizFromUrl); // ✅ добавили

export default router;
