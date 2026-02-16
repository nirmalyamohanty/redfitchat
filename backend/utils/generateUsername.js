const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const len = 6;

export function generateUsername() {
  let result = 'anon_';
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
