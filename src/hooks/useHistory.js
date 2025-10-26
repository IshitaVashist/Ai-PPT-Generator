import { useState } from 'react';

const STORAGE_KEY = 'presentationSearchHistory';
const MAX_HISTORY_LENGTH = 10;

const getHistoryFromStorage = () => {
  try {
    const historyJson = localStorage.getItem(STORAGE_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {

    console.error("Could not load history from localStorage:", error);
    return [];
  }
};

// history 
const saveHistoryToStorage = (history) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Could not save history to localStorage:", error);
  }
};

// custom hook for seach history
export default function useHistory() {
  const [history, setHistory] = useState(getHistoryFromStorage);

  const addHistoryItem = (term) => {
    const trimmedTerm = term.trim();
    if (!trimmedTerm) return;

    setHistory(prevHistory => {
      let newHistory = prevHistory.filter(item => item !== trimmedTerm);
      
      newHistory.unshift(trimmedTerm);
      
      if (newHistory.length > MAX_HISTORY_LENGTH) {
        newHistory = newHistory.slice(0, MAX_HISTORY_LENGTH);
      }
      saveHistoryToStorage(newHistory);
    
      return newHistory;
    });
  };

  return { history, addHistoryItem };
}