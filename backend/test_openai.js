import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const key = process.env.OPENAI_API_KEY;
console.log('Testing OpenAI Key:', key ? key.substring(0, 5) + '...' : 'MISSING');

async function test() {
    if (!key) return console.error('No KEY found');
    try {
        const openai = new OpenAI({ apiKey: key });
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "Test" }],
            model: "gpt-3.5-turbo",
        });
        console.log('Success with OpenAI:', completion.choices[0].message.content);
    } catch (e) {
        console.error('Failed with OpenAI:', e.message);
    }
}

test();
