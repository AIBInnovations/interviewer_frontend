// // components/Interview.jsx
// import { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useInterview } from '../context/InterviewContext';

// const Interview = () => {
//   const {
//     jobTitle,
//     currentQuestion,
//     currentQuestionNumber,
//     isLoading,
//     interviewComplete,
//     submitAnswer,
//     error
//   } = useInterview();
  
//   const [answer, setAnswer] = useState('');
//   const [isRecording, setIsRecording] = useState(false);
//   const [timeLeft, setTimeLeft] = useState(60);
//   const [isMicAvailable, setIsMicAvailable] = useState(null);
//   const [isReading, setIsReading] = useState(false);
//   const [transcript, setTranscript] = useState('');
  
//   const navigate = useNavigate();
//   const timerRef = useRef(null);
//   const speechRef = useRef(null);
//   const recognitionRef = useRef(null);
  
//   // Check if we have a job title and redirect if not
//   useEffect(() => {
//     if (!jobTitle) {
//       navigate('/');
//     }
    
//     // Check for SpeechRecognition and speech synthesis availability
//     if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
//       navigator.mediaDevices.getUserMedia({ audio: true })
//         .then(() => setIsMicAvailable(true))
//         .catch(() => setIsMicAvailable(false));
//     } else {
//       setIsMicAvailable(false);
//     }
    
//     // Initialize speech synthesis
//     speechRef.current = window.speechSynthesis;
    
//     // Redirect to results if interview is complete
//     if (interviewComplete) {
//       navigate('/results');
//     }
    
//     return () => {
//       // Clean up speech synthesis on unmount
//       if (speechRef.current && speechRef.current.speaking) {
//         speechRef.current.cancel();
//       }
//       // Clean up speech recognition on unmount
//       if (recognitionRef.current) {
//         recognitionRef.current.stop();
//       }
//     };
//   }, [jobTitle, navigate, interviewComplete]);
  
//   // Read question aloud when it changes
//   useEffect(() => {
//     if (currentQuestion && !isLoading) {
//       readQuestionAloud(currentQuestion);
//     }
//   }, [currentQuestion, isLoading]);
  
//   // Handle timer for recording
//   useEffect(() => {
//     if (isRecording && timeLeft > 0) {
//       timerRef.current = setTimeout(() => {
//         setTimeLeft(prev => prev - 1);
//       }, 1000);
//     } else if (isRecording && timeLeft === 0) {
//       handleStopRecording();
//     }
    
//     return () => {
//       if (timerRef.current) {
//         clearTimeout(timerRef.current);
//       }
//     };
//   }, [isRecording, timeLeft]);
  
//   const readQuestionAloud = (question) => {
//     if (speechRef.current) {
//       // Cancel any ongoing speech
//       if (speechRef.current.speaking) {
//         speechRef.current.cancel();
//       }
      
//       // Create a new utterance
//       const utterance = new SpeechSynthesisUtterance(question);
//       utterance.rate = 1.0;
//       utterance.pitch = 1.0;
      
//       // Set event handlers
//       utterance.onstart = () => setIsReading(true);
//       utterance.onend = () => setIsReading(false);
//       utterance.onerror = () => setIsReading(false);
      
//       // Speak the question
//       speechRef.current.speak(utterance);
//     }
//   };
  
//   const handleStartRecording = () => {
//     setIsRecording(true);
//     setTimeLeft(60);
    
//     try {
//       // Initialize speech recognition
//       const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//       if (SpeechRecognition) {
//         recognitionRef.current = new SpeechRecognition();
//         recognitionRef.current.continuous = true;
//         recognitionRef.current.interimResults = true;
        
//         recognitionRef.current.onresult = (event) => {
//           let interimTranscript = '';
//           let finalTranscript = '';
          
//           for (let i = event.resultIndex; i < event.results.length; i++) {
//             const transcript = event.results[i][0].transcript;
//             if (event.results[i].isFinal) {
//               finalTranscript += transcript;
//             } else {
//               interimTranscript += transcript;
//             }
//           }
          
