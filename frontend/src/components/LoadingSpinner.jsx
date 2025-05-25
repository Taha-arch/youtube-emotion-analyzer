import React, { useEffect, useState } from 'react';

function LoadingSpinner({ message: customMessage }) {
  const [message, setMessage] = useState(customMessage || 'Fetching comments...');
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!customMessage) {
      const messages = [
        'Fetching YouTube comments',
        'Analyzing sentiment patterns',
        'Processing emotional data',
        'Preparing results',
      ];
      let index = 0;
      const messageInterval = setInterval(() => {
        index = (index + 1) % messages.length;
        setMessage(messages[index]);
      }, 3000);

      return () => clearInterval(messageInterval);
    }
  }, [customMessage]);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(dotInterval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse opacity-20"></div>
        <div className="relative">
          <svg
            className="animate-spin h-16 w-16 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-gray-800 text-lg font-medium animate-fade-in">
          {message}
          <span className="text-blue-600">{dots}</span>
        </p>
        <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

export default LoadingSpinner;