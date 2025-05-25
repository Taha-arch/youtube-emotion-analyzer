import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

function YouTubeUrlInput({ onSubmit, isLoading }) {
  const [url, setUrl] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  const validateUrl = (value) => {
    const videoRegex = /(?:v=|\/)([0-9A-Za-z_-]{11})/;
    const channelRegex = /(?:\/@|\/channel\/|\/c\/|\/user\/)([0-9A-Za-z_-]+)/;
    return videoRegex.test(value) || channelRegex.test(value);
  };

  useEffect(() => {
    setIsValid(url.trim() ? validateUrl(url) : true);
  }, [url]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim() && isValid) {
      onSubmit(url);
      setUrl('');
    }
  };

  const clearInput = () => {
    setUrl('');
    setIsValid(true);
  };

  const handleExampleClick = (exampleUrl) => {
    setUrl(exampleUrl);
    onSubmit(exampleUrl);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="relative space-y-4">
        <div className="flex items-center space-x-2">
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <label htmlFor="youtubeUrl" className="block text-lg font-medium text-gray-700">
            Enter YouTube URL
          </label>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <div
              className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                isFocused
                  ? 'ring-2 ring-blue-500 ring-opacity-50'
                  : isValid
                  ? 'border border-gray-300'
                  : 'border-2 border-red-500'
              }`}
            ></div>
            <input
              id="youtubeUrl"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Paste your YouTube video or channel URL here..."
              className={`w-full px-4 py-3.5 bg-white rounded-lg transition-all duration-200 relative z-10 ${
                isValid ? 'focus:border-transparent' : 'border-red-500'
              } placeholder-gray-400 focus:outline-none`}
              aria-invalid={!isValid}
              aria-describedby="url-error"
              disabled={isLoading}
              required
            />
            {url && (
              <button
                type="button"
                onClick={clearInput}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-20 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                aria-label="Clear input"
              >
                <X size={18} />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || !isValid || !url.trim()}
            className={`px-6 py-3.5 rounded-lg font-medium transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isLoading || !isValid || !url.trim()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 active:scale-95'
            } flex items-center justify-center space-x-2 min-w-[140px]`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
                <span>Processing</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>Analyze</span>
              </>
            )}
          </button>
        </div>
        {!isValid && url.trim() && (
          <div className="flex items-center space-x-2 text-red-500 mt-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p id="url-error" className="text-sm">
              Please enter a valid YouTube video or channel URL
            </p>
          </div>
        )}
      </form>

      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <p className="font-medium text-gray-700 flex items-center mb-3">
          <svg
            className="w-5 h-5 mr-2 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Try these examples:
        </p>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleExampleClick('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
            className="w-full text-left px-4 py-2 rounded-lg hover:bg-white transition-colors duration-200 flex items-center group"
          >
            <svg
              className="w-5 h-5 mr-2 text-red-500 group-hover:scale-110 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-gray-600">Video Example: Never Gonna Give You Up</span>
          </button>
          <button
            type="button"
            onClick={() => handleExampleClick('https://www.youtube.com/@MrBeast')}
            className="w-full text-left px-4 py-2 rounded-lg hover:bg-white transition-colors duration-200 flex items-center group"
          >
            <svg
              className="w-5 h-5 mr-2 text-red-500 group-hover:scale-110 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
              />
            </svg>
            <span className="text-gray-600">Channel Example: MrBeast</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default YouTubeUrlInput;