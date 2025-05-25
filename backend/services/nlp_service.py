import spacy
from transformers import pipeline
import numpy as np
import os
import torch

# Load spaCy model
try:
    nlp = spacy.load('en_core_web_sm')
except OSError:
    print("Downloading spaCy model...")
    os.system("python -m spacy download en_core_web_sm")
    nlp = spacy.load('en_core_web_sm')

# Initialize emotion classifier with specific device placement
device = 0 if torch.cuda.is_available() else -1
try:
    emotion_classifier = pipeline(
        "text-classification",
        model="j-hartmann/emotion-english-distilroberta-base",
        return_all_scores=True,
        device=device
    )
except Exception as e:
    print(f"Warning: Error loading emotion classifier: {e}")
    print("Attempting to load with CPU only...")
    emotion_classifier = pipeline(
        "text-classification",
        model="j-hartmann/emotion-english-distilroberta-base",
        return_all_scores=True,
        device=-1
    )

def preprocess_text(text):
    """Preprocess text using spaCy."""
    try:
        doc = nlp(text)
        # Basic preprocessing: lowercase, remove stopwords and punctuation
        tokens = [token.lemma_.lower() for token in doc 
                if not token.is_stop and not token.is_punct]
        return {
            'original': text,
            'preprocessed': ' '.join(tokens),
            'tokens': tokens,
            'entities': [(ent.text, ent.label_) for ent in doc.ents]
        }
    except Exception as e:
        print(f"Warning: Error in text preprocessing: {e}")
        return {
            'original': text,
            'preprocessed': text.lower(),
            'tokens': text.lower().split(),
            'entities': []
        }

def analyze_emotions(comments):
    """Analyze emotions in comments using the emotion classifier."""
    try:
        analyzed_comments = []
        
        for comment in comments:
            try:
                # Preprocess text
                preprocessed = preprocess_text(comment['text'])
                
                # Get emotion predictions
                predictions = emotion_classifier(comment['text'])[0]
                
                # Find the emotion with highest confidence
                max_emotion = max(predictions, key=lambda x: x['score'])
                
                # Add emotion analysis to comment
                analyzed_comment = {
                    **comment,  # Keep all original comment data
                    'emotion': max_emotion['label'].lower(),
                    'emotionConfidence': float(max_emotion['score']),
                    'emotionAnalysis': {
                        'preprocessedText': preprocessed['preprocessed'],
                        'entities': preprocessed['entities'],
                        'allEmotions': [
                            {'emotion': p['label'].lower(), 'confidence': float(p['score'])}
                            for p in predictions
                        ],
                        'modelVersion': 'distilroberta-base',
                        'analyzedAt': None  # Will be set by MongoDB
                    }
                }
                analyzed_comments.append(analyzed_comment)
            except Exception as e:
                print(f"Warning: Error analyzing comment: {e}")
                # Add comment with default values if analysis fails
                analyzed_comments.append({
                    **comment,
                    'emotion': 'unknown',
                    'emotionConfidence': 0.0,
                    'emotionAnalysis': {
                        'preprocessedText': comment['text'],
                        'entities': [],
                        'allEmotions': [],
                        'modelVersion': 'distilroberta-base',
                        'analyzedAt': None
                    }
                })
        
        return analyzed_comments
    except Exception as e:
        raise Exception(f"Error in emotion analysis: {str(e)}") 