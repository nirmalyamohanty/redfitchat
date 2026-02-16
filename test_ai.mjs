import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env
dotenv.config({ path: join(__dirname, 'backend', '.env') });

const API_KEY = process.env.GEMINI_API_KEY;
console.log('API Key present:', !!API_KEY);

if (!API_KEY) {
    console.error('ERROR: GEMINI_API_KEY is missing in backend/.env');
    process.exit(1);
}

async function testGemini() {
    console.log('Testing Gemini API...');
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const result = await model.generateContent("Say 'Hello from RedFit AI!' if you can hear me.");
        const response = await result.response;
        const text = response.text();
        console.log('SUCCESS: Gemini Response:', text);
    } catch (error) {
        console.error('FAILURE: Gemini API Error:', error.message);
    }
}

testGemini();
