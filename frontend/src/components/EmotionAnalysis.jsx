import React, { useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const EMOTION_COLORS = {
  joy: 'rgba(255, 217, 61, 0.7)',      // #FFD93D
  sadness: 'rgba(108, 145, 191, 0.7)', // #6C91BF
  anger: 'rgba(255, 107, 107, 0.7)',   // #FF6B6B
  fear: 'rgba(132, 94, 194, 0.7)',     // #845EC2
  surprise: 'rgba(78, 170, 255, 0.7)', // #4EAAFF
  disgust: 'rgba(255, 154, 158, 0.7)', // #FF9A9E
  neutral: 'rgba(149, 165, 166, 0.7)'  // #95A5A6
};

const processEmotionData = (data) => {
  if (!data || typeof data !== 'object') return null;

  // Extract emotion data from the structure shown in console
  const emotions = {};
  Object.entries(data).forEach(([emotion, details]) => {
    if (details && typeof details === 'object' && 'count' in details && 'avgConfidence' in details) {
      emotions[emotion] = {
        count: details.count,
        confidence: details.avgConfidence
      };
    }
  });

  return emotions;
};

const EmotionAnalysis = ({ emotionData }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    // Cleanup function to destroy chart instance
    return () => {
      if (chartRef.current && chartRef.current.destroy) {
        chartRef.current.destroy();
      }
    };
  }, []);

  const renderContent = () => {
    try {
      const processedData = processEmotionData(emotionData);
      
      if (!processedData || Object.keys(processedData).length === 0) {
        return (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-gray-500">No emotion analysis data available yet</p>
          </div>
        );
      }

      // Calculate percentages based on counts
      const totalCount = Object.values(processedData).reduce((sum, { count }) => sum + count, 0);
      const validEmotions = Object.entries(processedData)
        .map(([emotion, { count, confidence }]) => ({
          emotion: emotion.toLowerCase(),
          percentage: (count / totalCount) * 100,
          confidence: confidence
        }))
        .filter(({ emotion }) => EMOTION_COLORS[emotion]);

      const chartData = {
        labels: validEmotions.map(({ emotion }) => 
          emotion.charAt(0).toUpperCase() + emotion.slice(1)
        ),
        datasets: [
          {
            label: 'Emotion Distribution',
            data: validEmotions.map(({ percentage }) => percentage.toFixed(1)),
            backgroundColor: validEmotions.map(({ emotion }) => EMOTION_COLORS[emotion]),
            borderColor: validEmotions.map(({ emotion }) => EMOTION_COLORS[emotion].replace('0.7', '1')),
            borderWidth: 1,
            borderRadius: 6,
          },
        ],
      };

      const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Comment Emotions Analysis',
            font: {
              size: 16,
              weight: 'bold',
            },
            padding: 20,
            color: '#1f2937',
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const emotion = validEmotions[context.dataIndex];
                const count = processedData[emotion.emotion].count;
                return [
                  `Count: ${count} comments`,
                  `Percentage: ${context.formattedValue}%`,
                  `Confidence: ${(emotion.confidence * 100).toFixed(1)}%`
                ];
              },
            },
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#1f2937',
            bodyColor: '#1f2937',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `${value}%`,
              color: '#6b7280',
            },
            grid: {
              color: '#f3f4f6',
            },
          },
          x: {
            ticks: {
              color: '#6b7280',
            },
            grid: {
              display: false,
            },
          },
        },
      };

      // Sort emotions by percentage for display
      const sortedEmotions = [...validEmotions].sort((a, b) => b.percentage - a.percentage);

      return (
        <>
          <div className="h-[300px] relative mb-6">
            <Bar ref={chartRef} data={chartData} options={options} />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedEmotions.map(({ emotion, percentage, confidence }) => (
              <div 
                key={emotion} 
                className="bg-gray-50 p-4 rounded-lg border-l-4"
                style={{ borderLeftColor: EMOTION_COLORS[emotion].replace('0.7', '1') }}
              >
                <p className="text-sm font-medium capitalize">{emotion}</p>
                <div className="mt-1">
                  <p className="text-lg font-bold" style={{ color: EMOTION_COLORS[emotion].replace('0.7', '1') }}>
                    {percentage.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {processedData[emotion].count} comments
                  </p>
                  <p className="text-xs text-gray-500">
                    Confidence: {(confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Analysis based on {totalCount} total comments
            </p>
          </div>
        </>
      );
    } catch (error) {
      console.error('Error in EmotionAnalysis:', error);
      return (
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-red-500">Error displaying emotion analysis. Please try again.</p>
        </div>
      );
    }
  };

  // Find dominant emotion based on count and confidence
  const getDominantEmotion = () => {
    if (!emotionData || typeof emotionData !== 'object') return null;
    
    let dominant = null;
    let maxScore = -1;

    Object.entries(emotionData).forEach(([emotion, details]) => {
      if (details && typeof details === 'object') {
        const score = (details.count || 0) * (details.avgConfidence || 0);
        if (score > maxScore) {
          maxScore = score;
          dominant = emotion;
        }
      }
    });

    return dominant;
  };

  const dominantEmotion = getDominantEmotion();

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Emotion Analysis</h2>
        {dominantEmotion && (
          <p className="text-gray-600">
            Dominant emotion:{' '}
            <span 
              className="font-semibold capitalize"
              style={{ 
                color: EMOTION_COLORS[dominantEmotion.toLowerCase()]?.replace('0.7', '1') || '#4B5563'
              }}
            >
              {dominantEmotion}
            </span>
          </p>
        )}
      </div>
      {renderContent()}
    </div>
  );
};

export default EmotionAnalysis; 