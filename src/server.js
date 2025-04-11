import express from 'express';
import dotenv from 'dotenv';
import flashcardsRoutes from './routes/flashcards.js';
import quizRoutes from './routes/quiz.js';
import healthRoutes from './routes/health.js';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());

app.use(express.json());

app.use('/flashcards', flashcardsRoutes);
app.use('/quiz', quizRoutes);
app.use('/', healthRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
