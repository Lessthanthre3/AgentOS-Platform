import { useState, useEffect } from 'react';
import LearningModel from '../ml/LearningModel';

const STORAGE_KEY = 'user-learning-progress';
const MODEL_UPDATE_INTERVAL = 1000 * 60 * 5; // 5 minutes

const useUserProgress = () => {
  const [learningModel] = useState(() => new LearningModel());
  const [lastModelUpdate, setLastModelUpdate] = useState(Date.now());

  // Initialize model
  useEffect(() => {
    learningModel.loadModel();
  }, []);

  // Save progress to localStorage
  const saveProgress = (progress) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  };

  // Get progress from localStorage
  const getUserProgress = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  };

  // Process learning data and update model
  const processLearningData = async (data) => {
    const currentTime = Date.now();
    
    // Prepare learning metrics
    const learningMetrics = {
      timeSpent: data.timeSpent,
      attemptCount: data.attemptCount || 1,
      correctAnswers: data.isCorrect ? 1 : 0,
      totalQuestions: 1,
      averageResponseTime: data.timeSpent,
      helpRequestCount: data.helpRequests || 0,
      revisitCount: data.revisits || 0,
      completionRate: data.isCorrect ? 1 : 0,
      engagementScore: calculateEngagementScore(data),
      difficultyRating: calculateDifficultyRating(data),
      confidenceScore: calculateConfidenceScore(data)
    };

    // Update model if enough time has passed
    if (currentTime - lastModelUpdate > MODEL_UPDATE_INTERVAL) {
      try {
        await learningModel.train([learningMetrics]);
        await learningModel.saveModel();
        setLastModelUpdate(currentTime);
      } catch (error) {
        console.error('Error updating learning model:', error);
      }
    }

    return learningMetrics;
  };

  // Calculate engagement score based on user behavior
  const calculateEngagementScore = (data) => {
    let score = 100;
    
    // Reduce score for long response times
    if (data.timeSpent > 60) score -= 10;
    if (data.timeSpent > 120) score -= 20;
    
    // Reduce score for multiple attempts
    score -= (data.attemptCount - 1) * 5;
    
    // Boost score for quick correct answers
    if (data.isCorrect && data.timeSpent < 30) score += 10;
    
    return Math.max(0, Math.min(100, score));
  };

  // Calculate difficulty rating based on user performance
  const calculateDifficultyRating = (data) => {
    let difficulty = 3; // Default medium difficulty
    
    // Adjust based on attempts and time
    if (data.attemptCount > 2) difficulty += 1;
    if (data.timeSpent > 90) difficulty += 1;
    
    // Adjust based on correctness
    if (data.isCorrect && data.timeSpent < 30) difficulty -= 1;
    
    return Math.max(1, Math.min(5, difficulty));
  };

  // Calculate confidence score based on user performance
  const calculateConfidenceScore = (data) => {
    let confidence = 100;
    
    // Reduce confidence for multiple attempts
    confidence -= (data.attemptCount - 1) * 15;
    
    // Reduce confidence for long response times
    if (data.timeSpent > 60) confidence -= 10;
    if (data.timeSpent > 120) confidence -= 20;
    
    // Adjust based on correctness
    if (!data.isCorrect) confidence -= 30;
    
    return Math.max(0, confidence);
  };

  // Update progress and process learning data
  const updateProgress = async (data) => {
    const progress = getUserProgress();
    const progressKey = `${data.moduleId}-${data.lessonId}`;
    
    // Update progress data
    progress[progressKey] = {
      ...progress[progressKey],
      completed: data.isCorrect,
      lastAttempt: Date.now(),
      attempts: (progress[progressKey]?.attempts || 0) + 1
    };
    
    // Process learning data
    const learningMetrics = await processLearningData(data);
    
    // Save updated progress
    saveProgress(progress);
    
    return {
      progress,
      learningMetrics
    };
  };

  // Get learning recommendations based on user progress
  const getLearningRecommendations = async () => {
    const progress = getUserProgress();
    const progressArray = Object.entries(progress).map(([key, value]) => ({
      ...value,
      moduleLesson: key
    }));
    
    // Get predictions for recent activities
    const predictions = await Promise.all(
      progressArray
        .filter(p => p.lastAttempt > Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        .map(p => learningModel.predict({
          timeSpent: p.timeSpent,
          attemptCount: p.attempts,
          correctAnswers: p.completed ? 1 : 0,
          totalQuestions: 1,
          averageResponseTime: p.timeSpent / p.attempts,
          helpRequestCount: p.helpRequests || 0,
          revisitCount: p.revisits || 0,
          completionRate: p.completed ? 1 : 0,
          engagementScore: calculateEngagementScore(p),
          difficultyRating: calculateDifficultyRating(p),
          confidenceScore: calculateConfidenceScore(p)
        }))
    );
    
    // Analyze predictions and generate recommendations
    return predictions.map((prediction, index) => ({
      moduleLesson: progressArray[index].moduleLesson,
      needsReview: prediction.retention < 0.7,
      readyForAdvanced: prediction.comprehension > 0.8,
      engagementTip: prediction.engagement < 0.6 ? 'Try interactive exercises' : null
    }));
  };

  return {
    updateProgress,
    getUserProgress,
    getLearningRecommendations
  };
};

export default useUserProgress;
