import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ✅ Route for Flashcards
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
                        The user will provide notes, and you must generate exactly ${numFlashcards} question-answer pairs.
                        Format the response like:
                        Question 1: ...
                        Answer: ...
                        Question 2: ...
                        Answer: ...
                        Only return the list, no explanations.`
                    },
                    { role: "user", content: notes }
                ],
                temperature: 0.5
            }),
        });

        const text = await deepseekResponse.text();
        console.log("🔹 Raw DeepSeek API Response:", text);

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("❌ Failed to parse JSON from DeepSeek:", e);
            return res.status(500).json({ error: "DeepSeek API returned invalid JSON" });
        }

        if (!data.choices || !data.choices[0]?.message?.content) {
            throw new Error("Invalid response from DeepSeek API");
        }

        const content = data.choices[0].message.content;
        const lines = content.split('\n').filter(line => line.trim() !== '');
        const flashcards = [];

        for (let i = 0; i < lines.length; i += 2) {
            const questionLine = lines[i];
            const answerLine = lines[i + 1];

            const question = questionLine.replace(/^Question \d+:\s*/, '').trim();
            const answer = answerLine.replace(/^Answer:\s*/, '').trim();

            if (question && answer) {
                flashcards.push({ question, answer });
            }
        }

        res.json({ success: true, flashcards });

    } catch (error) {
        console.error("❌ Server error:", error);
        res.status(500).json({ error: `Server error: ${error.message}` });
    }
});

// ✅ Route for Generating Quiz Questions
app.post("/generate-quiz", async (req, res) => {
    try {
        const { notes, numQuestions } = req.body;

        if (!notes || typeof numQuestions !== "number" || numQuestions <= 0) {
            return res.status(400).json({ error: "Invalid input" });
        }

        console.log("🔹 Sending request to DeepSeek API for quiz...");

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
                        The user will provide educational notes, and you must generate exactly ${numQuestions} question-answer pairs.
                        Format the response like:
                        Question 1: ...
                        Answer: ...
                        Question 2: ...
                        Answer: ...
                        Only return the list, no explanations.`
                    },
                    { role: "user", content: notes }
                ],
                temperature: 0.5
            }),
        });

        const text = await deepseekResponse.text();
        console.log("🔹 Raw DeepSeek API Response:", text);

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("❌ Failed to parse JSON from DeepSeek:", e);
            return res.status(500).json({ error: "DeepSeek API returned invalid JSON" });
        }

        if (!data.choices || !data.choices[0]?.message?.content) {
            throw new Error("Invalid response from DeepSeek API");
        }

        const content = data.choices[0].message.content;
        const lines = content.split('\n').filter(line => line.trim() !== '');
        const questions = [];

        for (let i = 0; i < lines.length; i += 2) {
            const questionLine = lines[i];
            const answerLine = lines[i + 1];

            const question = questionLine.replace(/^Question \d+:\s*/, '').trim();
            const answer = answerLine.replace(/^Answer:\s*/, '').trim();

            if (question && answer) {
                questions.push({ question, answer });
            }
        }

        res.json({ success: true, questions });

    } catch (error) {
        console.error("❌ Server error:", error);
        res.status(500).json({ error: `Server error: ${error.message}` });
    }
});

app.listen(3000, () => console.log("✅ Server is running on port 3000"));
