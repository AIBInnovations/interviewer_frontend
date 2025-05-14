import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterview } from '../context/InterviewContext';

const API_BASE_URL = 'http://127.0.0.1:8080';

// Separate component for video feed to isolate it from the rest of the component
const ProctoringVideo = ({ onError }) => {
  const [frameUrl, setFrameUrl] = useState('');
  const frameRef = useRef(null);
  const frameTimerRef = useRef(null);
  
  // Use static frames instead of streaming video
  useEffect(() => {
    const updateFrame = () => {
      setFrameUrl(`${API_BASE_URL}/latest_frame?t=${Date.now()}`);
    };
    
    // Initial frame
    updateFrame();
    
    // Update frame every 500ms
    frameTimerRef.current = setInterval(updateFrame, 500);
    
    return () => {
      if (frameTimerRef.current) {
        clearInterval(frameTimerRef.current);
      }
    };
  }, []);
  
  return (
    <img 
      src={frameUrl}
      alt="Proctor feed"
      className="w-full h-full object-contain"
      onError={onError}
      ref={frameRef}
    />
  );
};

export default function Interview() {
  const {
    jobTitle,
    currentQuestion,
    currentQuestionNumber,
    isLoading,
    interviewComplete,
    submitAnswer,
    error,
    warnings,
    lastReason,
    testStopped,
    visualAlert,
    setTestStopped
  } = useInterview();

  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [sessionId, setSessionId] = useState(null);
  const [localWarnings, setLocalWarnings] = useState(0);
  const [localLastReason, setLocalLastReason] = useState(null);
  const [localTestStopped, setLocalTestStopped] = useState(false);
  const [detectionActive, setDetectionActive] = useState(true);
  const [showWarningOverlay, setShowWarningOverlay] = useState(false);

  const recognitionRef = useRef(null);
  const speechRef = useRef(window.speechSynthesis);
  const timerRef = useRef(null);
  const statusIntervalRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const navigate = useNavigate();
  
  // Initialize session
  useEffect(() => {
    console.log("Starting proctoring session...");
    
    fetch(`${API_BASE_URL}/start_proctor`, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(r => r.json())
      .then(data => {
        console.log("Proctor session started:", data);
        setSessionId(data.sessionId);
      })
      .catch(err => {
        console.error("Error starting proctor:", err);
        // Retry after delay
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      });
    
    return () => {
      // Cleanup
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, []);
  
  // Set up separate status polling
  useEffect(() => {
    if (!sessionId || !detectionActive) return;
    
    console.log("Setting up status polling...");
    
    const checkStatus = () => {
      fetch(`${API_BASE_URL}/status_proctor`)
        .then(r => r.json())
        .then(data => {
          // Only log when there are changes
          if (data.warnings !== localWarnings || data.reason !== localLastReason) {
            console.log("Status update:", data);
          }
          
          // Update warnings count
          setLocalWarnings(data.warnings);
          
          // Handle warning reason
          if (data.reason && data.reason !== localLastReason) {
            console.log("New warning detected:", data.reason);
            setLocalLastReason(data.reason);
            
            // Show warning overlay for 3 seconds
            setShowWarningOverlay(true);
            
            if (warningTimeoutRef.current) {
              clearTimeout(warningTimeoutRef.current);
            }
            
            warningTimeoutRef.current = setTimeout(() => {
              setShowWarningOverlay(false);
            }, 3000);
          } else if (!data.reason && localLastReason) {
            // Clear warning after 5 seconds if no longer present
            setTimeout(() => {
              setLocalLastReason(null);
            }, 5000);
          }
          
          // Handle test stopped
          if (data.stopped) {
            setLocalTestStopped(true);
            setTestStopped(true);
          }
        })
        .catch(err => {
          console.error("Error checking status:", err);
        });
    };
    
    // Check immediately
    checkStatus();
    
    // Then set up interval
    statusIntervalRef.current = setInterval(checkStatus, 1000);
    
    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
    };
  }, [sessionId, detectionActive, localWarnings, localLastReason, setTestStopped]);

  // Handle video errors
  const handleVideoError = () => {
    console.error("Video feed error encountered");
  };
  
  // Navigate away if needed
  useEffect(() => {
    if (!jobTitle) navigate('/');
    if (interviewComplete) navigate('/results');
  }, [jobTitle, interviewComplete, navigate]);

  // Speak question aloud
  useEffect(() => {
    if (!currentQuestion) return;
    speechRef.current.cancel();
    const utter = new SpeechSynthesisUtterance(currentQuestion);
    utter.rate = 1.0; utter.pitch = 1.0;
    speechRef.current.speak(utter);
  }, [currentQuestion]);

  // Recording timer
  useEffect(() => {
    if (isRecording && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (isRecording && timeLeft === 0) {
      setIsRecording(false);
      recognitionRef.current?.stop();
    }
    return () => clearTimeout(timerRef.current);
  }, [isRecording, timeLeft]);

  // Browser visibility change handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.log("Tab visibility changed to hidden");
        
        fetch(`${API_BASE_URL}/log_event`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'visibility_hidden' }),
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log("Visibility event logged");
          
          // Check status immediately after logging event
          return fetch(`${API_BASE_URL}/status_proctor`);
        })
        .then(response => response.json())
        .then(data => {
          setLocalWarnings(data.warnings);
          setLocalLastReason(data.reason || "Tab switched");
          
          if (data.stopped) {
            setLocalTestStopped(true);
            setTestStopped(true);
          }
        })
        .catch(err => {
          console.error("Error with visibility event:", err);
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setTestStopped]);

  // Manual status refresh
  const refreshStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/status_proctor`);
      const data = await response.json();
      console.log("Manual status refresh:", data);
      
      setLocalWarnings(data.warnings);
      setLocalLastReason(data.reason);
      
      if (data.stopped) {
        setLocalTestStopped(true);
        setTestStopped(true);
      }
    } catch (err) {
      console.error("Error refreshing status:", err);
    }
  };

  // Speech recognition
  const handleStartRecording = () => {
    setIsRecording(true);
    setTimeLeft(60);
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return console.error('SpeechRecognition not supported');
    
    const rec = new SR();
    recognitionRef.current = rec;
    rec.continuous = true;
    rec.interimResults = true;
    
    rec.onresult = e => {
      let interim = '', final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      setAnswer(final || interim);
    };
    
    rec.onend = () => { 
      if (isRecording) rec.start(); 
    };
    
    rec.start();
  };

  // Answer submission
  const handleSubmit = e => {
    e.preventDefault();
    if (!answer.trim()) return;
    submitAnswer(answer);
    setAnswer('');
  };

  const formatTime = secs => {
    const m = Math.floor(secs / 60), s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Test stopped screen
  if (testStopped || localTestStopped) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-red-600 mb-4">
            Test stopped after 5 warnings
          </h2>
          <p className="text-gray-700">
            Last warning: {lastReason || localLastReason || "Multiple violations detected"}
          </p>
        </div>
      </div>
    );
  }

  // Loading screen
  if (isLoading || !currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-lg text-gray-600">Preparing your interview...</p>
      </div>
    );
  }

  return (
    <>
      {/* Warning alert banner */}
      {(visualAlert || localLastReason) && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2
                        bg-red-600 text-white px-4 py-2 rounded shadow-lg
                        z-50 animate-pulse">
          Warning: {visualAlert || localLastReason}
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* — Proctor Feed (laptop webcam) — */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Proctor Camera</h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setDetectionActive(!detectionActive);
                  if (!detectionActive) {
                    refreshStatus();
                  }
                }}
                className={`px-3 py-1 rounded-lg text-white ${detectionActive ? 'bg-indigo-600' : 'bg-gray-400'}`}
              >
                {detectionActive ? 'Detection On' : 'Detection Paused'}
              </button>
              <div className={`px-4 py-2 rounded-lg ${
                !localTestStopped ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
              }`}>
                { !localTestStopped ? 'Recording' : 'Stopped' }
              </div>
            </div>
          </div>
          
          <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '400px' }}>
            {/* Use the separate component for video - this isolates it from re-renders */}
            <ProctoringVideo onError={handleVideoError} />
            
            {/* Warning overlay */}
            {showWarningOverlay && localLastReason && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-red-600 text-white px-6 py-4 rounded-lg text-center">
                  <p className="text-xl font-bold mb-2">Warning Detected</p>
                  <p>{localLastReason}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* — Interview Header — */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{jobTitle} Interview</h1>
          <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
            Q {currentQuestionNumber} of 5
          </span>
        </div>

        {/* — Question Box — */}
        <div className="bg-indigo-50 p-6 rounded-lg relative">
          <div className="absolute top-4 left-4 bg-indigo-600 text-white p-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg"
                 className="h-5 w-5"
                 viewBox="0 0 20 20"
                 fill="currentColor">
              <path fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 
                       1 0 10-2 0v2a1 1 0 002 0V7zm0 4a1 1 0 100-2 1
                       1 0 000 2z"
                    clipRule="evenodd"/>
            </svg>
          </div>
          <div className="ml-8">
            <p className="text-lg font-medium">{currentQuestion}</p>
            <button
              onClick={() => {
                speechRef.current.cancel();
                speechRef.current.speak(new SpeechSynthesisUtterance(currentQuestion));
              }}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
            >
              Read Aloud
            </button>
          </div>
        </div>

        {/* — Answer Form — */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            rows={4}
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="Type your answer or use the mic…"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            disabled={isLoading}
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <button
                type="button"
                onClick={() => {
                  if (isRecording) {
                    recognitionRef.current?.stop();
                    setIsRecording(false);
                  } else {
                    handleStartRecording();
                  }
                }}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg ${
                  isRecording ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {isRecording ? `Stop (${formatTime(timeLeft)})` : 'Record'}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || !answer.trim()}
              className="bg-indigo-600 text-white py-2 px-6 rounded-lg disabled:opacity-50"
            >
              {isLoading ? 'Processing…' : 'Submit Answer'}
            </button>
          </div>

          {error && <p className="text-red-600">{error}</p>}
        </form>

        {/* — Warnings — */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-red-600 font-semibold">Warnings: {Math.max(warnings, localWarnings)} / 5</p>
          {(lastReason || localLastReason) && 
            <p className="text-gray-600 text-sm">Last warning: {lastReason || localLastReason}</p>
          }
          <button 
            onClick={refreshStatus}
            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
          >
            Refresh Status
          </button>
        </div>
      </div>
    </>
  );
}