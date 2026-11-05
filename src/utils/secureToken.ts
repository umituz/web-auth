
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
