// components/Dashboard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterview } from '../context/InterviewContext';

const JobOption = ({ title, description, icon, selected, onClick }) => {
  return (
    <div 
      className={`border rounded-lg p-6 cursor-pointer transition-all duration-300 ${
        selected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center mb-3">
        <div className="mr-3 bg-indigo-100 p-2 rounded-full">
          {icon}
        </div>
        <h3 className="font-medium text-lg">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const Dashboard = () => {
  const [selectedJob, setSelectedJob] = useState('');
  const [customJob, setCustomJob] = useState('');
  const { startInterview, isLoading } = useInterview();
  const navigate = useNavigate();

  const jobOptions = [
    {
      id: 'ui-designer',
      title: 'UI Designer',
      description: 'Create beautiful, intuitive interfaces for web and mobile applications.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'frontend-dev',
      title: 'Frontend Developer',
      description: 'Build responsive and interactive user interfaces using modern web technologies.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      )
    },
    {
      id: 'data-analyst',
      title: 'Data Analyst',
      description: 'Analyze data to provide insights and support business decisions.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'product-manager',
      title: 'Product Manager',
      description: 'Define product vision and coordinate development efforts.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    }
  ];

  const handleStartInterview = async () => {
    const jobTitle = selectedJob === 'custom' ? customJob : 
      jobOptions.find(job => job.id === selectedJob)?.title + ' Basic Fresher';
      
    if (jobTitle) {
      await startInterview(jobTitle);
      navigate('/interview');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Practice Your Interview Skills with AI</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Get ready for your dream job with our AI interview simulator. Choose a position and start practicing.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Select a Position</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {jobOptions.map((job) => (
            <JobOption
              key={job.id}
              {...job}
              selected={selectedJob === job.id}
              onClick={() => setSelectedJob(job.id)}
            />
          ))}
          
          <div 
            className={`border rounded-lg p-6 cursor-pointer transition-all duration-300 ${
              selectedJob === 'custom' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
            }`}
            onClick={() => setSelectedJob('custom')}
          >
            <div className="flex items-center mb-3">
              <div className="mr-3 bg-indigo-100 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="font-medium text-lg">Custom Position</h3>
            </div>
            {selectedJob === 'custom' ? (
              <input
                type="text"
                value={customJob}
                onChange={(e) => setCustomJob(e.target.value)}
                placeholder="Enter job title..."
                className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                autoFocus
              />
            ) : (
              <p className="text-gray-600">Define your own position for a tailored interview experience.</p>
            )}
          </div>
        </div>
      </section>

      <div className="text-center">
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-lg shadow-md transition duration-300 flex items-center justify-center mx-auto disabled:bg-indigo-400 disabled:cursor-not-allowed"
          onClick={handleStartInterview}
          disabled={!selectedJob || (selectedJob === 'custom' && !customJob) || isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </>
          ) : (
            'Start Interview'
          )}
        </button>
      </div>

      <section className="mt-16 border-t pt-12">
        <h2 className="text-2xl font-semibold mb-6">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-indigo-600">1</span>
            </div>
            <h3 className="font-medium text-lg mb-2">Select a Position</h3>
            <p className="text-gray-600">Choose from our list of positions or create a custom one.</p>
          </div>
          <div className="text-center">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-indigo-600">2</span>
            </div>
            <h3 className="font-medium text-lg mb-2">Answer Questions</h3>
            <p className="text-gray-600">Respond to AI-generated interview questions tailored to your position.</p>
          </div>
          <div className="text-center">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-indigo-600">3</span>
            </div>
            <h3 className="font-medium text-lg mb-2">Get Feedback</h3>
            <p className="text-gray-600">Receive detailed assessment and tips to improve your performance.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;