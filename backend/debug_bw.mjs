import * as BadWords from 'bad-words';
console.log('Namespace import:', BadWords);

import BadWordsDefault from 'bad-words';
console.log('Default import:', BadWordsDefault);

try {
    const { Filter } = await import('bad-words');
    console.log('Named import Filter:', Filter);
} catch (e) {
    console.log('Named import failed:', e.message);
}
