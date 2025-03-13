import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// 🔥 Разрешаем CORS для всех доменов
app.use(cors());

// Разрешаем обработку JSON-запросов
app.use(express.json());

app.post("/deepseek", async (req, res) => {
    try {
        const { notes, numFlashcards } = req.body;

        if (!notes || typeof numFlashcards !== "number" || numFlashcards <= 0) {
            return res.status(400).json({ error: "Invalid input" });
        }

        const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({ notes, numFlashcards }),
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to connect to DeepSeek API" });
    }
});

// Запускаем сервер
app.listen(3000, () => console.log("✅ Server is running on port 3000"));
