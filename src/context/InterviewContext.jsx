// // context/InterviewContext.jsx
// import { createContext, useState, useContext } from 'react';

// const InterviewContext = createContext();
// const API_BASE_URL = 'http://127.0.0.1:8080';

// export function useInterview() {
//   return useContext(InterviewContext);
// }

// export function InterviewProvider({ children }) {
//   const [jobTitle, setJobTitle] = useState('');
//   const [interviewHistory, setInterviewHistory] = useState([]);
//   const [currentQuestion, setCurrentQuestion] = useState('');
//   const [assessment, setAssessment] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [interviewComplete, setInterviewComplete] = useState(false);
//   const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
  
//   // Start a new interview
//   const startInterview = async (title) => {
//     setIsLoading(true);
//     setError(null);
//     setJobTitle(title);
//     setInterviewHistory([]);
//     setAssessment(null);
//     setInterviewComplete(false);
//     setCurrentQuestionNumber(1);
    
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/start`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ job_title: title }),
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to start interview');
//       }
      
//       const data = await response.json();
//       setCurrentQuestion(data.question);
//       setIsLoading(false);
//     } catch (err) {
//       setError(err.message);
//       setIsLoading(false);
//     }
//   };
  
//   // Submit an answer and get the next question
//   const submitAnswer = async (answer) => {
//     if (isLoading) return;
    
//     setIsLoading(true);
//     setError(null);
    
//     // Add current Q&A to history
//     const updatedHistory = [
//       ...interviewHistory,
//       { question: currentQuestion, answer }
//     ];
//     setInterviewHistory(updatedHistory);
    
//     // If we've reached the end of the interview
//     if (currentQuestionNumber >= 5) {
//       await evaluateInterview(updatedHistory);
//       return;
//     }
    
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/question`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           job_title: jobTitle,
//           history: updatedHistory,
//           qnum: currentQuestionNumber + 1
//         }),
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to get next question');
//       }
      
//       const data = await response.json();
//       setCurrentQuestion(data.question);
//       setCurrentQuestionNumber(prev => prev + 1);
//       setIsLoading(false);
//     } catch (err) {
//       setError(err.message);
//       setIsLoading(false);
//     }
//   };
  