//           const currentTranscript = finalTranscript || interimTranscript;
//           setTranscript(currentTranscript);
//           setAnswer(currentTranscript);
//         };
        
//         recognitionRef.current.onend = () => {
//           if (isRecording) {
//             // Restart if we're still supposed to be recording
//             recognitionRef.current.start();
//           }
//         };
        
//         recognitionRef.current.start();
//       } else {
//         console.error('Speech recognition not supported');
//       }
//     } catch (error) {
//       console.error('Error starting speech recognition:', error);
//     }
//   };
  
//   const handleStopRecording = () => {
//     setIsRecording(false);
    
//     if (recognitionRef.current) {
//       recognitionRef.current.stop();
//     }
//   };
  
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!answer.trim()) return;
    
//     submitAnswer(answer);
//     setAnswer('');
//     setTranscript('');
//   };
  
//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
//   };
  
//   // Loading state or no question yet
//   if (isLoading || !currentQuestion) {
//     return (
//       <div className="flex flex-col items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
//         <p className="text-lg text-gray-600">Preparing your interview...</p>
//       </div>
//     );
//   }
  
//   return (
//     <div className="max-w-4xl mx-auto">
//       <div className="bg-white rounded-lg shadow-md p-6 mb-8">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold text-gray-800">
//             {jobTitle} Interview
//           </h1>
//           <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-medium">
//             Question {currentQuestionNumber} of 5
//           </span>
//         </div>
        
//         <div className="bg-indigo-50 p-6 rounded-lg mb-8 relative">
//           <div className="absolute top-4 left-4 bg-indigo-600 text-white p-1 rounded-full">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//               <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
//             </svg>
//           </div>
//           <div className="ml-8">
//             <p className="text-lg font-medium text-gray-800">{currentQuestion}</p>
//             <div className="mt-2 flex items-center">
//               <button 
//                 onClick={() => readQuestionAloud(currentQuestion)}
//                 disabled={isReading}
//                 className="text-sm flex items-center text-indigo-600 hover:text-indigo-800"
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
//                 </svg>
//                 {isReading ? 'Speaking...' : 'Read Aloud'}
//               </button>
//             </div>
//           </div>
//         </div>
        
//         <form onSubmit={handleSubmit}>
//           <div className="mb-6">
//             <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
//               Your Answer
//             </label>
//             <textarea
//               id="answer"
//               value={answer}
//               onChange={(e) => setAnswer(e.target.value)}
//               className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px]"
//               placeholder="Type your answer here or use the microphone to record..."
//               disabled={isLoading}
//             ></textarea>
//           </div>
          
//           <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
//             <div className="flex items-center space-x-4 w-full sm:w-auto">
//               {isMicAvailable && (
//                 <button
//                   type="button"
//                   onClick={isRecording ? handleStopRecording : handleStartRecording}
//                   disabled={isLoading}
//                   className={`flex items-center px-4 py-2 rounded-lg ${
//                     isRecording 
//                       ? 'bg-red-600 hover:bg-red-700 text-white' 
//                       : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
//                   }`}
//                 >
//                   {isRecording ? (
//                     <>
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
//                         <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
//                       </svg>
//                       Stop ({formatTime(timeLeft)})
//                     </>
//                   ) : (
//                     <>
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
//                         <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
//                       </svg>
//                       Record
//                     </>
//                   )}
//                 </button>
//               )}
              
//               {!isMicAvailable && isMicAvailable !== null && (
//                 <p className="text-sm text-red-600">
//                   Microphone access is required for recording.
//                 </p>
//               )}
//             </div>
            
//             <button
//               type="submit"
//               disabled={isLoading || !answer.trim()}
//               className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg shadow-sm transition duration-300 w-full sm:w-auto disabled:bg-indigo-400 disabled:cursor-not-allowed"
//             >
//               {isLoading ? (
//                 <>
//                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Processing...
//                 </>
//               ) : (
//                 'Submit Answer'
//               )}
//             </button>
//           </div>
//         </form>
        
