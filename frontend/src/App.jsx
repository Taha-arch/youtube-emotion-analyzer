import React, { useState, useCallback } from 'react';
import YouTubeUrlInput from './components/YoutubeUrlInput.jsx';
import CommentsList from './components/CommentsList.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import EmotionAnalysis from './components/EmotionAnalysis.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { debounce } from 'lodash';
import Spline from '@splinetool/react-spline';

function App() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [videoHistory, setVideoHistory] = useState([]);
  const [currentVideoData, setCurrentVideoData] = useState(null);
  const [emotionStats, setEmotionStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchComments = useCallback(
    debounce(async (url, isFromHistory = false) => {
      setLoading(true);
      setComments([]);
      setEmotionStats(null);

      try {
        const videoId = isFromHistory ? url : url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)?.[1];
        if (!videoId) {
          throw new Error('Invalid YouTube URL. Please ensure it includes a valid video ID.');
        }

        const response = await fetch(`http://localhost:5000/comments?videoId=${videoId}&limit=0`);
        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? 'Video not found or comments are disabled.'
              : 'Failed to fetch comments. Please try again later.'
          );
        }

        const data = await response.json();
        console.log('Response data:', data);

        if (!data.videoInfo || !data.videoInfo.videoId) {
          throw new Error('Invalid video information received from server');
        }

        // Process emotion statistics
        const stats = data.emotionStats || {};
        console.log('Emotion stats:', stats);

        // Calculate percentages
        const totalCount = Object.values(stats).reduce((sum, stat) => sum + (stat.count || 0), 0);
        const processedStats = Object.entries(stats).reduce((acc, [emotion, stat]) => {
          if (stat && typeof stat.count === 'number') {
            acc[emotion] = {
              count: stat.count,
              percentage: (stat.count / totalCount) * 100,
              avgConfidence: stat.avgConfidence || 0
            };
          }
          return acc;
        }, {});

        setComments(data.comments || []);
        setCurrentVideoData(data.videoInfo);
        setEmotionStats(processedStats);
        
        if (data.pagination) {
          setCurrentPage(data.pagination.page || 1);
          setTotalPages(data.pagination.totalPages || 1);
        }

        if (!isFromHistory && !videoHistory.includes(videoId)) {
          setVideoHistory((prev) => [videoId, ...prev.slice(0, 4)]);
        }

        toast.success('Analysis completed successfully!');
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error(err.message);
        setComments([]);
        setCurrentVideoData(null);
        setEmotionStats(null);
      } finally {
        setLoading(false);
      }
    }, 500),
    [videoHistory]
  );

  const clearData = () => {
    setComments([]);
    setCurrentVideoData(null);
    setEmotionStats(null);
    toast.info('Data cleared.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.015] pointer-events-none"></div>
      
      {/* Hero Section */}
      <header className="relative overflow-hidden min-h-[500px] flex items-center">
        {/* Background with modern gradient and blur effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-sky-400 via-blue-500 to-indigo-500">
          <div className="absolute inset-0 mix-blend-overlay opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]"></div>
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/10"></div>
          {/* Floating Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          </div>
        </div>

        <div className="absolute right-10 top-1/2 -translate-y-1/2 w-96 h-96 opacity-95 pointer-events-none animate-float">
          <Spline
            scene="https://prod.spline.design/UMosoAnSKNeSkl3e/scene.splinecode"
            style={{ width: '100%', height: '100%', transform: 'scale(1.2)' }}
          />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10 w-full px-6">
          <div className="max-w-2xl">
            <h1 className="text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
              AI-Powered YouTube Emotion Analyzer
            </h1>
            <p className="text-xl text-white/90 leading-relaxed mb-8 drop-shadow">
              Discover the emotional landscape of your YouTube content through advanced sentiment analysis
            </p>
            <div className="mt-8 mb-12 backdrop-blur-sm bg-white/10 p-6 rounded-2xl border border-white/20">
              <YouTubeUrlInput onSubmit={fetchComments} onClear={clearData} isLoading={loading} />
            </div>
          </div>
        </div>
      </header>

      {/* Simplified Technology Stack Section */}
      <div className="bg-white/70 backdrop-blur-sm py-6 shadow-sm border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-16">
            <span className="text-gray-500 text-sm">Powered by:</span>
            <div className="flex items-center gap-16">
              {/* YouTube */}
              <div className="tech-logo" style={{ width: '100px' }}>
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png"
                  alt="YouTube" 
                  className="w-full h-auto"
                  style={{ maxHeight: '24px' }}
                />
              </div>

              {/* Python */}
              <div className="tech-logo" style={{ width: '140px' }}>
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/f/f8/Python_logo_and_wordmark.svg" 
                  alt="Python" 
                  className="w-full h-auto"
                  style={{ maxHeight: '45px' }}
                />
              </div>

              {/* MongoDB */}
              <div className="tech-logo" style={{ width: '140px' }}>
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/9/93/MongoDB_Logo.svg" 
                  alt="MongoDB" 
                  className="w-full h-auto"
                  style={{ maxHeight: '35px' }}
                />
              </div>

              {/* React */}
              <div className="tech-logo" style={{ width: '80px' }}>
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" 
                  alt="React" 
                  className="w-full h-auto"
                  style={{ maxHeight: '35px' }}
                />
              </div>

              {/* TensorFlow */}
              <div className="tech-logo" style={{ width: '100px' }}>
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/2/2d/Tensorflow_logo.svg" 
                  alt="TensorFlow" 
                  className="w-full h-auto"
                  style={{ maxHeight: '35px' }}
                />
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .tech-logo {
            transition: all 0.3s ease;
            opacity: 0.7;
            display: flex;
            align-items: center;
            justify-content: center;
            filter: grayscale(20%);
            padding: 8px;
            height: 60px;
          }

          .tech-logo:hover {
            opacity: 1;
            transform: translateY(-1px);
            filter: grayscale(0%);
          }

          .tech-logo img {
            max-width: 100%;
            object-fit: contain;
            object-position: center;
          }
        `}</style>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner message="Analyzing video comments..." />
          </div>
        ) : currentVideoData ? (
          <div className="space-y-8">
            {/* Video Information Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-slate-200 hover:bg-white/90 transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    src={`https://www.youtube.com/embed/${currentVideoData.videoId}`}
                    title={currentVideoData.title || 'YouTube Video'}
                    className="w-full h-full rounded-xl"
                    allowFullScreen
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">{currentVideoData.title || 'Untitled'}</h2>
                  <p className="text-gray-600 line-clamp-4">{currentVideoData.description || 'No description available'}</p>
                </div>
              </div>
            </div>

            {/* Emotion Analysis Section */}
            {emotionStats && Object.keys(emotionStats).length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-slate-200 hover:bg-white/90 transition-colors">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">Emotional Analysis Results</h3>
                <EmotionAnalysis emotionData={emotionStats} />
              </div>
            )}

            {/* Comments Section */}
            {comments.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-slate-200 hover:bg-white/90 transition-colors">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">Video Comments</h3>
                <CommentsList 
                  comments={comments}
                  emotionStats={emotionStats}
                  currentPage={currentPage}
                  totalPages={totalPages}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
            <FeatureCard
              title="Real-time Analysis"
              description="Get instant emotional insights from your YouTube video comments using advanced AI."
              icon="📊"
            />
            <FeatureCard
              title="Comprehensive Results"
              description="View detailed breakdowns of emotional patterns and sentiment distribution."
              icon="🎯"
            />
            <FeatureCard
              title="Easy to Use"
              description="Simply paste your YouTube URL and let our AI do the heavy lifting."
              icon="✨"
            />
          </div>
        )}
      </main>

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(-50%) translateX(0); }
          25% { transform: translateY(-52%) translateX(-5px); }
          75% { transform: translateY(-48%) translateX(5px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .bg-grid-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ title, description, icon }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-200 hover:bg-white/90 transition-colors hover:shadow-xl">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-3 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default App;