import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;
console.log("Listing models with Key:", apiKey ? apiKey.substring(0, 10) + '...' : "MISSING");

async function listModels() {
    try {
        const response = await axios.get(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );
        console.log("SUCCESS! Available Models:");
        response.data.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods})`));
    } catch (error) {
        console.error("FAILED to list models.");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error:", error.message);
        }
    }
}

listModels();
