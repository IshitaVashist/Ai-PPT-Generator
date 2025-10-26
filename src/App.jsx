import React, { useState } from 'react';
import HomePage from './components/Homepage';
import ResultsPage from './components/ResultsPage';
import useTheme from './hooks/useTheme'; 

export default function App() {
  const [presentationData, setPresentationData] = useState(null);
  
  const { theme, toggleTheme, setTheme } = useTheme(); 

  const handleGenerateSuccess = (content, initialPrompt, template) => {
    setPresentationData({ ...content, initialPrompt, template });
  };

  const handleBack = () => {
    setPresentationData(null);
  };

  const appContainerClasses = `min-h-screen font-inter antialiased ${theme}`;

  return (
    <div className={appContainerClasses}>
      {presentationData ? (
        <ResultsPage 
          data={presentationData} 
          onBack={handleBack} 
          theme={theme}
          onThemeChange={setTheme}
          initialPrompt={presentationData.initialPrompt} 
          template={presentationData.template} 
        />
      ) : (
        <HomePage 
          onGenerate={handleGenerateSuccess} 
          theme={theme}
          onThemeChange={setTheme}
        />
      )}
    </div>
  );
}