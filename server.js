import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.post("/deepseek", async (req, res) => {
    try {
        const { notes, numFlashcards } = req.body;

        if (!notes || typeof numFlashcards !== "number" || numFlashcards <= 0) {
            return res.status(400).json({ error: "Invalid input" });
        }

        console.log("🔹 Sending request to DeepSeek API...");

        const deepseekResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: `You are an AI assistant that extracts question-answer pairs from text.
                                  The user will provide notes, and you must generate exactly ${numFlashcards} question-answer pairs in JSON format.`
                    },
                    { role: "user", content: notes }
                ],
                response_format: { type: "json_object" },
                temperature: 0.5
            }),
        });

        const data = await deepseekResponse.json();
        console.log("🔹 DeepSeek API Response:", JSON.stringify(data, null, 2));

        if (!data.choices || !data.choices[0]?.message?.content) {
            throw new Error("Invalid response from DeepSeek API");
        }

        let parsedResponse;
        try {
            parsedResponse = JSON.parse(data.choices[0].message.content || "{}");
        } catch (parseError) {
            console.error("❌ JSON Parsing Error:", parseError);
            return res.status(500).json({ error: "Invalid JSON from DeepSeek API" });
        }

        // ✅ Исправлено: Теперь ожидаем `questions`, а не `flashcards`
        if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
            console.error("❌ DeepSeek API response does not contain a valid questions array:", parsedResponse);
            return res.status(500).json({ error: "DeepSeek API did not return a valid questions array" });
        }

        // ✅ Преобразуем `questions` в `flashcards`
        const flashcards = parsedResponse.questions.map(q => ({
            question: q.question,
            answer: q.answer
        }));

        res.json({ success: true, flashcards });

    } catch (error) {
        console.error("❌ Server error:", error);
        res.status(500).json({ error: `Server error: ${error.message}` });
    }
});

app.listen(3000, () => console.log("✅ Server is running on port 3000"));
