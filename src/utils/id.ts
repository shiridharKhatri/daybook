/**
 * Pure JavaScript RFC4122 v4 UUID generator.
 * Does not depend on globalThis.crypto, ensuring 100% compatibility with Hermes,
 * Expo Go, and React Native New Architecture without polyfill errors.
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

