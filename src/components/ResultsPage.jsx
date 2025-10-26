import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import { 
  Menu, 
  Download, 
  Grid3x3, 
  LayoutList, 
  ChevronLeft, 
  ChevronRight,
  Paperclip,
  Dice5,
  Send,
  Edit2,
  Loader2,
  Check
} from 'lucide-react';
import { generateAndDownloadPPT } from '../utils/pptxGenerator';
import { editSlideContent } from '../api/gemini';

export default function ResultsPage({ data, onBack, theme, onThemeChange, initialPrompt, template }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: 'user', content: initialPrompt || 'Create a presentation' },
    { role: 'assistant', content: `I've created a presentation with ${data?.slides?.length || 0} slides titled "${data?.presentationTitle || 'Presentation'}".` }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [viewMode, setViewMode] = useState('all');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState(data?.slides || []);
  const [editingSlide, setEditingSlide] = useState(null);
  
  // 💡 FIX: Corrected original syntax error (was a dangling comma and missing const)
  const [splitPosition, setSplitPosition] = useState(50); 
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const isDragging = useRef(false);
  const chatEndRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Handle sending messages for editing
  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isProcessing) return;
    
    const userMessage = currentMessage;
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setCurrentMessage('');
    setIsProcessing(true);

    try {
      // Check if user is asking to edit a specific slide
      const slideNumberMatch = userMessage.match(/slide\s+(\d+)/i);
      const slideNumber = slideNumberMatch ? parseInt(slideNumberMatch[1]) : null;

      // Call Gemini to edit the presentation
      const response = await editSlideContent(slides, userMessage, slideNumber);
      
      // Update slides
      setSlides(response.slides);
      
      // Add AI response
      const changedSlidesList = response.changedSlides?.length > 0 
        ? ` (Updated slides: ${response.changedSlides.join(', ')})` 
        : '';
      
      const aiMessage = response.summary 
        ? `${response.summary}${changedSlidesList}`
        : `I've updated your presentation based on your request.${changedSlidesList}`;
      
      setChatHistory(prev => [...prev, { role: 'assistant', content: aiMessage }]);
      
      // Highlight changed slides briefly
      if (response.changedSlides?.length > 0 && viewMode === 'single') {
        setCurrentSlide(response.changedSlides[0] - 1);
      }

    } catch (error) {
      console.error('Error editing presentation:', error);
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error while processing your request. Please try again.' 
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle manual slide editing
  const handleSlideEdit = (slideIndex, field, value) => {
    const updatedSlides = [...slides];
    updatedSlides[slideIndex] = {
      ...updatedSlides[slideIndex],
      [field]: value
    };
    setSlides(updatedSlides);
  };

  // Handle bullet point editing
  const handleBulletEdit = (slideIndex, bulletIndex, value) => {
    const updatedSlides = [...slides];
    const bullets = [...(updatedSlides[slideIndex].bullets || [])];
    bullets[bulletIndex] = value;
    updatedSlides[slideIndex] = {
      ...updatedSlides[slideIndex],
      bullets
    };
    setSlides(updatedSlides);
  };

  // Handle download
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const presentationData = {
        presentationTitle: data.presentationTitle,
        slides: slides
      };
      
      const result = await generateAndDownloadPPT(presentationData, template || 'Professional');
      
      if (result.success) {
        setChatHistory(prev => [...prev, { 
          role: 'assistant', 
          content: `✅ Presentation "${result.filename}" downloaded successfully!` 
        }]);
      }
    } catch (error) {
      console.error('Error downloading PPT:', error);
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: '❌ Failed to download presentation. Please try again.' 
      }]);
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle split resize
  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const newPosition = (e.clientX / window.innerWidth) * 100;
    if (newPosition > 20 && newPosition < 80) {
      setSplitPosition(newPosition);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Styles
  const containerStyle = {
    display: 'flex',
    minHeight: '100vh',
    background: theme === 'light' 
      ? 'linear-gradient(to bottom, #f0f9ff, #e0e7ff)' 
      : theme === 'neon'
      ? 'linear-gradient(to bottom, #1a0033, #330066)'
      : 'linear-gradient(to bottom, #0a0e27, #1a1f3a)',
    position: 'relative',
  };

  const menuButtonStyle = {
    position: 'absolute', 
    top: '1.5rem',
    left: '1.5rem',
    padding: '9px',
    borderRadius: '12px',
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
    color: theme === 'neon' ? '#ff00ff' : theme === 'light' ? '#3b82f6' : '#06b6d4',
    cursor: 'pointer',
    zIndex: 30,
    boxShadow: theme === 'neon' ? '0 0 30px rgba(255, 0, 255, 0.6)' : '0 4px 12px rgba(0, 0, 0, 0.3)',
  };

  const splitContainerStyle = {
    display: 'flex',
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
  };

  const chatSectionStyle = {
    width: `${splitPosition}%`,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: theme === 'light' 
      ? 'rgba(255, 255, 255, 0.5)' 
      : 'rgba(15, 23, 42, 0.5)',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
    // 💡 FIX: Added 'position: relative' to anchor the absolute menu button
    position: 'relative', 
  };

  const resizerStyle = {
    width: '4px',
    cursor: 'col-resize',
    background: theme === 'neon' ? '#ff00ff' : '#06b6d4',
    transition: 'background 0.2s',
  };

  const pptSectionStyle = {
    width: `${100 - splitPosition}%`,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: theme === 'light' 
      ? 'rgba(241, 245, 249, 0.8)' 
      : 'rgba(10, 14, 39, 0.5)',
  };

  const chatHeaderStyle = {
    padding: '1.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    color: theme === 'light' ? '#1e293b' : 'white',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    // 💡 FIX: Added padding to make space for the moved button
    paddingTop: '5rem', 
  };

  const chatMessagesStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  };

  const messageStyle = (role) => ({
    padding: '1rem',
    borderRadius: '12px',
    maxWidth: '80%',
    alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
    background: role === 'user' 
      ? (theme === 'neon' ? 'linear-gradient(to right, #ff00ff, #00ffff)' : 'linear-gradient(to right, #8b5cf6, #06b6d4)')
      : (theme === 'light' ? '#e2e8f0' : 'rgba(30, 41, 59, 0.8)'),
    color: role === 'user' ? 'white' : (theme === 'light' ? '#1e293b' : 'white'),
    wordWrap: 'break-word',
  });

  const chatInputContainerStyle = {
    padding: '1rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  };

  const inputStyle = {
    flex: 1,
    padding: '0.75rem',
    borderRadius: '12px',
    background: theme === 'light' ? 'white' : 'rgba(30, 41, 59, 0.8)',
    border: theme === 'neon' ? '1px solid #ff00ff' : '1px solid rgba(255, 255, 255, 0.2)',
    color: theme === 'light' ? '#1e293b' : 'white',
    outline: 'none',
  };

  const iconButtonStyle = {
    padding: '0.75rem',
    borderRadius: '50%',
    background: theme === 'light' ? '#e2e8f0' : 'rgba(30, 41, 59, 0.8)',
    border: 'none',
    color: theme === 'neon' ? '#ff00ff' : '#06b6d4',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const pptHeaderStyle = {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  };

  const viewToggleStyle = {
    display: 'flex',
    gap: '0.5rem',
  };

  const viewButtonStyle = (isActive) => ({
    padding: '0.5rem',
    borderRadius: '8px',
    background: isActive 
      ? (theme === 'neon' ? 'rgba(255, 0, 255, 0.3)' : 'rgba(6, 182, 212, 0.3)')
      : 'transparent',
    border: isActive 
      ? (theme === 'neon' ? '1px solid #ff00ff' : '1px solid #06b6d4')
      : '1px solid rgba(255, 255, 255, 0.2)',
    color: theme === 'light' ? '#1e293b' : 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  const downloadButtonStyle = {
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    background: isDownloading 
      ? '#4b5563'
      : (theme === 'neon' 
        ? 'linear-gradient(to right, #ff00ff, #00ffff)' 
        : 'linear-gradient(to right, #8b5cf6, #06b6d4)'),
    border: 'none',
    color: 'white',
    // 💡 FIX: Corrected original syntax error (was a stray '.')
    cursor: isDownloading ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: 'bold',
  };

  const slidesContainerStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '1.5rem',
  };

  const slideCardStyle = {
    background: theme === 'light' ? 'white' : 'rgba(30, 41, 59, 0.8)',
    borderRadius: '12px',
    padding: '2rem',
    marginBottom: '1.5rem',
    border: theme === 'neon' ? '1px solid #ff00ff' : '1px solid rgba(255, 255, 255, 0.1)',
    position: 'relative',
  };

  const slideNumberStyle = {
    position: 'absolute',
    top: '1rem',
    left: '1rem',
    background: theme === 'neon' ? '#ff00ff' : '#06b6d4',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: 'bold',
  };

  const slideTitleStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: theme === 'light' ? '#1e293b' : 'white',
    marginBottom: '1rem',
    marginTop: '2rem',
  };

  const slideContentStyle = {
    color: theme === 'light' ? '#475569' : '#cbd5e1',
    lineHeight: '1.6',
    marginBottom: '1rem',
  };

  const editButtonStyle = {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    padding: '0.5rem',
    borderRadius: '8px',
    background: 'rgba(139, 92, 246, 0.2)',
    border: '1px solid #8b5cf6',
    color: '#8b5cf6',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div 
      style={containerStyle}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Button is no longer here */}

      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onThemeChange={onThemeChange}
        currentTheme={theme}
      />

      <div style={splitContainerStyle}>
        {/* Left Side - Chat */}
        <div style={chatSectionStyle}>

          {/* Button is now here */}
          <button 
            style={menuButtonStyle}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={28} strokeWidth={2.5} />
          </button>
          
          <div style={chatHeaderStyle}>💬 Chat & Edit</div>
          
          <div style={chatMessagesStyle}>
            {chatHistory.map((msg, idx) => (
              <div key={idx} style={messageStyle(msg.role)}>
                {msg.content}
              </div>
            ))}
            {isProcessing && (
              <div style={messageStyle('assistant')}>
                <Loader2 size={20} style={{display: 'inline', animation: 'spin 1s linear infinite'}} />
                {' '}Processing your request...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div style={chatInputContainerStyle}>
            <button style={iconButtonStyle} title="Attach file">
              <Paperclip size={20} />
            </button>
            <button style={iconButtonStyle} title="Random suggestion">
              {/* 💡 FIX: Corrected original syntax error (was 'size.') */}
              <Dice5 size={20} />
            </button>
            <input
              type="text"
              value={currentMessage}
              // 💡 FIX: Corrected original syntax error (was 'e.g.target.value')
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask to edit slides... (e.g., 'Make slide 3 more detailed')"
              style={inputStyle}
              disabled={isProcessing}
            />
            <button 
              style={{...iconButtonStyle, background: theme === 'neon' ? '#ff00ff' : '#06b6d4', cursor: isProcessing ? 'not-allowed' : 'pointer'}}
              onClick={handleSendMessage}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 size={20} color="white" style={{animation: 'spin 1s linear infinite'}} /> : <Send size={20} color="white" />}
            </button>
          </div>
        </div>

        {/* Resizer */}
        <div 
          style={resizerStyle}
          onMouseDown={handleMouseDown}
        />

        {/* Right Side - PPT Preview */}
        <div style={pptSectionStyle}>
          <div style={pptHeaderStyle}>
            <div style={viewToggleStyle}>
              <button 
                style={viewButtonStyle(viewMode === 'all')}
                onClick={() => setViewMode('all')}
                title="All slides"
              >
                <LayoutList size={20} />
              </button>
              <button 
                style={viewButtonStyle(viewMode === 'single')}
                onClick={() => setViewMode('single')}
                title="Single slide"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                style={viewButtonStyle(viewMode === 'grid')}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <Grid3x3 size={20} />
              </button>
            </div>

            <button style={downloadButtonStyle} onClick={handleDownload} disabled={isDownloading}>
              {isDownloading ? (
                <>
                  <Loader2 size={20} style={{animation: 'spin 1s linear infinite'}} />
                  Downloading...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Download PPT
                </>
              )}
            </button>
          </div>

          <div style={slidesContainerStyle}>
            {/* All Slides View */}
            {viewMode === 'all' && slides.map((slide, idx) => (
              <div key={idx} style={slideCardStyle}>
                <div style={slideNumberStyle}>Slide {idx + 1}</div>
                <button 
                  style={editButtonStyle}
                  onClick={() => setEditingSlide(idx === editingSlide ? null : idx)}
                  title={editingSlide === idx ? "Save changes" : "Edit slide"}
                >
                  {editingSlide === idx ? <Check size={16} /> : <Edit2 size={16} />}
                </button>
                
                {editingSlide === idx ? (
                  <div>
                    <input
                      type="text"
                      value={slide.title}
                      onChange={(e) => handleSlideEdit(idx, 'title', e.target.value)}
                      style={{...inputStyle, marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 'bold'}}
                      placeholder="Slide title..."
                    />
                    <textarea
                      value={slide.content || ''}
                      onChange={(e) => handleSlideEdit(idx, 'content', e.target.value)}
                      style={{...inputStyle, minHeight: '100px', width: '100%', resize: 'vertical'}}
                      placeholder="Main content..."
                    />
                    
                    {/* Edit bullets */}
                    {slide.bullets && slide.bullets.length > 0 && (
                      <div style={{marginTop: '1rem'}}>
                        <label style={{color: theme === 'light' ? '#1e293b' : 'white', display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>
                          Bullet Points:
                        </label>
                        {slide.bullets.map((bullet, bidx) => (
                          <input
                            key={bidx}
                            type="text"
                            value={bullet}
                            onChange={(e) => handleBulletEdit(idx, bidx, e.target.value)}
                            style={{...inputStyle, marginBottom: '0.5rem'}}
                            placeholder={`Bullet point ${bidx + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <h2 style={slideTitleStyle}>{slide.title}</h2>
                    {slide.content && (
                      <div style={slideContentStyle}>
                        {slide.content}
                      </div>
                    )}
                    {slide.bullets && slide.bullets.length > 0 && (
                      <ul style={{...slideContentStyle, marginTop: '1rem', paddingLeft: '1.5rem'}}>
                        {slide.bullets.map((bullet, bidx) => (
                          <li key={bidx} style={{marginBottom: '0.5rem'}}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                    {slide.leftContent && slide.rightContent && (
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem'}}>
                        <div style={slideContentStyle}>{slide.leftContent}</div>
                        <div style={slideContentStyle}>{slide.rightContent}</div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}

            {/* Single Slide View */}
            {viewMode === 'single' && slides[currentSlide] && (
              <div>
                <div style={{...slideCardStyle, minHeight: '500px'}}>
                  <div style={slideNumberStyle}>Slide {currentSlide + 1} of {slides.length}</div>
                  <button 
                    style={editButtonStyle}
                    onClick={() => setEditingSlide(currentSlide === editingSlide ? null : currentSlide)}
                  >
                    {editingSlide === currentSlide ? <Check size={16} /> : <Edit2 size={16} />}
                  </button>
                  
                  {editingSlide === currentSlide ? (
                    <div>
                      <input
                        type="text"
                        value={slides[currentSlide].title}
                        onChange={(e) => handleSlideEdit(currentSlide, 'title', e.target.value)}
                        style={{...inputStyle, marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 'bold'}}
                      />
                      <textarea
                        value={slides[currentSlide].content || ''}
                        onChange={(e) => handleSlideEdit(currentSlide, 'content', e.target.value)}
                        style={{...inputStyle, minHeight: '200px', width: '100%', resize: 'vertical'}}
                      />
                    </div>
                  ) : (
                    <>
                      <h2 style={slideTitleStyle}>{slides[currentSlide].title}</h2>
                      {slides[currentSlide].content && (
                        <div style={slideContentStyle}>
                          {slides[currentSlide].content}
                        </div>
                      )}
                      {slides[currentSlide].bullets && slides[currentSlide].bullets.length > 0 && (
                        <ul style={{...slideContentStyle, marginTop: '1rem', paddingLeft: '1.5rem'}}>
                          {slides[currentSlide].bullets.map((bullet, bidx) => (
                            <li key={bidx} style={{marginBottom: '0.5rem'}}>{bullet}</li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>
                
                <div style={{display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem'}}>
                  <button 
                    onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                    disabled={currentSlide === 0}
                    style={{...downloadButtonStyle, opacity: currentSlide === 0 ? 0.5 : 1, cursor: currentSlide === 0 ? 'not-allowed' : 'pointer'}}
                  >
                    <ChevronLeft size={20} /> Previous
                  </button>
                  <button 
                    onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                    disabled={currentSlide === slides.length - 1}
                    style={{...downloadButtonStyle, opacity: currentSlide === slides.length - 1 ? 0.5 : 1, cursor: currentSlide === slides.length - 1 ? 'not-allowed' : 'pointer'}}
                  >
                    Next <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem'}}>
                {slides.map((slide, idx) => (
                  <div 
                    key={idx} 
                    style={{...slideCardStyle, cursor: 'pointer', transition: 'transform 0.2s'}}
                    onClick={() => {setViewMode('single'); setCurrentSlide(idx);}}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={slideNumberStyle}>Slide {idx + 1}</div>
                    <h3 style={{...slideTitleStyle, fontSize: '1.125rem'}}>{slide.title}</h3>
                    <p style={{...slideContentStyle, fontSize: '0.875rem'}}>
                      {slide.content?.substring(0, 100)}{slide.content?.length > 100 ? '...' : ''}
                    </p>
                    {slide.bullets && slide.bullets.length > 0 && (
                      <p style={{...slideContentStyle, fontSize: '0.75rem', marginTop: '0.5rem', fontStyle: 'italic'}}>
                        {slide.bullets.length} bullet points
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {(!slides || slides.length === 0) && (
              <div style={{textAlign: 'center', padding: '3rem', color: theme === 'light' ? '#64748b' : '#9ca3af'}}>
                <p style={{fontSize: '1.25rem', marginBottom: '0.5rem'}}>No slides generated yet</p>
                <p>Start by creating a presentation from the home page</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}