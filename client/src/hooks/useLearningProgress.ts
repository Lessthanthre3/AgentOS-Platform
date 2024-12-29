import { useState, useEffect } from 'react';

interface LearningProgress {
  completedModules: string[];
  lastAccessed?: string;
}

const STORAGE_KEY = 'learning_progress';

export default function useLearningProgress() {
  const [progress, setProgressState] = useState<LearningProgress>({ completedModules: [] });

  useEffect(() => {
    // Load progress from localStorage on mount
    const savedProgress = localStorage.getItem(STORAGE_KEY);
    if (savedProgress) {
      try {
        setProgressState(JSON.parse(savedProgress));
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    }
  }, []);

  const setProgress = async (newProgress: LearningProgress) => {
    try {
      // Update state
      setProgressState(newProgress);
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
      
      // Update last accessed timestamp
      const updatedProgress = {
        ...newProgress,
        lastAccessed: new Date().toISOString()
      };
      
      // Save to server (if we add this functionality later)
      // await fetch('/api/progress', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updatedProgress)
      // });
      
      return true;
    } catch (error) {
      console.error('Error saving progress:', error);
      return false;
    }
  };

  return { progress, setProgress };
}
