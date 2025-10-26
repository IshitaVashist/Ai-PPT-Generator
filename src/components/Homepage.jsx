import React, { useState } from 'react';
import Sidebar from './Sidebar';
import {
  Paperclip,
  Dice5,
  Loader2,
  Menu,
  Mic
} from 'lucide-react';
import { generatePresentationContent } from '../api/gemini'; 

export default function HomePage({ onGenerate, theme, onThemeChange }) {
  const [prompt, setPrompt] = useState('');
  const [template, setTemplate] = useState('Professional');
  const [length, setLength] = useState('8-12 Slides');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const randomTopics = [
    'The ethical implications of quantum computing',
    'The history of typography and its modern use',
    'Sustainable aquaculture practices for urban environments',
    'Analyzing the narrative structure of classic video games',
    'The psychology of color in branding and marketing',
  ];

  const handleAttachFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPrompt(prev => (prev ? prev + '\n\n' : '') + `--- Attached File (${file.name}) ---\n` + e.target.result);
        setError(`File "${file.name}" loaded successfully and appended to the prompt!`);
        setTimeout(() => setError(null), 3000);
      };
      reader.onerror = () => {
        setError("Failed to read the file.");
      };
      reader.readAsText(file);
    } else {
      setError("Please select a valid .txt file.");
    }
  };

  const handleRandomPrompt = () => {
    const newPrompt = randomTopics[Math.floor(Math.random() * randomTopics.length)];
    setPrompt(newPrompt);
    setError("A random topic was generated. Feel free to edit it!");
    setTimeout(() => setError(null), 3000);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setError("Speech recognition is not supported in your browser. Try Chrome or Edge.");
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError("Listening... Speak now.");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setPrompt(prev => prev + ' ' + transcript.trim());
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setError(`Speech error: ${event.error}.`);
    };

    recognition.onend = () => {
      setIsListening(false);
      setError(null);
    };

    if (isListening) {
        recognition.stop();
    } else {
        recognition.start();
    }
  };
  
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a topic or idea to generate a presentation.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const content = await generatePresentationContent(prompt, length, template);
      
      // Save to history
      await saveToHistory(prompt, template);
      
      if (onGenerate) {
        onGenerate(content, prompt, template);
      }
      
    } catch (err) {
      console.error(err);
      setError("An error occurred during content generation. Please try again.");
      setLoading(false);
    }
  };

  // Save search to history
  const saveToHistory = async (searchPrompt, searchTemplate) => {
    try {
      const timestamp = Date.now();
      const historyKey = `history:${timestamp}`;
      const historyItem = {
        title: searchPrompt.substring(0, 50) + (searchPrompt.length > 50 ? '...' : ''),
        fullPrompt: searchPrompt,
        template: searchTemplate,
        date: new Date().toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        timestamp: timestamp
      };
      
      await window.storage.set(historyKey, JSON.stringify(historyItem));
      console.log('Saved to history:', historyItem);
    } catch (error) {
      console.error('Failed to save to history:', error);
    }
  };

  const handleSave = () => {
    console.log('Saving to history...');
    setError('Session saved to history!');
    setTimeout(() => setError(null), 3000);
  };

  const getMenuButtonSize = () => {
    return {
      padding: '1rem',
      iconSize: 28,
    };
  };

  const buttonSize = getMenuButtonSize();

  const getBackgroundStyle = () => {
    switch(theme) {
      case 'light':
        return 'linear-gradient(to bottom, #f0f9ff, #e0e7ff)';
      case 'neon':
        return 'linear-gradient(to bottom, #1a0033, #330066)';
      default:
        return 'linear-gradient(to bottom, #0a0e27, #1a1f3a)';
    }
  };

  const getTextColor = () => {
    return theme === 'light' ? '#1e293b' : 'white';
  };

  const getRobotColor = () => {
    if (theme === 'neon') return '#ff00ff';
    if (theme === 'light') return '#3b82f6';
    return '#06b6d4';
  };
  
  const containerStyle = {
    display: 'flex',
    minHeight: '100vh',
    background: getBackgroundStyle(),
    position: 'relative',
  };

  const menuButtonStyle = {
    position: 'fixed',
    top: '9px',
    left: '0.5rem',
    padding: buttonSize.padding,
    borderRadius: '9px',
    background: theme === 'neon' 
      ? 'rgba(255, 0, 255, 0.4)' 
      : theme === 'light'
      ? 'rgba(255, 255, 255, 0.9)'
      : 'rgba(30, 41, 59, 0.9)',
    border: theme === 'neon' 
      ? '2px solid #ff00ff' 
      : theme === 'light'
      ? '2px solid #3b82f6'
      : '2px solid rgba(6, 182, 212, 0.8)',
    color: theme === 'neon' 
      ? '#ff00ff' 
      : theme === 'light'
      ? '#3b82f6'
      : '#06b6d4',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
    boxShadow: theme === 'neon' 
      ? '0 0 30px rgba(255, 0, 255, 0.6)' 
      : '0 4px 12px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s',
  };

  const mainStyle = {
    flex: 1,
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const cardStyle = {
    width: '100%',
    maxWidth: '900px',
    padding: '3rem',
    borderRadius: '24px',
    background: theme === 'light' 
      ? 'rgba(255, 255, 255, 0.9)' 
      : theme === 'neon'
      ? 'rgba(25, 0, 51, 0.8)'
      : 'rgba(15, 23, 42, 0.6)',
    border: theme === 'neon' 
      ? '2px solid #ff00ff' 
      : '1px solid rgba(99, 102, 241, 0.3)',
    backdropFilter: 'blur(10px)',
    boxShadow: theme === 'neon' ? '0 0 40px rgba(255, 0, 255, 0.3)' : 'none',
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '2rem',
  };

  const titleStyle = {
    fontSize: '3rem',
    fontWeight: 'bold',
    background: theme === 'neon' 
      ? 'linear-gradient(to right, #ff00ff, #00ffff)' 
      : 'linear-gradient(to right, #06b6d4, #3b82f6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '0.5rem',
    letterSpacing: '0.1em',
    textShadow: theme === 'neon' ? '0 0 20px rgba(255, 0, 255, 0.5)' : 'none',
  };

  const subtitleStyle = {
    fontSize: '0.875rem',
    color: theme === 'light' ? '#64748b' : '#9ca3af',
    letterSpacing: '0.1em',
  };

  const robotContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '2rem',
  };

  const robotStyle = {
    width: '200px',
    height: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const errorStyle = {
    background: 'rgba(185, 28, 28, 0.3)',
    color: '#fca5a5',
    padding: '0.75rem',
    borderRadius: '12px',
    marginBottom: '1rem',
    textAlign: 'center',
  };

  const feedbackStyle = {
    background: theme === 'neon' ? 'rgba(0, 255, 255, 0.3)' : 'rgba(34, 197, 94, 0.3)',
    color: theme === 'neon' ? '#00ffff' : '#86efad',
    padding: '0.75rem',
    borderRadius: '12px',
    marginBottom: '1rem',
    textAlign: 'center',
  };

  const inputContainerStyle = {
    marginBottom: '1.5rem',
  };

  const inputStyle = {
    width: '100%',
    padding: '1rem',
    borderRadius: '12px',
    background: theme === 'light' 
      ? 'rgba(241, 245, 249, 0.8)' 
      : theme === 'neon'
      ? 'rgba(50, 0, 100, 0.5)'
      : 'rgba(30, 41, 59, 0.8)',
    border: theme === 'neon' 
      ? '1px solid #ff00ff' 
      : `1px solid ${theme === 'light' ? '#cbd5e1' : 'rgba(51, 65, 85, 0.8)'}`,
    color: getTextColor(),
    fontSize: '1rem',
    outline: 'none',
  };

  const controlsStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  };

  const iconButtonsStyle = {
    display: 'flex',
    gap: '0.75rem',
  };

  const iconButtonStyle = {
    padding: '0.75rem',
    borderRadius: '50%',
    background: theme === 'light' 
      ? 'rgba(241, 245, 249, 0.8)' 
      : theme === 'neon'
      ? 'rgba(255, 0, 255, 0.2)'
      : 'rgba(30, 41, 59, 0.8)',
    border: theme === 'neon' 
      ? '1px solid #ff00ff' 
      : 'none',
    color: theme === 'neon' 
      ? '#ff00ff' 
      : '#06b6d4',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  };

  const micButtonStyle = {
    ...iconButtonStyle,
    ...(isListening && {
      background: theme === 'light'
        ? 'rgba(239, 68, 68, 0.8)'
        : theme === 'neon'
        ? 'rgba(0, 255, 255, 0.5)'
        : 'rgba(220, 38, 38, 0.8)',
      color: theme === 'neon' ? '#00ffff' : 'white',
      border: theme === 'neon' ? '1px solid #00ffff' : 'none',
      boxShadow: isListening ? '0 0 15px rgba(220, 38, 38, 0.7)' : 'none',
    }),
  };

  const dropdownsStyle = {
    display: 'flex',
    gap: '1rem',
  };

  const selectStyle = {
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    background: theme === 'light' 
      ? 'rgba(241, 245, 249, 0.8)' 
      : theme === 'neon'
      ? 'rgba(50, 0, 100, 0.5)'
      : 'rgba(30, 41, 59, 0.8)',
    border: theme === 'neon' 
      ? '1px solid #ff00ff' 
      : `1px solid ${theme === 'light' ? '#cbd5e1' : 'rgba(51, 65, 85, 0.8)'}`,
    color: getTextColor(),
    cursor: 'pointer',
    outline: 'none',
    fontSize: '0.875rem',
    minWidth: '100px',
  };

  const generateButtonStyle = {
    padding: '0.75rem 2rem',
    borderRadius: '12px',
    fontWeight: 'bold',
    border: 'none',
    cursor: loading ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1rem',
    transition: 'all 0.3s',
    ...(loading 
      ? {
          background: '#4b5563',
          color: '#9ca3af',
        }
      : theme === 'neon'
      ? {
          background: 'linear-gradient(to right, #ff00ff, #00ffff)',
          color: 'white',
          boxShadow: '0 0 30px rgba(255, 0, 255, 0.6)',
        }
      : {
          background: 'linear-gradient(to right, #8b5cf6, #06b6d4)',
          color: 'white',
          boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
        }
    ),
  };

  return (
    <div style={containerStyle}>
      <button 
        style={menuButtonStyle}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.15)';
          e.currentTarget.style.boxShadow = theme === 'neon' 
            ? '0 0 40px rgba(255, 0, 255, 0.8)' 
            : '0 6px 20px rgba(0, 0, 0, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = theme === 'neon' 
            ? '0 0 30px rgba(255, 0, 255, 0.6)' 
            : '0 4px 12px rgba(0, 0, 0, 0.3)';
        }}
      >
        <Menu size={buttonSize.iconSize} strokeWidth={2.5} />
      </button>

      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onThemeChange={onThemeChange}
        currentTheme={theme}
        onSave={handleSave}
      />

      <main style={mainStyle}>
        <div style={cardStyle}>
          <header style={headerStyle}>
            <h1 style={titleStyle}>AI PPT Generator</h1>
            <p style={subtitleStyle}>Powered by Gemini & pptxgenjs</p>
          </header>

          <div style={robotContainerStyle}>
            <div style={robotStyle}>
              <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="50" y="80" width="100" height="90" rx="20" fill="#1e3a5f" stroke={getRobotColor()} strokeWidth="3"/>
                <rect x="60" y="40" width="80" height="60" rx="15" fill="#1e3a5f" stroke={getRobotColor()} strokeWidth="3"/>
                <circle cx="100" cy="30" r="8" fill={getRobotColor()}/>
                <line x1="100" y1="38" x2="100" y2="40" stroke={getRobotColor()} strokeWidth="3"/>
                <circle cx="80" cy="60" r="8" fill={getRobotColor()}/>
                <circle cx="120" cy="60" r="8" fill={getRobotColor()}/>
                <path d="M 75 75 Q 100 85 125 75" stroke={getRobotColor()} strokeWidth="3" fill="none"/>
                <rect x="30" y="90" width="20" height="50" rx="10" fill="#1e3a5f" stroke={getRobotColor()} strokeWidth="2"/>
                <rect x="150" y="90" width="20" height="50" rx="10" fill="#1e3a5f" stroke={getRobotColor()} strokeWidth="2"/>
                <circle cx="40" cy="145" r="12" fill={getRobotColor()}/>
                <circle cx="160" cy="145" r="12" fill={getRobotColor()}/>
              </svg>
            </div>
          </div>
          
          {error && (
            <div style={error?.includes("error") ? errorStyle : feedbackStyle}>
              {error}
            </div>
          )}

          <div style={inputContainerStyle}>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={isListening ? "Listening... Speak now." : "Enter your topic or idea..."}
              style={inputStyle}
              disabled={loading || isListening}
            />
          </div>

          <div style={controlsStyle}>
            <div style={iconButtonsStyle}>
              <input
                type="file"
                id="file-attach"
                accept=".txt"
                onChange={handleAttachFile}
                style={{ display: 'none' }}
                disabled={loading || isListening}
              />
              <button 
                style={iconButtonStyle} 
                title="Attach .txt File"
                onClick={() => document.getElementById('file-attach').click()}
                disabled={loading || isListening}
              >
                <Paperclip size={20} />
              </button>

              <button 
                style={iconButtonStyle} 
                title="Generate Random Topic"
                onClick={handleRandomPrompt}
                disabled={loading || isListening}
              >
                <Dice5 size={20} />
              </button>

              <button 
                style={micButtonStyle} 
                title={isListening ? "Stop Listening (Click to stop)" : "Start Voice Input (Click to speak)"}
                onClick={handleVoiceInput}
                disabled={loading}
              >
                <Mic size={20} />
              </button>
            </div>

            <div style={dropdownsStyle}>
              <select 
                value={template} 
                onChange={(e) => setTemplate(e.target.value)} 
                style={selectStyle}
                disabled={loading || isListening}
              >
                <option value="Professional">Template</option>
                <option value="Academic">Academic</option>
                <option value="Creative">Creative</option>
              </select>

              <select 
                value={length} 
                onChange={(e) => setLength(e.target.value)} 
                style={selectStyle}
                disabled={loading || isListening}
              >
                <option value="8-12 Slides">Length</option>
                <option value="5-8 Slides">5-8 Slides</option>
                <option value="12-15 Slides">12-15 Slides</option>
              </select>
            </div>

            <button
              onClick={handleGenerate}
              style={generateButtonStyle}
              disabled={loading || isListening || !prompt.trim()}
            >
              {loading && <Loader2 size={20} style={{animation: 'spin 1s linear infinite'}} />}
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}