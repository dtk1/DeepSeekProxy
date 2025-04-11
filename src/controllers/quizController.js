import DeepSeekClient from '../utils/deepSeekClient.js';

export const generateQuizFromTopic = async (req, res) => {
  try {
    const { topic, numQuestions = 5, quizType = "multiple-choice" } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
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