//   // Evaluate the interview
//   const evaluateInterview = async (history) => {
//     setIsLoading(true);
//     setError(null);
    
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/evaluate`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           job_title: jobTitle,
//           history: history || interviewHistory,
//         }),
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to evaluate interview');
//       }
      
//       const data = await response.json();
//       setAssessment(data.assessment);
//       setInterviewComplete(true);
//       setIsLoading(false);
//     } catch (err) {
//       setError(err.message);
//       setIsLoading(false);
//     }
//   };
  
//   const value = {
//     jobTitle,
//     interviewHistory,
//     currentQuestion,
//     assessment,
//     isLoading,
//     error,
//     interviewComplete,
//     currentQuestionNumber,
//     startInterview,
//     submitAnswer,
//     evaluateInterview,
//   };
  
//   return (
//     <InterviewContext.Provider value={value}>
//       {children}
//     </InterviewContext.Provider>
//   );
// }


// Without the visual alerts


// import React, {
//   createContext,
//   useState,
//   useContext,
//   useEffect,
//   useRef
// } from 'react';

// const InterviewContext = createContext();
// const API_BASE_URL = 'http://127.0.0.1:8080';

// export function useInterview() {
//   return useContext(InterviewContext);
// }

// export function InterviewProvider({ children }) {
//   // Q&A state
//   const [jobTitle, setJobTitle]                 = useState('');
//   const [interviewHistory, setInterviewHistory] = useState([]);
//   const [currentQuestion, setCurrentQuestion]   = useState('');
//   const [assessment, setAssessment]             = useState(null);
//   const [isLoading, setIsLoading]               = useState(false);
//   const [error, setError]                       = useState(null);
//   const [interviewComplete, setInterviewComplete] = useState(false);
//   const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);

//   // Proctor state
//   const [warnings, setWarnings]           = useState(0);
//   const [lastReason, setLastReason]       = useState('');
//   const [testStopped, setTestStopped]     = useState(false);
//   const [proctorSession, setProctorSession] = useState(null);

//   // keep track so we only play sound when warnings increments
//   const prevWarningsRef = useRef(0);

//   // 1) Fire up proctor
//   const startProctor = async () => {
//     const res  = await fetch(`${API_BASE_URL}/start_proctor`, { method:'POST' });
//     const json = await res.json();
//     setProctorSession(json.sessionId);
//     return json.sessionId;
//   };

//   // 2) Poll proctor status every second
//   useEffect(() => {
//     if (!proctorSession) return;
//     const iv = setInterval(async () => {
//       const s = await fetch(
//         `${API_BASE_URL}/status_proctor?sessionId=${proctorSession}`
//       ).then(r => r.json());
//       setWarnings(s.warnings);
//       setLastReason(s.reason);
//       setTestStopped(s.stopped);
//     }, 1000);
//     return () => clearInterval(iv);
//   }, [proctorSession]);

//   // 3) Play beep + TTS when a new warning arrives
//   useEffect(() => {
//     if (warnings > prevWarningsRef.current) {
//       // beep
//       const audioCtx = new (window.AudioContext||window.webkitAudioContext)();
//       const osc = audioCtx.createOscillator();
//       osc.type = 'sine';
//       osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
//       osc.connect(audioCtx.destination);
//       osc.start(); osc.stop(audioCtx.currentTime + 0.2);
//       // TTS
//       const u = new SpeechSynthesisUtterance(`Warning: ${lastReason}`);
//       speechSynthesis.speak(u);
//     }
//     prevWarningsRef.current = warnings;
//   }, [warnings, lastReason]);

//   // 4) Listen for blur/visibility and log to server
//   useEffect(() => {
//     if (!proctorSession) return;
//     const sendLog = async (event) => {
//       await fetch(`${API_BASE_URL}/log_event`, {
//         method:'POST',
//         headers: {'Content-Type':'application/json'},
//         body: JSON.stringify({ event })
//       });
//     };
//     const onBlur = () => sendLog('blur');
//     const onVis  = () => { if (document.hidden) sendLog('visibility_hidden'); };

//     window.addEventListener('blur', onBlur);
//     document.addEventListener('visibilitychange', onVis);
//     return () => {
//       window.removeEventListener('blur', onBlur);
//       document.removeEventListener('visibilitychange', onVis);
//     };
//   }, [proctorSession]);

//   // 5) Start Interview = Q&A + Proctor
//   const startInterview = async (title) => {
//     setIsLoading(true);
//     setError(null);
//     setJobTitle(title);
//     setInterviewHistory([]);
//     setAssessment(null);
//     setInterviewComplete(false);
//     setCurrentQuestionNumber(1);

//     try {
//       // Q&A
//       const resp = await fetch(`${API_BASE_URL}/api/start`, {
//         method:'POST',
//         headers:{'Content-Type':'application/json'},
//         body: JSON.stringify({ job_title: title })
//       });
//       if (!resp.ok) throw new Error('Failed to start interview');
//       const data = await resp.json();
//       setCurrentQuestion(data.question);

//       // Proctor
//       await startProctor();

//       setIsLoading(false);
//     } catch (err) {
//       setError(err.message);
//       setIsLoading(false);
//     }
//   };

//   // 6) Submit answer → next question or evaluate
//   const submitAnswer = async (answer) => {
//     if (isLoading) return;
//     setIsLoading(true);
//     setError(null);

//     const updatedHistory = [
//       ...interviewHistory,
//       { question: currentQuestion, answer }
//     ];
//     setInterviewHistory(updatedHistory);

//     if (currentQuestionNumber >= 5) {
//       // final
//       const resp = await fetch(`${API_BASE_URL}/api/evaluate`, {
//         method:'POST',
//         headers:{'Content-Type':'application/json'},
//         body: JSON.stringify({
//           job_title: jobTitle,
//           history: updatedHistory
//         })
//       });
//       if (!resp.ok) throw new Error('Failed to evaluate');
//       const { assessment } = await resp.json();
//       setAssessment(assessment);
//       setInterviewComplete(true);
//       setIsLoading(false);
//       return;
//     }

//     // else next question
//     try {
//       const resp = await fetch(`${API_BASE_URL}/api/question`, {
//         method:'POST',
//         headers:{'Content-Type':'application/json'},
//         body: JSON.stringify({
//           job_title: jobTitle,
//           history: updatedHistory,
//           qnum: currentQuestionNumber + 1
//         })
//       });
//       if (!resp.ok) throw new Error('Failed to get next question');
//       const { question } = await resp.json();
//       setCurrentQuestion(question);
//       setCurrentQuestionNumber(n => n + 1);
//       setIsLoading(false);
//     } catch (err) {
//       setError(err.message);
//       setIsLoading(false);
//     }
//   };

//   return (
//     <InterviewContext.Provider value={{
//       jobTitle,
//       currentQuestion,
//       currentQuestionNumber,
//       interviewHistory,
//       assessment,
//       isLoading,
//       error,
//       interviewComplete,
//       warnings,
//       testStopped,
//       startInterview,
//       submitAnswer
//     }}>
//       {children}
//     </InterviewContext.Provider>
//   );
// }


// import React, {
//   createContext,
//   useState,
//   useContext,
//   useEffect,
//   useRef
// } from 'react';

// const InterviewContext = createContext();
// const API_BASE_URL = 'http://127.0.0.1:8080';

// export function useInterview() {
//   return useContext(InterviewContext);
// }

// export function InterviewProvider({ children }) {
//   // ─── Q&A state ────────────────────────────────────────────────────────────
//   const [jobTitle, setJobTitle]                       = useState('');
//   const [interviewHistory, setInterviewHistory]       = useState([]);
//   const [currentQuestion, setCurrentQuestion]         = useState('');
//   const [assessment, setAssessment]                   = useState(null);
//   const [isLoading, setIsLoading]                     = useState(false);
//   const [error, setError]                             = useState(null);
//   const [interviewComplete, setInterviewComplete]     = useState(false);
//   const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);

//   // ─── Proctor state ─────────────────────────────────────────────────────────
//   const [warnings, setWarnings]           = useState(0);
//   const [lastReason, setLastReason]       = useState('');
//   const [testStopped, setTestStopped]     = useState(false);
//   const [proctorSession, setProctorSession] = useState(null);

//   // store previous warnings count to detect increments
//   const prevWarnRef = useRef(0);

//   // ─── 1) Kick off proctor loop ─────────────────────────────────────────────
//   const startProctor = async () => {
//     const res  = await fetch(`${API_BASE_URL}/start_proctor`, { method: 'POST' });
//     const json = await res.json();
//     setProctorSession(json.sessionId);
//     return json.sessionId;
//   };

//   // ─── 2) Poll for proctor status every second ──────────────────────────────
//   useEffect(() => {
//     if (!proctorSession) return;
//     const iv = setInterval(async () => {
//       const s = await fetch(
//         `${API_BASE_URL}/status_proctor?sessionId=${proctorSession}`
//       ).then(r => r.json());
//       setWarnings(s.warnings);
//       setLastReason(s.reason);
//       setTestStopped(s.stopped);
//     }, 1000);
//     return () => clearInterval(iv);
//   }, [proctorSession]);

//   // ─── 3) Log blur/tab events to backend ────────────────────────────────────
//   useEffect(() => {
//     if (!proctorSession) return;
//     const sendLog = async (event) => {
//       await fetch(`${API_BASE_URL}/log_event`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ event })
//       });
//     };
//     const onBlur = () => sendLog('blur');
//     const onVis  = () => { if (document.hidden) sendLog('visibility_hidden'); };
//     window.addEventListener('blur', onBlur);
//     document.addEventListener('visibilitychange', onVis);
//     return () => {
//       window.removeEventListener('blur', onBlur);
//       document.removeEventListener('visibilitychange', onVis);
//     };
//   }, [proctorSession]);

//   // ─── 4) Start Interview = Q&A + Proctor ───────────────────────────────────
//   const startInterview = async (title) => {
//     setIsLoading(true);
//     setError(null);
//     setJobTitle(title);
//     setInterviewHistory([]);
//     setAssessment(null);
//     setInterviewComplete(false);
//     setCurrentQuestionNumber(1);

//     try {
//       // 4a) Gemini Q&A
//       const resp = await fetch(`${API_BASE_URL}/api/start`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ job_title: title })
//       });
//       if (!resp.ok) throw new Error('Failed to start interview');
//       const { question } = await resp.json();
//       setCurrentQuestion(question);

//       // 4b) Proctor loop
//       await startProctor();
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ─── 5) Submit Answer → Next Q or Final Evaluate ─────────────────────────
//   const submitAnswer = async (answer) => {
//     if (isLoading) return;
//     setIsLoading(true);
//     setError(null);

//     const updated = [
//       ...interviewHistory,
//       { question: currentQuestion, answer }
//     ];
//     setInterviewHistory(updated);

//     // Final after 5 Qs
//     if (currentQuestionNumber >= 5) {
//       try {
//         const resp = await fetch(`${API_BASE_URL}/api/evaluate`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ job_title: jobTitle, history: updated })
//         });
//         if (!resp.ok) throw new Error('Failed to evaluate');
//         const { assessment } = await resp.json();
//         setAssessment(assessment);
//         setInterviewComplete(true);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setIsLoading(false);
//       }
//       return;
//     }

//     // Else next question
//     try {
//       const resp = await fetch(`${API_BASE_URL}/api/question`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           job_title: jobTitle,
//           history: updated,
//           qnum: currentQuestionNumber + 1
//         })
//       });
//       if (!resp.ok) throw new Error('Failed to get next question');
//       const { question } = await resp.json();
//       setCurrentQuestion(question);
//       setCurrentQuestionNumber(n => n + 1);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <InterviewContext.Provider value={{
//       jobTitle,
//       currentQuestion,
//       currentQuestionNumber,
//       interviewHistory,
//       assessment,
//       isLoading,
//       error,
//       interviewComplete,
//       warnings,
//       lastReason,
//       testStopped,
//       startInterview,
//       submitAnswer
//     }}>
//       {children}
//     </InterviewContext.Provider>
//   );
// }


// With visusal alerts

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef
} from 'react';

const InterviewContext = createContext();
const API_BASE_URL = 'http://127.0.0.1:8080';

export function useInterview() {
  return useContext(InterviewContext);
}

export function InterviewProvider({ children }) {
  // ─── Q&A state ────────────────────────────────────────────────────────────
  const [jobTitle, setJobTitle]                       = useState('');
  const [interviewHistory, setInterviewHistory]       = useState([]);
  const [currentQuestion, setCurrentQuestion]         = useState('');
  const [assessment, setAssessment]                   = useState(null);
  const [isLoading, setIsLoading]                     = useState(false);
  const [error, setError]                             = useState(null);
  const [interviewComplete, setInterviewComplete]     = useState(false);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);

  // ─── Proctor state ─────────────────────────────────────────────────────────
  const [warnings, setWarnings]           = useState(0);
  const [lastReason, setLastReason]       = useState('');
  const [testStopped, setTestStopped]     = useState(false);
  const [proctorSession, setProctorSession] = useState(null);

  // ─── Visual banner alert ───────────────────────────────────────────────────
  const [visualAlert, setVisualAlert] = useState('');
  const visualTimeoutRef = useRef(null);

  // to detect when warnings increments
  const prevWarningsRef = useRef(0);

  // ─── 1) Start proctoring loop ──────────────────────────────────────────────
  const startProctor = async () => {
    const res  = await fetch(`${API_BASE_URL}/start_proctor`, { method: 'POST' });
    const json = await res.json();
    setProctorSession(json.sessionId);
    return json.sessionId;
  };

  // ─── 2) Poll proctor status every second ──────────────────────────────────
  useEffect(() => {
    if (!proctorSession) return;
    const iv = setInterval(async () => {
      const s = await fetch(
        `${API_BASE_URL}/status_proctor?sessionId=${proctorSession}`
      ).then(r => r.json());
      setWarnings(s.warnings);
      setLastReason(s.reason);
      setTestStopped(s.stopped);
    }, 1000);
    return () => clearInterval(iv);
  }, [proctorSession]);

  // ─── 3) On new warning: beep + TTS + visual banner ────────────────────────
  useEffect(() => {
    if (warnings > prevWarningsRef.current) {
      // audio beep
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
      osc.connect(audioCtx.destination);
      osc.start(); osc.stop(audioCtx.currentTime + 0.2);

      // TTS
      const utter = new SpeechSynthesisUtterance(`Warning: ${lastReason}`);
      speechSynthesis.speak(utter);

      // show visual banner
      setVisualAlert(lastReason);
      clearTimeout(visualTimeoutRef.current);
      visualTimeoutRef.current = setTimeout(() => {
        setVisualAlert('');
      }, 3000);
    }
    prevWarningsRef.current = warnings;
    return () => clearTimeout(visualTimeoutRef.current);
  }, [warnings, lastReason]);

  // ─── 4) Listen for blur/visibility events ──────────────────────────────────
  useEffect(() => {
    if (!proctorSession) return;
    const sendLog = async (event) => {
      await fetch(`${API_BASE_URL}/log_event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event })
      });
    };
    const onBlur = () => sendLog('blur');
    const onVis  = () => { if (document.hidden) sendLog('visibility_hidden'); };

    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [proctorSession]);

  // ─── 5) Start Interview = Q&A + Proctor ───────────────────────────────────
  const startInterview = async (title) => {
    setIsLoading(true);
    setError(null);
    setJobTitle(title);
    setInterviewHistory([]);
    setAssessment(null);
    setInterviewComplete(false);
    setCurrentQuestionNumber(1);

    try {
      // Q&A start
      const resp = await fetch(`${API_BASE_URL}/api/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_title: title })
      });
      if (!resp.ok) throw new Error('Failed to start interview');
      const data = await resp.json();
      setCurrentQuestion(data.question);

      // Proctor start
      await startProctor();
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  // ─── 6) Submit Answer → Next Question or Evaluation ──────────────────────
  const submitAnswer = async (answer) => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    const updatedHistory = [
      ...interviewHistory,
      { question: currentQuestion, answer }
    ];
    setInterviewHistory(updatedHistory);

    // final evaluate after 5 Qs
    if (currentQuestionNumber >= 5) {
      try {
        const resp = await fetch(`${API_BASE_URL}/api/evaluate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            job_title: jobTitle,
            history: updatedHistory
          })
        });
        if (!resp.ok) throw new Error('Failed to evaluate');
        const { assessment } = await resp.json();
        setAssessment(assessment);
        setInterviewComplete(true);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // otherwise get next question
    try {
      const resp = await fetch(`${API_BASE_URL}/api/question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_title: jobTitle,
          history: updatedHistory,
          qnum: currentQuestionNumber + 1
        })
      });
      if (!resp.ok) throw new Error('Failed to get next question');
      const { question } = await resp.json();
      setCurrentQuestion(question);
      setCurrentQuestionNumber(n => n + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <InterviewContext.Provider value={{
      jobTitle,
      currentQuestion,
      currentQuestionNumber,
      interviewHistory,
      assessment,
      isLoading,
      error,
      interviewComplete,
      warnings,
      lastReason,
      testStopped,
      visualAlert,
      startInterview,
      submitAnswer
    }}>
      {children}
    </InterviewContext.Provider>
  );
}
