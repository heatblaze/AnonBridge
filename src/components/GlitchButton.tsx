import React, { ButtonHTMLAttributes } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface GlitchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glitchIntensity?: 'low' | 'medium' | 'high';
  children: React.ReactNode;
}

const GlitchButton: React.FC<GlitchButtonProps> = ({ 
  variant = 'primary', 
  size = 'md',
  glitchIntensity = 'medium',
  className = '', 
  children, 
  disabled = false,
  ...props 
}) => {
  const { currentTheme, themes } = useTheme();
  const theme = themes.find(t => t.id === currentTheme) || themes[0];

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm';
      case 'md': return 'px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base';
      case 'lg': return 'px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg';
      case 'xl': return 'px-8 sm:px-10 py-4 sm:py-5 text-lg sm:text-xl';
      default: return 'px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base';
    }
  };

  const getVariantStyles = () => {
    const baseStyles = {
      background: 'transparent',
      borderColor: theme.primary,
      color: theme.primary,
      boxShadow: `0 0 10px ${theme.primary}40`
    };

    switch (variant) {
      case 'primary':
        return {
          background: `linear-gradient(45deg, ${theme.primary}, ${theme.secondary})`,
          borderColor: theme.primary,
          color: 'white',
          boxShadow: `0 0 20px ${theme.primary}40, inset 0 0 20px rgba(255,255,255,0.1)`
        };
      case 'secondary':
        return {
          background: `linear-gradient(45deg, ${theme.secondary}, ${theme.accent})`,
          borderColor: theme.secondary,
          color: 'white',
          boxShadow: `0 0 20px ${theme.secondary}40, inset 0 0 20px rgba(255,255,255,0.1)`
        };
      case 'outline':
        return {
          background: 'transparent',
          borderColor: theme.primary,
          color: theme.primary,
          boxShadow: `0 0 15px ${theme.primary}30`
        };
      case 'ghost':
        return {
          background: 'rgba(255,255,255,0.05)',
          borderColor: 'transparent',
          color: theme.primary,
          boxShadow: 'none'
        };
      default:
        return baseStyles;
    }
  };

  const getGlitchIntensityClass = () => {
    switch (glitchIntensity) {
      case 'low': return 'glitch-low';
      case 'medium': return 'glitch-medium';
      case 'high': return 'glitch-high';
      default: return 'glitch-medium';
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <button
      className={`
        relative overflow-hidden font-rajdhani font-semibold uppercase tracking-wider
        transition-all duration-300 transform hover:scale-105 hover:-translate-y-1
        border-2 rounded-lg group
        ${getGlitchIntensityClass()}
        ${getSizeClasses()}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        background: variantStyles.background,
        borderColor: variantStyles.borderColor,
        color: variantStyles.color,
        boxShadow: disabled ? 'none' : variantStyles.boxShadow
      }}
      disabled={disabled}
      {...props}
    >
      {/* Background Glitch Layers */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(45deg, ${theme.primary}20, ${theme.secondary}20, ${theme.accent}20)`,
          animation: 'glitch-bg 0.3s infinite'
        }}
      />
      
      {/* Scan Line Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 transform -skew-x-12 -translate-x-full transition-transform duration-700 group-hover:translate-x-full group-hover:opacity-10" />
      
      {/* Neon Glow Pulse */}
      <div 
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          boxShadow: `0 0 30px ${theme.primary}60, 0 0 60px ${theme.primary}30`,
          animation: 'neon-pulse 2s ease-in-out infinite'
        }}
      />

      {/* Main Content */}
      <span className="relative z-10 flex items-center justify-center glitch-text">
        {children}
      </span>

      {/* Glitch Text Duplicates */}
      <span 
        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-red-400 glitch-layer-1"
        style={{ animation: 'glitch-1 0.3s infinite' }}
      >
        {children}
      </span>
      <span 
        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-cyan-400 glitch-layer-2"
        style={{ animation: 'glitch-2 0.3s infinite' }}
      >
        {children}
      </span>

      {/* Electric Border Effect */}
      <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" 
           style={{ animation: 'electric-border 1s ease-in-out infinite' }} />
    </button>
  );
};

export default GlitchButton;