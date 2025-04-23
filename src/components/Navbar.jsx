// components/Navbar.jsx
import { Link } from 'react-router-dom';
import { useInterview } from '../context/InterviewContext';

const Navbar = () => {
  const { interviewComplete } = useInterview();

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            <span className="font-bold text-xl">AI Interview Simulator</span>
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link to="/" className="hover:text-indigo-200 transition">Home</Link>
            <Link to="/interview" className="hover:text-indigo-200 transition">Interview</Link>
            {interviewComplete && (
              <Link to="/results" className="hover:text-indigo-200 transition">Results</Link>
            )}
          </div>
          <div className="md:hidden">
            <button className="focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;