import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'yoda-wallet-hidden-tokens';

export const useHiddenTokens = () => {
  const [hiddenTokens, setHiddenTokens] = useState<Set<string>>(new Set());

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHiddenTokens(new Set(JSON.parse(stored)));
      }
    } catch (e) {
      console.error('Failed to load hidden tokens:', e);
    }
  }, []);

  // Save to localStorage
  const saveToStorage = useCallback((tokens: Set<string>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...tokens]));
    } catch (e) {
      console.error('Failed to save hidden tokens:', e);
    }
  }, []);

  const hideToken = useCallback((address: string) => {
    setHiddenTokens(prev => {
      const next = new Set(prev);
      next.add(address);
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const unhideToken = useCallback((address: string) => {
    setHiddenTokens(prev => {
      const next = new Set(prev);
      next.delete(address);
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const toggleHidden = useCallback((address: string) => {
    if (hiddenTokens.has(address)) {
      unhideToken(address);
    } else {
      hideToken(address);
    }
  }, [hiddenTokens, hideToken, unhideToken]);

  const isHidden = useCallback((address: string) => {
    return hiddenTokens.has(address);
  }, [hiddenTokens]);

  return {
    hiddenTokens,
    hideToken,
    unhideToken,
    toggleHidden,
    isHidden,
    hiddenCount: hiddenTokens.size,
  };
};
