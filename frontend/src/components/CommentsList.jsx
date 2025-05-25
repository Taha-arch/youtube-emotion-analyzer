import React, { useState } from 'react';
import { Search, Calendar, MessageSquare, Heart, Frown, Smile, Zap, Star, Coffee, ChevronLeft, ChevronRight } from 'lucide-react';

const EMOTION_COLORS = {
  joy: '#FFD93D',
  sadness: '#6C91BF',
  anger: '#FF6B6B',
  fear: '#845EC2',
  surprise: '#4EAAFF',
  disgust: '#FF9A9E',
  neutral: '#95A5A6'
};

const EMOTION_ICONS = {
  joy: <Smile className="w-5 h-5" />,
  sadness: <Frown className="w-5 h-5" />,
  anger: <Zap className="w-5 h-5" />,
  fear: <Star className="w-5 h-5" />,
  surprise: <Coffee className="w-5 h-5" />,
  disgust: <Heart className="w-5 h-5" />,
  neutral: <MessageSquare className="w-5 h-5" />
};

const EmotionBadge = ({ emotion, confidence }) => (
  <div 
    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
    style={{ 
      backgroundColor: `${EMOTION_COLORS[emotion]}20`,
      color: EMOTION_COLORS[emotion],
      border: `1px solid ${EMOTION_COLORS[emotion]}40`
    }}
  >
    {EMOTION_ICONS[emotion]}
    <span className="capitalize">{emotion}</span>
    {confidence && (
      <span className="text-xs opacity-75">
        {Math.round(confidence * 100)}%
      </span>
    )}
  </div>
);

function CommentsList({ comments }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [emotionFilter, setEmotionFilter] = useState('all');

  // Calculate emotion counts
  const emotionCounts = comments.reduce((acc, comment) => {
    if (comment.emotion) {
      acc[comment.emotion] = (acc[comment.emotion] || 0) + 1;
    }
    return acc;
  }, {});

  // Filter and sort comments
  const filteredComments = comments
    .filter((comment) => {
      const matchesSearch = comment.text.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEmotion = emotionFilter === 'all' || comment.emotion === emotionFilter;
      return matchesSearch && matchesEmotion;
    })
    .sort((a, b) => {
      if (sortBy === 'likes') {
        return (b.likeCount || 0) - (a.likeCount || 0);
      } else if (sortBy === 'confidence') {
        return (b.emotionConfidence || 0) - (a.emotionConfidence || 0);
      }
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    });

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    return Math.floor(seconds) + ' seconds ago';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search comments..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 border-0"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSortBy(sortBy === 'date' ? 'likes' : 'date')}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                sortBy === 'date' ? 'bg-blue-600 text-white' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              Sort by {sortBy === 'date' ? 'Date' : 'Likes'}
            </button>
            <button
              onClick={() => setSortBy(sortBy === 'confidence' ? 'date' : 'confidence')}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                sortBy === 'confidence' ? 'bg-blue-600 text-white' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              Sort by {sortBy === 'confidence' ? 'Date' : 'Confidence'}
            </button>
          </div>
        </div>

        {/* Emotion Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setEmotionFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              emotionFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            All Comments ({comments.length})
          </button>
          {Object.entries(emotionCounts).map(([emotion, count]) => (
            emotion !== 'unknown' && (
              <button
                key={emotion}
                onClick={() => setEmotionFilter(emotion)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  emotionFilter === emotion ? 'bg-blue-600 text-white' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {EMOTION_ICONS[emotion]}
                <span className="capitalize">{emotion}</span>
                <span className="text-sm opacity-75">({count})</span>
              </button>
            )
          ))}
        </div>

        {/* Comments List */}
        {filteredComments.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No comments match your search.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {filteredComments.map((comment, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-6 transition-all duration-200 hover:bg-gray-100"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-gray-900 mb-2">{comment.text}</p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={16} />
                        {getTimeAgo(comment.publishedAt)}
                      </span>
                      {comment.author && (
                        <span className="text-blue-600">@{comment.author}</span>
                      )}
                      {comment.likeCount !== undefined && (
                        <span className="flex items-center gap-1">
                          <Heart size={16} />
                          {comment.likeCount}
                        </span>
                      )}
                    </div>
                  </div>
                  {comment.emotion && (
                    <EmotionBadge 
                      emotion={comment.emotion} 
                      confidence={comment.emotionConfidence}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CommentsList;