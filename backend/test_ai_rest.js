import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;
console.log("Testing Key:", apiKey ? apiKey.substring(0, 10) + '...' : "MISSING");

async function testModel(modelName) {
    console.log(`\nTesting model: ${modelName}...`);
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
            {
                contents: [{
                    parts: [{ text: "Hello, are you working?" }]
                }]
            },
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log("SUCCESS!");
        console.log("Response:", response.data.candidates[0].content.parts[0].text);
        return true;
    } catch (error) {
        console.error("FAILED.");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error:", error.message);
        }
        return false;
    }
}

async function run() {
    // Try 2.5 Flash Lite (2026 model)
    let success = await testModel("gemini-2.5-flash-lite");
    if (!success) {
        // Try 3 Flash Preview
        await testModel("gemini-3-flash-preview");
    }
}

run();
