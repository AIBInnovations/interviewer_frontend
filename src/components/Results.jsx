// components/Results.jsx
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useInterview } from '../context/InterviewContext';
import ReactMarkdown from 'react-markdown';

const Results = () => {
  const { jobTitle, assessment, interviewHistory, interviewComplete } = useInterview();
  const navigate = useNavigate();
  const [score, setScore] = useState(null);
  const [decision, setDecision] = useState(null);
  const [strengths, setStrengths] = useState([]);
  const [improvements, setImprovements] = useState([]);
  
  useEffect(() => {
    // Redirect if no assessment or interview not complete
    if (!assessment || !interviewComplete) {
      navigate('/');
      return;
    }
    
    // Parse assessment to extract key components
    try {
      // Extract score like "Score: 75/100"
      const scoreMatch = assessment.match(/Score:?\s*(\d+)\/100/i) || 
                         assessment.match(/(\d+)\/100/i);
      if (scoreMatch) {
        setScore(parseInt(scoreMatch[1]));
      }
      
      // Extract decision like "Overall Decision: PASS" or "FAIL"
      const decisionMatch = assessment.match(/Decision:?\s*(\w+)/i) || 
                           assessment.match(/PASS|FAIL/i);
      if (decisionMatch) {
        setDecision(decisionMatch[0].includes('PASS') ? 'PASS' : 'FAIL');
      }
      
      // Extract strengths section
      const strengthsSection = assessment.match(/Key Strengths:[\s\S]*?(?=Areas for Improvement:|$)/i);
      if (strengthsSection) {
        const strengthsList = strengthsSection[0].replace(/Key Strengths:[\s]*/i, '')
          .split(/\n+/)
          .filter(item => item.trim().startsWith('*') || item.trim().startsWith('-'))
          .map(item => item.replace(/^[*-]\s*/, '').trim())
          .filter(Boolean);
        
        setStrengths(strengthsList);
      }
      
      // Extract improvements section
      const improvementsSection = assessment.match(/Areas for Improvement:[\s\S]*?(?=Specific Tips:|$)/i);
      if (improvementsSection) {
        const improvementsList = improvementsSection[0].replace(/Areas for Improvement:[\s]*/i, '')
          .split(/\n+/)
          .filter(item => item.trim().startsWith('*') || item.trim().startsWith('-'))
          .map(item => item.replace(/^[*-]\s*/, '').trim())
          .filter(Boolean);
        
        setImprovements(improvementsList);
      }
    } catch (err) {
      console.error("Error parsing assessment:", err);
    }
  }, [assessment, interviewComplete, navigate]);
  
  if (!assessment || !interviewComplete) {
    return null; // Will redirect via useEffect
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="bg-indigo-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">{jobTitle} - Interview Results</h1>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between mb-8">
            <div className="mb-4 md:mb-0 flex flex-col items-center justify-center bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Overall Decision</h2>
              <div className={`inline-block px-6 py-3 rounded-lg text-2xl font-bold ${
                decision === 'PASS' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {decision || 'Not Available'}
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Score</h2>
              <div className="w-full max-w-[180px]">
                <div className="flex mb-2 items-center justify-center">
                  <span className="text-3xl font-bold text-indigo-600">
                    {score !== null ? score : '?'}<span className="text-lg font-normal">/100</span>
                  </span>
                </div>
                <div className="flex h-6 overflow-hidden bg-gray-200 rounded-full">
                  <div
                    style={{ width: `${score || 0}%` }}
                    className={`flex flex-col justify-center rounded-full transition-all duration-500 ${
                      score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-green-50 p-5 rounded-lg border border-green-100">
              <h3 className="font-semibold text-lg text-green-800 mb-3">Key Strengths</h3>
              <ul className="space-y-2">
                {strengths.length > 0 ? (
                  strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {strength}
                    </li>
                  ))
                ) : (
                  <li className="text-gray-600 italic">No specific strengths mentioned</li>
                )}
              </ul>
            </div>
            
            <div className="bg-red-50 p-5 rounded-lg border border-red-100">
              <h3 className="font-semibold text-lg text-red-800 mb-3">Areas for Improvement</h3>
              <ul className="space-y-2">
                {improvements.length > 0 ? (
                  improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      </svg>
                      {improvement}
                    </li>
                  ))
                ) : (
                  <li className="text-gray-600 italic">No specific improvements mentioned</li>
                )}
              </ul>
            </div>
          </div>
          
          <div className="prose max-w-none bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-4">Full Assessment</h3>
            <ReactMarkdown>{assessment}</ReactMarkdown>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Interview History</h2>
        <div className="space-y-6">
          {interviewHistory.map((item, index) => (
            <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
              <div className="bg-indigo-50 p-4 rounded-lg mb-3">
                <p className="font-medium">Q{index + 1}: {item.question}</p>
              </div>
              <div className="pl-4 border-l-4 border-gray-200">
                <p>A{index + 1}: {item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center mt-8 space-x-4">
        <Link
          to="/"
          className="bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-medium py-2 px-6 rounded-lg shadow-sm transition duration-300"
        >
          Back to Home
        </Link>
        <Link
          to="/interview"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg shadow-sm transition duration-300"
        >
          Try Again
        </Link>
      </div>
    </div>
  );
};

export default Results;