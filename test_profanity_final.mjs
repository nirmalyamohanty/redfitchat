import { filterText, hasProfanity } from './backend/middleware/profanityFilter.js';

console.log('Testing Profanity Filter...');

try {
    const clean = filterText('This is a hell of a test');
    console.log('Cleaned:', clean);

    const isProfane = hasProfanity('hell');
    console.log('Is Profane:', isProfane);

    console.log('SUCCESS: Profanity filter works.');
} catch (error) {
    console.error('FAILURE:', error);
}
