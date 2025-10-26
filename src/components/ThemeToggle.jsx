import React from 'react';
import { Sun, Moon } from 'lucide-react';
import useTheme from '../hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg
                 bg-white/10 border border-white/20 backdrop-blur-md
                 hover:bg-white/20 transition text-sm font-medium"
    >
      {theme === 'dark' ? (
        <>
          <Sun size={18} className="text-yellow-300" /> Light Mode
        </>
      ) : (
        <>
          <Moon size={18} className="text-blue-600" /> Dark Mode
        </>
      )}
    </button>
  );
}