//         {error && (
//           <div className="mt-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
//             <p>{error}</p>
//           </div>
//         )}
//       </div>
      
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <h2 className="text-xl font-semibold mb-4">Interview Tips</h2>
//         <ul className="space-y-2 text-gray-700">
//           <li className="flex items-start">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
//               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//             </svg>
//             Take your time to think before answering
//           </li>
//           <li className="flex items-start">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
//               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//             </svg>
//             Provide specific examples from your experience
//           </li>
//           <li className="flex items-start">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
//               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//             </svg>
//             Structure your answers using the STAR method (Situation, Task, Action, Result)
//           </li>
//           <li className="flex items-start">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
//               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//             </svg>
//             Show enthusiasm for the role and company
//           </li>
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default Interview;


// // src/components/Interview.jsx
// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useInterview } from '../context/InterviewContext';

// const Interview = () => {
//   const {
//     jobTitle,
//     currentQuestion,
//     currentQuestionNumber,
//     isLoading,
//     interviewComplete,
//     submitAnswer,
//     error,
//     warnings,      // pulled from context
//     testStopped    // pulled from context
//   } = useInterview();
  
//   const [answer, setAnswer]           = useState('');
//   const [isRecording, setIsRecording] = useState(false);
//   const [timeLeft, setTimeLeft]       = useState(60);
//   const [isMicAvailable, setIsMicAvailable] = useState(null);
//   const [isReading, setIsReading]     = useState(false);
//   const [transcript, setTranscript]   = useState('');
  
//   const navigate      = useNavigate();
//   const timerRef      = useRef(null);
//   const speechRef     = useRef(null);
//   const recognitionRef= useRef(null);
  
//   // Redirect / mic‐check / cleanup
//   useEffect(() => {
//     if (!jobTitle) navigate('/');
//     if (interviewComplete) navigate('/results');
    
//     // check mic availability
//     if (navigator.mediaDevices?.getUserMedia) {
//       navigator.mediaDevices.getUserMedia({ audio: true })
//         .then(() => setIsMicAvailable(true))
//         .catch(() => setIsMicAvailable(false));
//     } else {
//       setIsMicAvailable(false);
//     }
    
//     // init TTS
//     speechRef.current = window.speechSynthesis;
    
//     return () => {
//       if (speechRef.current?.speaking) speechRef.current.cancel();
//       if (recognitionRef.current) recognitionRef.current.stop();
//     };
//   }, [jobTitle, interviewComplete, navigate]);
  
//   // Read question aloud
//   useEffect(() => {
//     if (currentQuestion && !isLoading) {
//       const utter = new SpeechSynthesisUtterance(currentQuestion);
//       utter.rate = 1.0; utter.pitch = 1.0;
//       utter.onstart = () => setIsReading(true);
//       utter.onend   = () => setIsReading(false);
//       utter.onerror = () => setIsReading(false);
//       speechRef.current.speak(utter);
//     }
//   }, [currentQuestion, isLoading]);
  
//   // Recording timer
//   useEffect(() => {
//     if (isRecording && timeLeft > 0) {
//       timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
//     } else if (isRecording && timeLeft === 0) {
//       handleStopRecording();
//     }
//     return () => clearTimeout(timerRef.current);
//   }, [isRecording, timeLeft]);
  
//   // If proctor says stop → full‐screen overlay
//   if (testStopped) {
//     return (
//       <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
//         <h2 className="text-3xl font-bold text-red-600">
//           Test stopped after 5 warnings
//         </h2>
//       </div>
//     );
//   }
  
//   // Loading / no question
//   if (isLoading || !currentQuestion) {
//     return (
//       <div className="flex flex-col items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
//         <p className="text-lg text-gray-600">Preparing your interview...</p>
//       </div>
//     );
//   }
  
//   // Recording controls
//   const handleStartRecording = () => {
//     setIsRecording(true);
//     setTimeLeft(60);
//     const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRec) return console.error('SpeechRecognition not supported');
    
