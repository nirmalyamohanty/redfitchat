import Filter from 'bad-words';

const filter = new Filter();

export function filterText(text) {
  if (!text || typeof text !== 'string') return text;
  try {
    return filter.clean(text);
  } catch (error) {
    // If filter crashes (e.g. on non-Latin characters), return original text
    return text;
  }
}

export function hasProfanity(text) {
  if (!text || typeof text !== 'string') return false;
  try {
    return filter.isProfane(text);
  } catch (error) {
    // If filter crashes, assume not profane (safe failover)
    return false;
  }
}
