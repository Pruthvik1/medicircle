import { Platform } from 'react-native';

// Session storage for supabase-js. Uses the keychain/keystore (expo-secure-store)
// on device. SecureStore caps values at ~2KB and a session is larger, so values
// are split into chunks. If the native module is unavailable (some Expo Go
// builds) it falls back to memory so the app still opens — the session just
// won't survive a restart.

const CHUNK_SIZE = 1800;

type SecureStoreModule = typeof import('expo-secure-store');

let secureStore: SecureStoreModule | null = null;
if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy so a missing native module can't crash startup
    secureStore = require('expo-secure-store') as SecureStoreModule;
  } catch {
    secureStore = null;
  }
}

const memory = new Map<string, string>();

async function secureGet(key: string): Promise<string | null> {
  if (!secureStore) return memory.get(key) ?? null;
  try {
    const count = await secureStore.getItemAsync(`${key}.count`);
    if (!count) return null;
    const parts: string[] = [];
    for (let i = 0; i < Number(count); i++) {
      const part = await secureStore.getItemAsync(`${key}.${i}`);
      if (part === null) return null;
      parts.push(part);
    }
    return parts.join('');
  } catch {
    return memory.get(key) ?? null;
  }
}

async function secureRemove(key: string) {
  memory.delete(key);
  if (!secureStore) return;
  try {
    const count = Number((await secureStore.getItemAsync(`${key}.count`)) ?? 0);
    for (let i = 0; i < count; i++) await secureStore.deleteItemAsync(`${key}.${i}`);
    await secureStore.deleteItemAsync(`${key}.count`);
  } catch {
    // nothing stored, or store unavailable
  }
}

async function secureSet(key: string, value: string) {
  memory.set(key, value);
  if (!secureStore) return;
  try {
    await secureRemove(key);
    memory.set(key, value);
    const chunks = value.match(new RegExp(`.{1,${CHUNK_SIZE}}`, 'gs')) ?? [];
    for (let i = 0; i < chunks.length; i++)
      await secureStore.setItemAsync(`${key}.${i}`, chunks[i]);
    await secureStore.setItemAsync(`${key}.count`, String(chunks.length));
  } catch {
    // keep the in-memory copy
  }
}

export const authStorage = {
  getItem: secureGet,
  setItem: secureSet,
  removeItem: secureRemove,
};
