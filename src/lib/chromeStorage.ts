// Chrome Extension Storage Helper
// Wraps chrome.storage.local with Promise-based API and proper typing

// Type-safe wrapper for chrome.storage.local
export async function getFromStorage<T = any>(keys: string | string[]): Promise<T> {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
    console.warn('[ChromeStorage] Chrome storage not available');
    return {} as T;
  }
  
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result) => {
      resolve(result as T);
    });
  });
}

export async function setInStorage(items: Record<string, any>): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
    console.warn('[ChromeStorage] Chrome storage not available');
    return;
  }
  
  return new Promise((resolve) => {
    chrome.storage.local.set(items, () => {
      resolve();
    });
  });
}

export async function removeFromStorage(keys: string | string[]): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
    console.warn('[ChromeStorage] Chrome storage not available');
    return;
  }
  
  return new Promise((resolve) => {
    chrome.storage.local.remove(keys, () => {
      resolve();
    });
  });
}

export async function clearStorage(): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
    console.warn('[ChromeStorage] Chrome storage not available');
    return;
  }
  
  return new Promise((resolve) => {
    chrome.storage.local.clear(() => {
      resolve();
    });
  });
}

export function isChromeExtension(): boolean {
  return typeof chrome !== 'undefined' && !!chrome.storage && !!chrome.storage.local;
}
