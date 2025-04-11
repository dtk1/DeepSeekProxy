import DeepSeekClient from "../utils/deepSeekClient.js";
import * as cheerio from "cheerio";
// ✅ Генерация квиза из текста
export const generateQuiz = async (req, res) => {
  try {
    const { notes, numQuestions, quizType } = req.body;
    if (!notes || typeof numQuestions !== "number" || numQuestions <= 0) {
      return res.status(400).json({ error: "Invalid input" });
    }

    let prompt = `You are an AI assistant that creates quiz questions from educational text.
The user will provide notes, and you must generate exactly ${numQuestions} questions.`;

    if (quizType === "multiple-choice") {
      prompt += `
Each question should have 4 options with only one correct answer.
Format the response as JSON array:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "The correct option text"
  }
]
Only return valid JSON, no explanations.`;
    } else if (quizType === "true-false") {
      prompt += `
Each question should be a true/false statement.
Format the response as JSON array:
[
  {
    "question": "Statement that is true or false",
    "answer": "True" or "False"
  }
]
Only return valid JSON, no explanations.`;
    } else {
      prompt += `
Format the response as JSON array:
[
  {
    "question": "Question text here?",
    "answer": "The answer text"
  }
]
Only return valid JSON, no explanations.`;
    }

    const content = await DeepSeekClient(prompt);

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array found in response");

    const questions = JSON.parse(jsonMatch[0]);
    res.json({ success: true, questions });
  } catch (error) {
    console.error("❌ Quiz generation error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Генерация квиза по теме
export const generateQuizFromTopic = async (req, res) => {
  try {
    const { topic, numQuestions, quizType } = req.body;
    if (!topic || typeof numQuestions !== "number" || numQuestions <= 0) {
      return res.status(400).json({ error: "Invalid input" });
    }

    let prompt = `You are an AI assistant that creates quiz questions on the topic "${topic}".
Generate exactly ${numQuestions} questions.`;

    if (quizType === "multiple-choice") {
      prompt += `
Each question should have 4 options with only one correct answer.
Format the response as JSON array:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "The correct option text"
  }
]
Only return valid JSON, no explanations.`;
    } else if (quizType === "true-false") {
      prompt += `
Each question should be a true/false statement.
Format the response as JSON array:
[
  {
    "question": "Statement that is true or false",
    "answer": "True" or "False"
  }
]
Only return valid JSON, no explanations.`;
    } else {
      prompt += `
Format the response as JSON array:
[
  {
    "question": "Question text here?",
    "answer": "The answer text"
  }
]
Only return valid JSON, no explanations.`;
    }

    const content = await DeepSeekClient(prompt);

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array found in response");

    const questions = JSON.parse(jsonMatch[0]);
    res.json({ success: true, questions });
  } catch (error) {
    console.error("❌ Quiz generation from topic error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const generateQuizFromUrl = async (req, res) => {
  try {
    const { url, numQuestions, quizType } = req.body;
    if (!url || typeof numQuestions !== "number" || numQuestions <= 0) {
      return res.status(400).json({ error: "Invalid input" });
    }

    // 🧩 Step 1: Fetch the page
    const response = await fetch(url);
    const html = await response.text();

    // 🧩 Step 2: Extract text content from HTML
    const $ = cheerio.load(html);
    const text = $('body').text();
    const cleanedText = text.replace(/\s+/g, ' ').trim();

    if (!cleanedText) {
      return res.status(400).json({ error: "Unable to extract text from URL" });
    }

    // 🧩 Step 3: Generate quiz based on the extracted text
    let prompt = `You are an AI assistant that creates quiz questions from educational text.
The following is extracted from a webpage:
"${cleanedText}"
Generate exactly ${numQuestions} questions.`;

    if (quizType === "multiple-choice") {
      prompt += `
Each question should have 4 options with only one correct answer.
Format the response as JSON array:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "The correct option text"
  }
]
Only return valid JSON, no explanations.`;
    } else if (quizType === "true-false") {
      prompt += `
Each question should be a true/false statement.
Format the response as JSON array:
[
  {
    "question": "Statement that is true or false",
    "answer": "True" or "False"
  }
]
Only return valid JSON, no explanations.`;
    } else {
      prompt += `
Format the response as JSON array:
[
  {
    "question": "Question text here?",
    "answer": "The answer text"
  }
]
Only return valid JSON, no explanations.`;
    }

    const content = await DeepSeekClient(prompt);

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array found in response");

    const questions = JSON.parse(jsonMatch[0]);
    res.json({ success: true, questions });
  } catch (error) {
    console.error("❌ Quiz generation from URL error:", error);
    res.status(500).json({ error: error.message });
  }
};