import { filterText, hasProfanity } from './middleware/profanityFilter.js';

const testCases = [
    "Hello world",
    "नमस्ते", // Hindi
    "Hola mundo", // Spanish
    "你好", // Chinese
    "مرحبا", // Arabic
    "Привет", // Russian
    "fuck", // Profanity
    "shit" // Profanity
];

console.log("Testing Profanity Filter:");
testCases.forEach(text => {
    try {
        const cleaned = filterText(text);
        const isProfane = hasProfanity(text);
        console.log(`Original: "${text}" | Cleaned: "${cleaned}" | IsProfane: ${isProfane}`);
        if (cleaned === '' && text !== '') {
            console.error(`ERROR: "${text}" was completely wiped out!`);
        }
    } catch (e) {
        console.error(`CRASH on "${text}":`, e.message);
    }
});