//     recognitionRef.current = new SpeechRec();
//     recognitionRef.current.continuous = true;
//     recognitionRef.current.interimResults = true;
    
//     recognitionRef.current.onresult = (e) => {
//       let interim = '', final = '';
//       for (let i = e.resultIndex; i < e.results.length; i++) {
//         const t = e.results[i][0].transcript;
//         if (e.results[i].isFinal) final += t;
//         else interim += t;
//       }
//       const txt = final || interim;
//       setTranscript(txt);
//       setAnswer(txt);
//     };
//     recognitionRef.current.onend = () => {
//       if (isRecording) recognitionRef.current.start();
//     };
//     recognitionRef.current.start();
//   };
  
//   const handleStopRecording = () => {
//     setIsRecording(false);
//     recognitionRef.current?.stop();
//   };
  
//   // Submit
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!answer.trim()) return;
//     submitAnswer(answer);
//     setAnswer('');
//     setTranscript('');
//   };
  
//   const formatTime = (secs) => {
//     const m = Math.floor(secs/60), s = secs % 60;
//     return `${m}:${s<10?'0':''}${s}`;
//   };
  
//   return (
//     <div className="max-w-4xl mx-auto space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold">{jobTitle} Interview</h1>
//         <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
//           Q {currentQuestionNumber} of 5
//         </span>
//       </div>
      
//       {/* Question Box */}
//       <div className="bg-indigo-50 p-6 rounded-lg relative">
//         <div className="absolute top-4 left-4 bg-indigo-600 text-white p-1 rounded-full">
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//             <path fillRule="evenodd"
//               d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
//               clipRule="evenodd"
//             />
//           </svg>
//         </div>
//         <div className="ml-8">
//           <p className="text-lg font-medium">{currentQuestion}</p>
//           <button
//             onClick={() => speechRef.current.speaking || speechRef.current.speak(new SpeechSynthesisUtterance(currentQuestion))}
//             disabled={isReading}
//             className="mt-2 text-sm flex items-center text-indigo-600 hover:text-indigo-800"
//           >
//             {isReading ? 'Speaking…' : 'Read Aloud'}
//           </button>
//         </div>
//       </div>
      
//       {/* Answer Form */}
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <textarea
//           id="answer"
//           rows={4}
//           className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500"
//           placeholder="Type your answer or use the mic…"
//           value={answer}
//           onChange={e => setAnswer(e.target.value)}
//           disabled={isLoading}
//         />
        
//         {/* Mic + Submit */}
//         <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
//           <div className="flex items-center space-x-4">
//             {isMicAvailable && (
//               <button
//                 type="button"
//                 onClick={isRecording ? handleStopRecording : handleStartRecording}
//                 disabled={isLoading}
//                 className={`px-4 py-2 rounded-lg ${
//                   isRecording
//                     ? 'bg-red-600 text-white'
//                     : 'bg-gray-100 text-gray-800'
//                 }`}
//               >
//                 {isRecording ? `Stop (${formatTime(timeLeft)})` : 'Record'}
//               </button>
//             )}
//             {isMicAvailable === false && (
//               <p className="text-sm text-red-600">
//                 Microphone access required
//               </p>
//             )}
//           </div>
          
//           <button
//             type="submit"
//             disabled={isLoading || !answer.trim()}
//             className="bg-indigo-600 text-white py-2 px-6 rounded-lg disabled:opacity-50"
//           >
//             {isLoading ? 'Processing…' : 'Submit Answer'}
//           </button>
//         </div>
        
//         {error && <p className="text-red-600">{error}</p>}
//       </form>
      
//       {/* Warnings Display */}
//       <p className="text-red-600 font-semibold">
//         Warnings: {warnings} / 5
//       </p>
      
//       {/* Optional Tips Section… */}
//     </div>
//   );
// };

// export default Interview;


// With the Warning Banner

// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useInterview } from '../context/InterviewContext';

