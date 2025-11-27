// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

// If you were on Node <18, you'd need: const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Basic health check
app.get("/", (req, res) => {
  res.send("Google AI backend is running ✅");
});

app.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    console.log("Received /chat request with message:", message);

    if (!message) {
      return res.status(400).json({ error: "Missing 'message' in body" });
    }

    if (!GOOGLE_API_KEY) {
      console.error("GOOGLE_API_KEY is NOT set!");
      return res
        .status(500)
        .json({ error: "Server misconfigured: no API key" });
    } else {
      console.log(
        "Using GOOGLE_API_KEY starting with:",
        GOOGLE_API_KEY.slice(0, 8)
      );
    }

    // Build a simple conversation history for Gemini
    const contents = [
      ...history.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      })),
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    const GEMINI_MODEL = "gemini-2.5-flash"; // current recommended flash model

    const url = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent`;

    console.log(
    "Calling Gemini endpoint:",
    url
    );

    const response = await fetch(url, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GOOGLE_API_KEY, // pass key in header
    },
    body: JSON.stringify({ contents }),
    });


    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google AI error:", errorText);
      return res
        .status(500)
        .json({ error: "Google AI API error", details: errorText });
    }

    const data = await response.json();
    console.log(
      "Gemini raw response:",
      JSON.stringify(data).slice(0, 300) + "..."
    );

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I couldn't generate a response.";

    return res.json({ reply });
  } catch (err) {
    console.error("Server error:", err);
    return res
      .status(500)
      .json({ error: "Server error", details: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
