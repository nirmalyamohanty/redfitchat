import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

console.log('Checking Environment Variables...');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'MISSING');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'MISSING');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set' : 'MISSING');