// export default function Interview() {
//   const {
//     jobTitle,
//     currentQuestion,
//     currentQuestionNumber,
//     isLoading,
//     interviewComplete,
//     submitAnswer,
//     error,
//     warnings,
//     lastReason,
//     testStopped,
//     visualAlert
//   } = useInterview();

//   const [answer, setAnswer]           = useState('');
//   const [isRecording, setIsRecording] = useState(false);
//   const [timeLeft, setTimeLeft]       = useState(60);
//   const [isMicAvailable, setIsMicAvailable] = useState(null);
//   const [isReading, setIsReading]     = useState(false);

//   const navigate       = useNavigate();
//   const timerRef       = useRef(null);
//   const speechRef      = useRef(null);
//   const recognitionRef = useRef(null);

//   // Redirect & mic-check
//   useEffect(() => {
//     if (!jobTitle) navigate('/');
//     if (interviewComplete) navigate('/results');

//     if (navigator.mediaDevices?.getUserMedia) {
//       navigator.mediaDevices.getUserMedia({ audio: true })
//         .then(() => setIsMicAvailable(true))
//         .catch(() => setIsMicAvailable(false));
//     } else {
//       setIsMicAvailable(false);
//     }

//     speechRef.current = window.speechSynthesis;
//     return () => {
//       speechRef.current?.speaking && speechRef.current.cancel();
//       recognitionRef.current?.stop();
//     };
//   }, [jobTitle, interviewComplete, navigate]);

//   // Read question aloud
//   useEffect(() => {
//     if (currentQuestion && !isLoading) {
//       const utter = new SpeechSynthesisUtterance(currentQuestion);
//       utter.rate = 1.0; utter.pitch = 1.0;
//       utter.onstart = () => setIsReading(true);
//       utter.onend   = () => setIsReading(false);
//       utter.onerror = () => setIsReading(false);
//       speechRef.current.speak(utter);
//     }
//   }, [currentQuestion, isLoading]);

//   // Recording timer
//   useEffect(() => {
//     if (isRecording && timeLeft > 0) {
//       timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
//     } else if (isRecording && timeLeft === 0) {
//       setIsRecording(false);
//       recognitionRef.current?.stop();
//     }
//     return () => clearTimeout(timerRef.current);
//   }, [isRecording, timeLeft]);

//   // Full-screen stop overlay
//   if (testStopped) {
//     return (
//       <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
//         <h2 className="text-3xl font-bold text-red-600">
//           Test stopped after 5 warnings
//         </h2>
//       </div>
//     );
//   }

//   // Loading state
//   if (isLoading || !currentQuestion) {
//     return (
//       <div className="flex flex-col items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
//         <p className="text-lg text-gray-600">Preparing your interview...</p>
//       </div>
//     );
//   }

//   // Recording handlers
//   const handleStartRecording = () => {
//     setIsRecording(true);
//     setTimeLeft(60);
//     const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRec) return console.error('SpeechRecognition not supported');

//     recognitionRef.current = new SpeechRec();
//     recognitionRef.current.continuous = true;
//     recognitionRef.current.interimResults = true;

//     recognitionRef.current.onresult = (e) => {
//       let interim = '', final = '';
//       for (let i = e.resultIndex; i < e.results.length; i++) {
//         const t = e.results[i][0].transcript;
//         if (e.results[i].isFinal) final += t;
//         else interim += t;
//       }
//       const txt = final || interim;
//       setAnswer(txt);
//     };
//     recognitionRef.current.onend = () => {
//       isRecording && recognitionRef.current.start();
//     };
//     recognitionRef.current.start();
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!answer.trim()) return;
//     submitAnswer(answer);
//     setAnswer('');
//   };

//   // Format mm:ss
//   const formatTime = (secs) => {
//     const m = Math.floor(secs / 60), s = secs % 60;
//     return `${m}:${s < 10 ? '0' : ''}${s}`;
//   };

