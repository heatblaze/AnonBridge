import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  currentTheme: string;
  setCurrentTheme: (theme: string) => void;
  themes: ThemeOption[];
  currentBackground: string;
  setCurrentBackground: (background: string) => void;
}

interface ThemeOption {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  description: string;
}

const themes: ThemeOption[] = [
  {
    id: 'blue_neon',
    name: 'Blue/Purple Neon',
    primary: '#00d4ff',
    secondary: '#7c3aed',
    accent: '#06b6d4',
    description: 'Classic cyberpunk blue with purple accents'
  },
  {
    id: 'red_alert',
    name: 'Red/Orange Neon',
    primary: '#ff4444',
    secondary: '#ff8800',
    accent: '#ff6b35',
    description: 'High-intensity red with orange highlights'
  },
  {
    id: 'green_matrix',
    name: 'Green Matrix',
    primary: '#10b981',
    secondary: '#059669',
    accent: '#34d399',
    description: 'Matrix-inspired green terminal aesthetic'
  },
  {
    id: 'teal_cyber',
    name: 'Teal/Cyan Cyberpunk',
    primary: '#14b8a6',
    secondary: '#0891b2',
    accent: '#22d3ee',
    description: 'Futuristic teal with cyan energy'
  },
  {
    id: 'purple_haze',
    name: 'Purple Haze',
    primary: '#a855f7',
    secondary: '#ec4899',
    accent: '#8b5cf6',
    description: 'Mysterious purple with pink undertones'
  },
  {
    id: 'amber_glow',
    name: 'Amber Glow',
    primary: '#f59e0b',
    secondary: '#d97706',
    accent: '#fbbf24',
    description: 'Warm amber with golden highlights'
  }
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('blue_neon');
  const [currentBackground, setCurrentBackground] = useState('pulsing_energy'); // Changed default to pulsing_energy

  // Load saved preferences from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('anonbridge_theme');
    const savedBackground = localStorage.getItem('anonbridge_background');
    
    if (savedTheme && themes.find(t => t.id === savedTheme)) {
      setCurrentTheme(savedTheme);
    }
    
    if (savedBackground) {
      setCurrentBackground(savedBackground);
      applyBackgroundStyle(savedBackground);
    } else {
      applyBackgroundStyle('pulsing_energy'); // Default to pulsing_energy
    }
  }, []);

  // Apply CSS variables and theme classes when theme changes
  useEffect(() => {
    const theme = themes.find(t => t.id === currentTheme);
    if (theme) {
      const root = document.documentElement;
      root.style.setProperty('--theme-primary', theme.primary);
      root.style.setProperty('--theme-secondary', theme.secondary);
      root.style.setProperty('--theme-accent', theme.accent);
      root.style.setProperty('--theme-glow', `${theme.primary}80`);
      
      // Update body class for theme-specific styling
      document.body.className = document.body.className.replace(/theme-\w+/g, '');
      document.body.classList.add(`theme-${currentTheme}`);
      
      // Save to localStorage
      localStorage.setItem('anonbridge_theme', currentTheme);
    }
  }, [currentTheme]);

  // Apply background styles when background changes
  useEffect(() => {
    applyBackgroundStyle(currentBackground);
    localStorage.setItem('anonbridge_background', currentBackground);
  }, [currentBackground]);

  const applyBackgroundStyle = (backgroundId: string) => {
    const body = document.body;
    
    // Remove existing background classes
    body.classList.remove('bg-animated', 'bg-static', 'bg-grid', 'bg-waves', 'bg-matrix', 'bg-holo', 'bg-pulse');
    
    // Apply new background class
    switch (backgroundId) {
      case 'cyberpunk_cityscape':
        body.classList.add('bg-animated');
        break;
      case 'static_dark':
        body.classList.add('bg-static');
        break;
      case 'cyberpunk_grid':
        body.classList.add('bg-grid');
        break;
      case 'neon_waves':
        body.classList.add('bg-waves');
        break;
      case 'matrix_rain':
        body.classList.add('bg-matrix');
        break;
      case 'holographic_city':
        body.classList.add('bg-holo');
        break;
      case 'pulsing_energy':
        body.classList.add('bg-pulse');
        break;
    }
  };

  const value = {
    currentTheme,
    setCurrentTheme,
    themes,
    currentBackground,
    setCurrentBackground,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};