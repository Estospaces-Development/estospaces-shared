import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const [theme, setThemeState] = useState<Theme>(() => {
    // Load theme from localStorage or default to 'light'
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('estospaces-theme');
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  // Apply theme to DOM
  useEffect(() => {
    const root = document.documentElement;
    const isManagerRoute = location.pathname.startsWith('/manager');
    const activeTheme = isManagerRoute ? theme : 'light';

    // Save theme to localStorage (always save the user preference, even if not active)
    localStorage.setItem('estospaces-theme', theme);

    // Apply theme class to document root
    root.setAttribute('data-theme', activeTheme);

    // Apply theme-specific classes
    root.classList.remove('theme-light', 'theme-dark', 'dark');
    root.classList.add(`theme-${activeTheme}`);

    // Add dark class for Tailwind dark mode when theme is dark
    if (activeTheme === 'dark') {
      root.classList.add('dark');
    }

    // Also update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', activeTheme === 'dark' ? '#1f2937' : '#ffffff');
    }
  }, [theme, location.pathname]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

