import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors()); // Разрешаем запросы с фронтенда

// Прокси-запрос к DeepSeek API
app.post("/deepseek", async (req, res) => {
    try {
        const response = await fetch("https://api.deepseek.com/v1/completions", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify(req.body),
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Ошибка запроса к DeepSeek" });
    }
});

app.listen(3000, () => console.log("Сервер запущен на порту 3000"));
