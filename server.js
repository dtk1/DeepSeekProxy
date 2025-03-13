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
