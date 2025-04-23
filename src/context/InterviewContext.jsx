// context/InterviewContext.jsx
import { createContext, useState, useContext } from 'react';

const InterviewContext = createContext();
const API_BASE_URL = 'http://127.0.0.1:8080';

export function useInterview() {
  return useContext(InterviewContext);
}

export function InterviewProvider({ children }) {
  const [jobTitle, setJobTitle] = useState('');
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [assessment, setAssessment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
  
  // Start a new interview
  const startInterview = async (title) => {
    setIsLoading(true);
    setError(null);
    setJobTitle(title);
    setInterviewHistory([]);
    setAssessment(null);
    setInterviewComplete(false);
    setCurrentQuestionNumber(1);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ job_title: title }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to start interview');
      }
      
      const data = await response.json();
      setCurrentQuestion(data.question);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };
  
  // Submit an answer and get the next question
  const submitAnswer = async (answer) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    // Add current Q&A to history
    const updatedHistory = [
      ...interviewHistory,
      { question: currentQuestion, answer }
    ];
    setInterviewHistory(updatedHistory);
    
    // If we've reached the end of the interview
    if (currentQuestionNumber >= 5) {
      await evaluateInterview(updatedHistory);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_title: jobTitle,
          history: updatedHistory,
          qnum: currentQuestionNumber + 1
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get next question');
      }
      
      const data = await response.json();
      setCurrentQuestion(data.question);
      setCurrentQuestionNumber(prev => prev + 1);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };
  
  // Evaluate the interview
  const evaluateInterview = async (history) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_title: jobTitle,
          history: history || interviewHistory,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to evaluate interview');
      }
      
      const data = await response.json();
      setAssessment(data.assessment);
      setInterviewComplete(true);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };
  
  const value = {
    jobTitle,
    interviewHistory,
    currentQuestion,
    assessment,
    isLoading,
    error,
    interviewComplete,
    currentQuestionNumber,
    startInterview,
    submitAnswer,
    evaluateInterview,
  };
  
  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
}