import express from 'express';
import axios from 'axios';
import { protect } from '../middleware/auth.js';
import { authLimit } from '../middleware/rateLimit.js';

const router = express.Router();

const chatHistory = new Map();

// FALLBACK RESPONSES (used if API fails)
const FALLBACK_RESPONSES = [
    "That's a great point! Tell me more.",
    "I'm currently in demo mode, but I think that's fascinating!",
    "As RedFit AI, I'd say: keep pushing your limits!",
    "Interesting! How does that make you feel?",
    "I'm listening. Go on.",
    "That's cool! I'm here to chat.",
    "For the purpose of this demo: Yes, absolutely!",
    "I am verifying this information. Please wait (just kidding, I'm in demo mode!)."
];

import Message from '../models/Message.js';

router.post('/chat', protect, authLimit, async (req, res) => {
    try {
        const { message, reset } = req.body;
        const userId = req.user._id.toString();

        // Use Gemini Key (Free Tier)
        const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

        // --- FETCH USER STATS ---
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Count messages sent BY others (received by user)
        // GLOBAL CHAT: messages in 'global' where sender != user
        const globalReceived = await Message.countDocuments({
            chatType: 'global',
            senderId: { $ne: req.user._id },
            createdAt: { $gte: today }
        });

        // PERSONAL CHAT: messages in personal chats where sender != user (and user is participant - implied by logic but simplified here)
        // For accurate personal count, we'd need to check chat participation, but for now, counting where sender != user in 'personal' type is a good approximation if we assume user is involved. 
        // Better: Find all chats where user is participant, then count messages in those.
        // Simplified for speed/robustness: Count all personal messages where sender != user. (This assumes user only sees their own chats anyway)
        // Actually, let's just use global for "community vibe" and total received for "personal".

        // Let's refine: Count messages where (chatType='personal' AND senderId != user) OR (chatType='global' AND senderId != user)
        const totalReceivedToday = await Message.countDocuments({
            senderId: { $ne: req.user._id },
            createdAt: { $gte: today }
        });

        const contextPrompt = `
System Context:
- Current Date: ${new Date().toLocaleDateString()}
- User: ${req.user.username} (ID: ${userId})
- Messages Received Today: ${totalReceivedToday} (Global + Personal)
- Note: If the user asks about message stats, use this data. If they ask about other personal data (like email), you still don't have access to that.
`;

        let history = chatHistory.get(userId) || [];
        if (reset) history = [];

        // Inject context into the latest user message or as a system prompt
        // For Gemini REST, we just append it to the last user message for context
        const fullMessage = `${contextPrompt}\n\nUser Message: ${message}`;

        history.push({ role: "user", parts: [{ text: fullMessage }] });

        let text = "";

        if (!apiKey) {
            console.log("No API Key found, using fallback.");
            text = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
        } else {
            try {
                // Try Gemini REST API (No library needed)
                const response = await axios.post(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
                    {
                        contents: history,
                        generationConfig: {
                            maxOutputTokens: 150,
                        }
                    },
                    { headers: { 'Content-Type': 'application/json' } }
                );

                if (response.data.candidates && response.data.candidates[0].content) {
                    text = response.data.candidates[0].content.parts[0].text;
                } else {
                    throw new Error("Invalid Gemini response structure");
                }

            } catch (apiError) {
                console.error("API Failed (Switching to Fallback):", apiError.message);
                // IF API FAILS, USE FALLBACK
                text = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
                text += " (Demo Mode)";
            }
        }

        history.push({ role: "model", parts: [{ text: text }] });
        // Keep history manageable
        if (history.length > 20) history = [history[0], ...history.slice(-10)];
        chatHistory.set(userId, history);

        res.json({ text });

    } catch (error) {
        console.error('Critical AI Error:', error);
        // Ultimate fallback
        res.json({ text: "System Online. (Demo Response)" });
    }
});

export default router;