//   return (
//     <>
//       {/* Visual banner alert */}
//       {visualAlert && (
//         <div className="fixed top-4 left-1/2 transform -translate-x-1/2
//                         bg-red-600 text-white px-4 py-2 rounded shadow-lg
//                         z-50 animate-pulse">
//           Warning: {visualAlert}
//         </div>
//       )}

//       <div className="max-w-4xl mx-auto space-y-6">
//         {/* Header */}
//         <div className="flex justify-between items-center">
//           <h1 className="text-2xl font-bold">{jobTitle} Interview</h1>
//           <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
//             Q {currentQuestionNumber} of 5
//           </span>
//         </div>

//         {/* Question Box */}
//         <div className="bg-indigo-50 p-6 rounded-lg relative">
//           <div className="absolute top-4 left-4 bg-indigo-600 text-white p-1 rounded-full">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//               <path fillRule="evenodd"
//                 d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
//                 clipRule="evenodd"
//               />
//             </svg>
//           </div>
//           <div className="ml-8">
//             <p className="text-lg font-medium">{currentQuestion}</p>
//             <button
//               onClick={() => speechRef.current?.speak(new SpeechSynthesisUtterance(currentQuestion))}
//               disabled={isReading}
//               className="mt-2 text-sm flex items-center text-indigo-600 hover:text-indigo-800"
//             >
//               {isReading ? 'Speaking…' : 'Read Aloud'}
//             </button>
//           </div>
//         </div>

//         {/* Answer Form */}
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <textarea
//             rows={4}
//             className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500"
//             placeholder="Type your answer or use the mic…"
//             value={answer}
//             onChange={e => setAnswer(e.target.value)}
//             disabled={isLoading}
//           />

//           <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
//             <div className="flex items-center space-x-4">
//               {isMicAvailable && (
//                 <button
//                   type="button"
//                   onClick={() => setIsRecording(!isRecording) || (isRecording ? recognitionRef.current?.stop() : handleStartRecording())}
//                   disabled={isLoading}
//                   className={`px-4 py-2 rounded-lg ${
//                     isRecording ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-800'
//                   }`}
//                 >
//                   {isRecording ? `Stop (${formatTime(timeLeft)})` : 'Record'}
//                 </button>
//               )}
//               {isMicAvailable === false && (
//                 <p className="text-sm text-red-600">Microphone access required</p>
//               )}
//             </div>

//             <button
//               type="submit"
//               disabled={isLoading || !answer.trim()}
//               className="bg-indigo-600 text-white py-2 px-6 rounded-lg disabled:opacity-50"
//             >
//               {isLoading ? 'Processing…' : 'Submit Answer'}
//             </button>
//           </div>

//           {error && <p className="text-red-600">{error}</p>}
//         </form>

//         {/* Warnings Counter */}
//         <p className="text-red-600 font-semibold">
//           Warnings: {warnings} / 5
//         </p>
//       </div>
//     </>
//   );
// }


import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterview } from '../context/InterviewContext';

