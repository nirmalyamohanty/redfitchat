import * as BadWords from 'bad-words';
console.log('BadWords exports keys:', Object.keys(BadWords));
console.log('BadWords default:', BadWords.default);
try {
    const filter = new BadWords.default();
    console.log('Filter created successfully');
} catch (e) {
    console.log('Failed to create filter from default:', e.message);
}
