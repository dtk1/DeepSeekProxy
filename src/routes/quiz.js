import express from 'express';
import { generateQuiz, generateQuizFromTopic } from '../controllers/quizController.js';

const router = express.Router();

router.post('/generate', generateQuiz);
router.post('/generate-from-topic', generateQuizFromTopic); // ✅ новый маршрут

export default router;