const API_BASE_URL = 'http://127.0.0.1:8080';

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
    testStopped
  } = useInterview();

  // Local UI state
  const [answer, setAnswer]           = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft]       = useState(60);
  const [isMicAvailable, setIsMicAvailable] = useState(null);
  const [isReading, setIsReading]     = useState(false);
  const [toast, setToast]             = useState('');
  const prevWarnRef                   = useRef(0);
  const toastTimeoutRef               = useRef(null);

  // Refs
  const navigate       = useNavigate();
  const speechRef      = useRef(window.speechSynthesis);
  const recognitionRef = useRef(null);
  const timerRef       = useRef(null);

  // Redirect & mic‐check
  useEffect(() => {
    if (!jobTitle) navigate('/');
    if (interviewComplete) navigate('/results');

    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => setIsMicAvailable(true))
        .catch(() => setIsMicAvailable(false));
    } else {
      setIsMicAvailable(false);
    }

    return () => {
      speechRef.current?.speaking && speechRef.current.cancel();
      recognitionRef.current?.stop();
      clearTimeout(toastTimeoutRef.current);
      clearTimeout(timerRef.current);
    };
  }, [jobTitle, interviewComplete, navigate]);

  // Read question aloud
  useEffect(() => {
    if (currentQuestion && !isLoading) {
      const u = new SpeechSynthesisUtterance(currentQuestion);
      u.rate = 1.0; u.pitch = 1.0;
      u.onstart = () => setIsReading(true);
      u.onend   = () => setIsReading(false);
      u.onerror = () => setIsReading(false);
      speechRef.current.speak(u);
    }
  }, [currentQuestion, isLoading]);

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

  // Toast on each new warning
  useEffect(() => {
    if (warnings > prevWarnRef.current) {
      // show toast
      setToast(`Warning: ${lastReason}`);
      // beep
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      osc.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.2);
      // hide after 3s
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => setToast(''), 3000);
    }
    prevWarnRef.current = warnings;
  }, [warnings, lastReason]);

  // Full-screen stop overlay
  if (testStopped) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <h2 className="text-3xl font-bold text-red-600">
          Test stopped after 5 warnings
        </h2>
      </div>
    );
  }

  // Loading
  if (isLoading || !currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4" />
        <p className="text-lg text-gray-600">Preparing your interview…</p>
      </div>
    );
  }

  // Start voice recording
  const handleStartRecording = () => {
    setIsRecording(true);
    setTimeLeft(60);
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return console.error('SpeechRecognition not supported');

    recognitionRef.current = new SR();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.onresult = (e) => {
      let interim = '', final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        e.results[i].isFinal ? (final += t) : (interim += t);
      }
      setAnswer(final || interim);
    };
    recognitionRef.current.onend = () => isRecording && recognitionRef.current.start();
    recognitionRef.current.start();
  };

  // Submit answer
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    submitAnswer(answer);
    setAnswer('');
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60), s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <>
      {/* Toast banner */}
      {toast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2
                        bg-red-600 text-white px-4 py-2 rounded shadow-lg
                        z-50 animate-pulse">
          {toast}
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Camera feed */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Proctor Camera</h2>
          <img
            src={`${API_BASE_URL}/video_feed`}
            alt="Proctor stream"
            className="w-full max-w-md mx-auto rounded border"
          />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{jobTitle} Interview</h1>
          <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
            Q {currentQuestionNumber} / 5
          </span>
        </div>

        {/* Question Box */}
        <div className="bg-indigo-50 p-6 rounded-lg relative">
          <div className="absolute top-4 left-4 bg-indigo-600 text-white p-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-8">
            <p className="text-lg font-medium">{currentQuestion}</p>
            <button
              onClick={() => speechRef.current.speak(new SpeechSynthesisUtterance(currentQuestion))}
              disabled={isReading}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
            >
              {isReading ? 'Speaking…' : 'Read Aloud'}
            </button>
          </div>
        </div>

        {/* Answer Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            rows={4}
            className="w-full border p-3 rounded focus:ring-2 focus:ring-indigo-500"
            placeholder="Type your answer or use the mic…"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            disabled={isLoading}
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Mic */}
            <div className="flex items-center space-x-4">
              {isMicAvailable && (
                <button
                  type="button"
                  onClick={isRecording
                    ? () => { setIsRecording(false); recognitionRef.current?.stop(); }
                    : handleStartRecording}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded ${
                    isRecording ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {isRecording ? `Stop (${formatTime(timeLeft)})` : 'Record'}
                </button>
              )}
              {isMicAvailable === false && (
                <p className="text-sm text-red-600">Microphone required</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !answer.trim()}
              className="bg-indigo-600 text-white py-2 px-6 rounded disabled:opacity-50"
            >
              {isLoading ? 'Processing…' : 'Submit Answer'}
            </button>
          </div>

          {error && <p className="text-red-600">{error}</p>}
        </form>

        {/* Warnings Counter */}
        <p className="text-red-600 font-semibold">
          Warnings: {warnings} / 5
        </p>
      </div>
    </>
  );
}
