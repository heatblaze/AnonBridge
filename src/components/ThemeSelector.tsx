import React, { useState, useEffect } from 'react';
import { X, Palette, Monitor, Sparkles, Grid, Waves, Building, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

const backgroundOptions = [
  {
    id: 'cyberpunk_cityscape',
    name: 'Cyberpunk Cityscape',
    description: 'Live animated cityscape with buildings, lights, and flying vehicles',
    icon: Building
  },
  {
    id: 'static_dark',
    name: 'Static Dark',
    description: 'Clean dark gradient background',
    icon: Monitor
  },
  {
    id: 'cyberpunk_grid',
    name: 'Cyberpunk Grid',
    description: 'Animated grid pattern overlay',
    icon: Grid
  },
  {
    id: 'neon_waves',
    name: 'Neon Waves',
    description: 'Subtle wave patterns with neon accents',
    icon: Waves
  },
  {
    id: 'matrix_rain',
    name: 'Matrix Rain',
    description: 'Falling green characters like The Matrix',
    icon: Sparkles
  },
  {
    id: 'holographic_city',
    name: 'Holographic City',
    description: 'Futuristic holographic cityscape',
    icon: Building
  },
  {
    id: 'pulsing_energy',
    name: 'Pulsing Energy',
    description: 'Rhythmic energy pulses and waves',
    icon: Zap
  }
];

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ isOpen, onClose }) => {
  const { currentTheme, setCurrentTheme, themes, currentBackground, setCurrentBackground } = useTheme();
  const [tempTheme, setTempTheme] = useState(currentTheme);
  const [tempBackground, setTempBackground] = useState(currentBackground);

  // Update temp values when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempTheme(currentTheme);
      setTempBackground(currentBackground);
    }
  }, [isOpen, currentTheme, currentBackground]);

  const handleApplyChanges = () => {
    setCurrentTheme(tempTheme);
    setCurrentBackground(tempBackground);
    onClose();
  };

  const handleCancel = () => {
    setTempTheme(currentTheme);
    setTempBackground(currentBackground);
    onClose();
  };

  const hasChanges = tempTheme !== currentTheme || tempBackground !== currentBackground;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleCancel} />
      <div className="relative bg-gray-900/95 border border-gray-700 rounded-2xl p-8 max-w-5xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Palette className="w-6 h-6 text-cyan-400" />
            <h2 className="font-orbitron text-2xl font-bold text-white">
              Theme & Background Selector
            </h2>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Theme Selection */}
        <div className="mb-8">
          <h3 className="font-orbitron text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-cyan-400" />
            Color Themes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes.map((theme) => (
              <div
                key={theme.id}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                  tempTheme === theme.id 
                    ? 'border-cyan-400 bg-gray-800/50 shadow-lg shadow-cyan-400/20' 
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setTempTheme(theme.id)}
              >
                {/* Theme Preview */}
                <div 
                  className="h-24 rounded-lg mb-3 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary}, ${theme.accent})`
                  }}
                >
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-white/20 backdrop-blur-sm" />
                      <div className="flex-1 h-2 bg-white/20 backdrop-blur-sm rounded" />
                    </div>
                  </div>
                  
                  {/* Animated elements */}
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white/40 animate-pulse" />
                </div>

                {/* Theme Info */}
                <h4 className="font-orbitron text-sm font-bold text-white mb-1">
                  {theme.name}
                </h4>
                <p className="text-gray-400 text-xs mb-2 line-clamp-2">{theme.description}</p>

                {/* Color Palette */}
                <div className="flex gap-2 mb-2">
                  <div
                    className="w-4 h-4 rounded-full border border-gray-600 shadow-sm"
                    style={{ backgroundColor: theme.primary }}
                    title="Primary"
                  />
                  <div
                    className="w-4 h-4 rounded-full border border-gray-600 shadow-sm"
                    style={{ backgroundColor: theme.secondary }}
                    title="Secondary"
                  />
                  <div
                    className="w-4 h-4 rounded-full border border-gray-600 shadow-sm"
                    style={{ backgroundColor: theme.accent }}
                    title="Accent"
                  />
                </div>

                {/* Selection Indicator */}
                {tempTheme === theme.id && (
                  <div className="flex items-center gap-2 text-cyan-400">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                    <span className="text-xs font-medium">Selected</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Background Style Selection */}
        <div className="mb-8">
          <h3 className="font-orbitron text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-cyan-400" />
            Background Styles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {backgroundOptions.map((bg) => (
              <div
                key={bg.id}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                  tempBackground === bg.id 
                    ? 'border-cyan-400 bg-gray-800/50 shadow-lg shadow-cyan-400/20' 
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setTempBackground(bg.id)}
              >
                {/* Background Preview */}
                <div className="h-20 rounded-lg mb-3 relative overflow-hidden border border-gray-600 bg-gradient-to-br from-gray-800 to-gray-900">
                  {bg.id === 'cyberpunk_cityscape' && (
                    <div className="absolute inset-0">
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-blue-900/50 to-transparent" />
                      <div className="absolute top-2 left-2 w-1 h-1 bg-cyan-400 rounded-full animate-ping" />
                      <div className="absolute top-3 right-3 w-1 h-1 bg-red-400 rounded-full animate-pulse" />
                      <div className="absolute bottom-2 left-4 w-8 h-4 bg-blue-500/30 rounded-sm" />
                      <div className="absolute bottom-2 right-4 w-6 h-6 bg-purple-500/30 rounded-sm" />
                    </div>
                  )}
                  {bg.id === 'cyberpunk_grid' && (
                    <div 
                      className="absolute inset-0 opacity-40"
                      style={{
                        backgroundImage: 'linear-gradient(cyan 1px, transparent 1px), linear-gradient(90deg, cyan 1px, transparent 1px)',
                        backgroundSize: '8px 8px'
                      }}
                    />
                  )}
                  {bg.id === 'neon_waves' && (
                    <div className="absolute inset-0">
                      <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-purple-500/40 via-cyan-500/40 to-purple-500/40 rounded-full" />
                      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20" />
                    </div>
                  )}
                  {bg.id === 'matrix_rain' && (
                    <div className="absolute inset-0 bg-black">
                      <div className="absolute inset-0 text-green-400 text-xs font-mono opacity-60">
                        <div className="absolute top-1 left-1">01</div>
                        <div className="absolute top-3 left-3">10</div>
                        <div className="absolute top-2 right-2">11</div>
                        <div className="absolute bottom-2 left-2">00</div>
                      </div>
                    </div>
                  )}
                  {bg.id === 'holographic_city' && (
                    <div className="absolute inset-0">
                      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-blue-500/30 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
                    </div>
                  )}
                  {bg.id === 'pulsing_energy' && (
                    <div className="absolute inset-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent animate-pulse" />
                      <div className="absolute top-2 right-2 w-2 h-2 bg-purple-400 rounded-full animate-ping" />
                    </div>
                  )}
                  {bg.id === 'static_dark' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
                  )}
                  
                  <div className="absolute top-1 left-1">
                    <bg.icon className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>

                {/* Background Info */}
                <h4 className="font-rajdhani text-sm font-bold text-white mb-1">
                  {bg.name}
                </h4>
                <p className="text-gray-400 text-xs line-clamp-2">{bg.description}</p>

                {/* Selection Indicator */}
                {tempBackground === bg.id && (
                  <div className="flex items-center gap-2 text-cyan-400 mt-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                    <span className="text-xs font-medium">Selected</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-700">
          <div className="flex items-center gap-2">
            {hasChanges && (
              <div className="flex items-center gap-2 text-yellow-400">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <span className="text-sm">Unsaved changes</span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-rajdhani font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyChanges}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white rounded-lg transition-all duration-300 font-rajdhani font-semibold shadow-lg hover:shadow-cyan-500/25"
            >
              Apply Changes
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-700/50">
          <p className="text-center text-gray-500 text-sm">
            🎨 Customize your AnonBridge experience with themes and backgrounds that match your style
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;