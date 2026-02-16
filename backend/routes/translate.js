import express from 'express';
import axios from 'axios';
import { protect } from '../middleware/auth.js';

const router = express.Router();
// Initialize Gemini API URL (same as AI chat)
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

router.post('/', protect, async (req, res) => {
  const { text, targetLang = 'en' } = req.body;
  if (!text) return res.status(400).json({ message: 'No text provided' });

  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.warn('No AI Key for translation, falling back to basic checks');
      return res.json({ translatedText: text }); // Passthrough if no key
    }

    // Call Gemini for Smart Translation
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `You are a professional translator. Translate the following text to "${targetLang}". 
            IMPORTANT:
            1. Detect the source language automatically.
            2. IF the text is "transliterated" (e.g. Hindi/Odia/Tamil written in English script), detect the underlying language, understand the meaning, and translate it to English.
            3. Example: "mu jauchi khaibi" (Odia) -> "I am going to eat".
            4. Output ONLY the translated text, no explanations.

            Text to Translate: "${text}"`
          }]
        }],
        generationConfig: {
          maxOutputTokens: 100,
        }
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    let translatedText = text;
    if (response.data.candidates && response.data.candidates[0].content) {
      translatedText = response.data.candidates[0].content.parts[0].text.trim();
    }

    res.json({ translatedText });

  } catch (err) {
    console.error('AI Translation error:', err.message);
    // Fallback: Return original text (better than crashing)
    res.json({ translatedText: text });
  }
});

export default router;
