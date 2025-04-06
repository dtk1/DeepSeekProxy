import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const app = express();
const corsOptions = {
    origin: ['http://localhost:3000'], // Добавь сюда и прод домен, если нужно
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  
  // Применяем ко всем маршрутам
  app.use(cors(corsOptions));
  
  // Обрабатываем preflight запросы OPTIONS
  app.options('*', cors(corsOptions));
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

            if (!questionLine || !answerLine) continue;

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
        const { notes, numQuestions, quizType } = req.body;

        if (!notes || typeof numQuestions !== "number" || numQuestions <= 0) {
            return res.status(400).json({ error: "Invalid input" });
        }

        console.log("🔹 Sending request to DeepSeek API for quiz...");

        let systemPrompt = `You are an AI assistant that creates quiz questions from educational text.
                        The user will provide notes, and you must generate exactly ${numQuestions} questions.`;
        
        if (quizType === "multiple-choice") {
            systemPrompt += `
            Each question should have 4 options with only one correct answer.
            Format the response as JSON array like:
            [
              {
                "question": "Question text here?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "answer": "The correct option text"
              }
            ]
            Only return valid JSON, no explanations.`;
        } else if (quizType === "true-false") {
            systemPrompt += `
            Each question should be a true/false statement.
            Format the response as JSON array like:
            [
              {
                "question": "Statement that is true or false",
                "answer": "True" or "False"
              }
            ]
            Only return valid JSON, no explanations.`;
        } else {
            // Default to open-ended questions
            systemPrompt += `
            Format the response as JSON array like:
            [
              {
                "question": "Question text here?",
                "answer": "The answer text"
              }
            ]
            Only return valid JSON, no explanations.`;
        }

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
                        content: systemPrompt
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
        
        // Try to parse the JSON response from the AI
        let questions;
        try {
            // Find JSON in the response (in case there's text before or after)
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                questions = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("No JSON array found in response");
            }
        } catch (e) {
            console.error("❌ Failed to parse questions JSON:", e);
            
            // Fallback to the old parsing method if JSON parsing fails
            const lines = content.split('\n').filter(line => line.trim() !== '');
            questions = [];

            for (let i = 0; i < lines.length; i += 2) {
                const questionLine = lines[i];
                const answerLine = lines[i + 1];

                if (!questionLine || !answerLine) continue;

                const question = questionLine.replace(/^Question \d+:\s*/, '').trim();
                const answer = answerLine.replace(/^Answer:\s*/, '').trim();

                if (question && answer) {
                    questions.push({ question, answer });
                }
            }
        }

        res.json({ success: true, questions });

    } catch (error) {
        console.error("❌ Server error:", error);
        res.status(500).json({ error: `Server error: ${error.message}` });
    }
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/delete-collection", async (req, res) => {
    try {
        const collectionId = req.query.id;

        if (!collectionId) {
            return res.status(400).json({ error: "Collection ID is required" });
        }

        console.log(`🗑️ Deleting collection with ID: ${collectionId}`);

        // TODO: Здесь ты добавишь удаление из базы данных
        // Например: await CollectionModel.deleteOne({ _id: collectionId });

        res.json({ success: true, message: `Collection ${collectionId} deleted` });
    } catch (error) {
        console.error("❌ Error deleting collection:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server is running on port ${PORT}`);
  });
  