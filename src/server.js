import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'

import flashcardsRoutes from './routes/flashcards.js'
import quizRoutes from './routes/quiz.js'
import healthRoutes from './routes/health.js'

// ✅ Новые роуты:
import tasksRoutes from './routes/tasks.js'
import pomodoroRoutes from './routes/pomodoro.js'

// ✅ Middleware для JWT аутентификации
import authenticate from './middleware/authenticate.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// ✅ Если роуты требуют авторизацию — ставим middleware
app.use(authenticate)

// 📦 Твои роуты
app.use('/flashcards', flashcardsRoutes)
app.use('/quiz', quizRoutes)
app.use('/tasks', tasksRoutes) // ✅
app.use('/pomodoro-sessions', pomodoroRoutes) // ✅
app.use('/', healthRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
