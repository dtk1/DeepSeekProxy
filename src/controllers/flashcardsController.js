import DeepSeekClient from '../utils/deepSeekClient.js';

export const generateFlashcardsFromText = async (req, res) => {
  try {
    const { notes, numFlashcards } = req.body;
    if (!notes || typeof numFlashcards !== "number" || numFlashcards <= 0) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const prompt = `You are an AI assistant that extracts question-answer pairs from text.
The user will provide notes, and you must generate exactly ${numFlashcards} question-answer pairs.
Format:
Question 1: ...
Answer: ...
Question 2: ...
Answer: ...
Only return the list, no explanations.`;

    const content = await DeepSeekClient(prompt);

    const lines = content.split('\n').filter(line => line.trim() !== '');
    const flashcards = [];

    for (let i = 0; i < lines.length; i += 2) {
      const question = lines[i]?.replace(/^Question \d+:\s*/, '').trim();
      const answer = lines[i + 1]?.replace(/^Answer:\s*/, '').trim();
      if (question && answer) flashcards.push({ question, answer });
    }

    res.json({ success: true, flashcards });
  } catch (error) {
    console.error("❌ Flashcards error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const generateFlashcardsFromTopic = async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: "Topic is required" });

    const prompt = `You are an AI assistant that generates educational flashcards.
Provide exactly 5 question-answer pairs about the topic "${topic}".
Format:
Question 1: ...
Answer: ...
Question 2: ...
Answer: ...
Only return the list, no explanations.`;

    const content = await DeepSeekClient(prompt);

    const lines = content.split('\n').filter(line => line.trim() !== '');
    const flashcards = [];

    for (let i = 0; i < lines.length; i += 2) {
      const question = lines[i]?.replace(/^Question \d+:\s*/, '').trim();
      const answer = lines[i + 1]?.replace(/^Answer:\s*/, '').trim();
      if (question && answer) flashcards.push({ question, answer });
    }

    res.json({ success: true, flashcards });
  } catch (error) {
    console.error("❌ Topic Flashcards error:", error);
    res.status(500).json({ error: error.message });
  }
};
