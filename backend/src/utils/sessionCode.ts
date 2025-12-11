/**
 * Session Code Generation Utilities
 * Generates unique session codes in format: ABCD-1234
 */

/**
 * Generate a random session code
 * Format: XXXX-1234 (4 uppercase letters + 4 digits)
 */
export function generateSessionCode(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';

  // Generate 4 random uppercase letters
  let letterPart = '';
  for (let i = 0; i < 4; i++) {
    letterPart += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  // Generate 4 random digits
  let digitPart = '';
  for (let i = 0; i < 4; i++) {
    digitPart += digits.charAt(Math.floor(Math.random() * digits.length));
  }

  return `${letterPart}-${digitPart}`;
}

/**
 * Validate session code format
 */
export function validateSessionCode(code: string): boolean {
  const pattern = /^[A-Z]{4}-\d{4}$/;
  return pattern.test(code);
}

/**
 * Normalize session code (uppercase and trim)
 */
export function normalizeSessionCode(code: string): string {
  return code.toUpperCase().trim();
}
