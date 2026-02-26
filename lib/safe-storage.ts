/**
 * Safe localStorage wrapper that falls back to in-memory storage
 * when localStorage is unavailable (e.g. private/incognito mode in some browsers).
 */

const memoryStore = new Map<string, string>();

function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const useLocalStorage = typeof window !== "undefined" && isLocalStorageAvailable();

export const safeStorage: Storage = {
  get length() {
    if (useLocalStorage) return window.localStorage.length;
    return memoryStore.size;
  },
  key(index: number) {
    if (useLocalStorage) return window.localStorage.key(index);
    return Array.from(memoryStore.keys())[index] ?? null;
  },
  getItem(key: string): string | null {
    if (useLocalStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return memoryStore.get(key) ?? null;
      }
    }
    return memoryStore.get(key) ?? null;
  },
  setItem(key: string, value: string): void {
    if (useLocalStorage) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {
        // Fall through to memory store
      }
    }
    memoryStore.set(key, value);
  },
  removeItem(key: string): void {
    if (useLocalStorage) {
      try {
        window.localStorage.removeItem(key);
        return;
      } catch {
        // Fall through to memory store
      }
    }
    memoryStore.delete(key);
  },
  clear(): void {
    if (useLocalStorage) {
      try {
        window.localStorage.clear();
        return;
      } catch {
        // Fall through to memory store
      }
    }
    memoryStore.clear();
  },
};
