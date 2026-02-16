import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const key = process.env.GEMINI_API_KEY;
console.log('Testing Key:', key ? key.substring(0, 10) + '...' : 'MISSING');

async function test() {
    try {
        const genAI = new GoogleGenerativeAI(key);
        // Try gemini-pro first as it's the default
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Test");
        console.log('Success with gemini-pro:', result.response.text());
    } catch (e) {
        console.error('Failed with gemini-pro:', e.message);
        try {
            // Try flash
            const genAI = new GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent("Test");
            console.log('Success with gemini-1.5-flash:', result.response.text());
        } catch (e2) {
            console.error('Failed with gemini-1.5-flash:', e2.message);
        }
    }
}

test();
