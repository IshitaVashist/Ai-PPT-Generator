import React from 'react';
import { History, ChevronDown, Palette, Save } from 'lucide-react';

export default function Sidebar({ isOpen, onClose, onThemeChange, currentTheme, onSave }) {
  const historyItems = [
    { title: 'AI in Education', date: 'Oct 24, 11:45 AM' },
    { title: 'AI Applications', date: 'Oct 23, 02:30 PM' },
  ];

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: isOpen ? 'block' : 'none',
    zIndex: 40,
  };

  const sidebarStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '320px',
    height: '100vh',
    padding: '1.5rem',
    background: 'rgba(15, 23, 42, 0.95)',
    borderRight: '1px solid rgba(51, 65, 85, 0.5)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 0.3s ease-in-out',
    zIndex: 50,
  };

  const logoStyle = {
    fontSize: '1.5 rem',
    fontWeight: 'bold',
    background: 'linear-gradient(to right, #8b5cf6, #06b6d4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '2rem',
  };

  const sectionStyle = {
    marginBottom: '2rem',
  };

  const sectionHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
    color: '#d1d5db',
    fontSize: '0.875rem',
    fontWeight: '600',
  };

  const historyItemStyle = {
    width: '100%',
    textAlign: 'left',
    padding: '0.75rem',
    borderRadius: '8px',
    background: 'transparent',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    marginBottom: '0.5rem',
    transition: 'background 0.2s',
  };

  const historyItemTitleStyle = {
    fontWeight: '500',
    color: 'white',
    marginBottom: '0.25rem',
  };

  const historyItemDateStyle = {
    fontSize: '0.75rem',
    color: '#9ca3af',
  };

  const themeButtonStyle = (isActive) => ({
    width: '100%',
    padding: '0.75rem',
    marginBottom: '0.5rem',
    borderRadius: '8px',
    background: isActive ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)',
    border: isActive ? '1px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.1)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  });

  const saveButtonStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    background: 'linear-gradient(to right, #8b5cf6, #06b6d4)',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'opacity 0.2s',
  };

  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <aside style={sidebarStyle}>
        <div>
          <h2 style={logoStyle}>GenPPT</h2>

          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <Palette size={16} /> Theme
            </div>
            <div>
              <button
                style={themeButtonStyle(currentTheme === 'dark')}
                onClick={() => onThemeChange('dark')}
                onMouseEnter={(e) => {
                  if (currentTheme !== 'dark') {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentTheme !== 'dark') {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
              >
                🌙 Dark
              </button>
              <button
                style={themeButtonStyle(currentTheme === 'light')}
                onClick={() => onThemeChange('light')}
                onMouseEnter={(e) => {
                  if (currentTheme !== 'light') {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentTheme !== 'light') {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
              >
                ☀️ Light
              </button>
              <button
                style={themeButtonStyle(currentTheme === 'neon')}
                onClick={() => onThemeChange('neon')}
                onMouseEnter={(e) => {
                  if (currentTheme !== 'neon') {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentTheme !== 'neon') {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
              >
                💫 Neon
              </button>
            </div>
          </div>
        </div>
        
      </aside>
    </>
  );
}