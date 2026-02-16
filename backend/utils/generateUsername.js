const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const len = 6;

export function generateUsername() {
  let result = 'anon_';
  // Add a small random timestamp component to ensure check-free uniqueness in most cases
  const timestamp = Date.now().toString(36).slice(-3);
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result + timestamp;
}
