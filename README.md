# 🎬 YouTube Emotion Analyzer

A full-stack application that analyzes the emotional sentiment of YouTube video comments using NLP techniques. The app consists of a React frontend and a Python (Flask) backend.

## ✨ Features

- **Real-time Analysis**: Instantly analyze the emotional sentiment of comments from any YouTube video.
- **Comprehensive Results**: View detailed breakdowns of emotional patterns and sentiment distribution.
- **Modern UI/UX**: Enjoy a beautiful, responsive interface with interactive visualizations.
- **Advanced NLP Pipeline**: Utilizes text preprocessing, feature extraction, and machine learning models for accurate emotion classification.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Chart.js, react-chartjs-2, react-toastify, Spline
- **Backend**: Python, Flask, NLTK/spaCy, scikit-learn, TensorFlow, MongoDB
- **APIs**: YouTube Data API

## 📋 Setup Instructions

### Prerequisites

- Node.js (v14 or later)
- Python (v3.8 or later)
- MongoDB (local or Atlas)

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows, use: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables (e.g., YouTube API key, MongoDB connection string) in a `.env` file.
5. Start the Flask server:
   ```bash
   python server.py
   ```

## 🚀 Usage

1. Open your browser and navigate to `http://localhost:3000`.
2. Paste a YouTube video URL into the input field.
3. Click "Analyze" to fetch and analyze the comments.
4. View the emotional analysis results and comment breakdowns.

## 📄 License

This project is licensed under the MIT License. 