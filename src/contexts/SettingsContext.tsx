import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type FiatCurrency = 'USD' | 'GBP' | 'CAD' | 'EUR' | 'AUD';

interface CurrencyInfo {
  code: FiatCurrency;
  symbol: string;
  name: string;
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

interface SettingsState {
  fiatCurrency: FiatCurrency;
  soundEnabled: boolean;
}

interface SettingsContextType extends SettingsState {
  setFiatCurrency: (currency: FiatCurrency) => void;
  setSoundEnabled: (enabled: boolean) => void;
  getCurrencyInfo: () => CurrencyInfo;
  formatFiat: (amount: number) => string;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

const SETTINGS_KEY = 'keeta_app_settings';

const defaultSettings: SettingsState = {
  fiatCurrency: 'USD',
  soundEnabled: true,
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsed });
      } catch {
        setSettings(defaultSettings);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
  }, [settings, isLoaded]);

  const setFiatCurrency = (currency: FiatCurrency) => {
    setSettings(prev => ({ ...prev, fiatCurrency: currency }));
  };

  const setSoundEnabled = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, soundEnabled: enabled }));
  };

  const getCurrencyInfo = () => {
    return SUPPORTED_CURRENCIES.find(c => c.code === settings.fiatCurrency) || SUPPORTED_CURRENCIES[0];
  };

  const formatFiat = (amount: number) => {
    const info = getCurrencyInfo();
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: info.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        setFiatCurrency,
        setSoundEnabled,
        getCurrencyInfo,
        formatFiat,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
