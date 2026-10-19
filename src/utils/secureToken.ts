/**
 * Auth Utilities - Secure Token
 *
 * Cryptographically secure token generation utilities
 */

/**
 * Generate a cryptographically secure random token.
 *
 * Requires the Web Crypto API (`crypto.getRandomValues`), available in
 * all modern browsers, Node.js >= 19 (and >= 15 via `globalThis.crypto`),
 * and React Native with a crypto polyfill. Throws instead of silently
 * degrading to an insecure PRNG — predictable tokens are worse than
 * a loud failure.
 *
 * @param length - Token length in bytes (default: 32)
 * @returns Hex-encoded random token
 * @throws Error when no CSPRNG is available in the runtime
 */
export function generateResetToken(length: number = 32): string {
  if (typeof crypto === 'undefined' || typeof crypto.getRandomValues !== 'function') {
    throw new Error(
      'generateResetToken: no cryptographic random source available in this runtime ' +
        '(requires crypto.getRandomValues — Web Crypto, Node >= 19, or a polyfill)',
    );
  }

  const byteLength = Math.max(1, Math.floor(length));
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);

  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
