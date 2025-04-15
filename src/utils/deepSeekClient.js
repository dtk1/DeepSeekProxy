const DeepSeekClient = async (prompt) => {
  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: "You are an AI assistant that generates quiz questions based on user-provided content. Return only valid JSON without explanations.",
        },
        {
          role: "user",
          content: prompt, // теперь тут только notes + инструкции по типу квиза
        },
      ],
    }),
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    console.error("❌ DeepSeek invalid JSON:", e);
    throw new Error("DeepSeek API returned invalid JSON");
  }

  if (!data.choices || !data.choices[0]?.message?.content) {
    throw new Error("Invalid response from DeepSeek API");
  }

  return data.choices[0].message.content;
};
