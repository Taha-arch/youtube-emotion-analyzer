from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score, confusion_matrix, classification_report
import numpy as np
from typing import Dict, List, Any, Tuple, Optional
import joblib
import json
import os

class EmotionClassifier:
    EMOTIONS = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'love', 'neutral']
    
    MODELS = {
        'naive_bayes': MultinomialNB(),
        'svm': LinearSVC(random_state=42),
        'random_forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'logistic': LogisticRegression(random_state=42, max_iter=1000)
    }

    def __init__(self, model_type: str = 'logistic'):
        """Initialize the emotion classifier.
        
        Args:
            model_type (str): Type of model to use ('naive_bayes', 'svm', 'random_forest', 'logistic')
        """
        if model_type not in self.MODELS:
            raise ValueError(f"Unsupported model type: {model_type}")
        
        self.model_type = model_type
        self.model = self.MODELS[model_type]
        self.is_trained = False

    def train(self, X: np.ndarray, y: np.ndarray) -> Dict[str, float]:
        """Train the emotion classifier.
        
        Args:
            X (np.ndarray): Feature vectors
            y (np.ndarray): Emotion labels
            
        Returns:
            Dict[str, float]: Training metrics
        """
        self.model.fit(X, y)
        self.is_trained = True
        
        # Get training metrics
        y_pred = self.model.predict(X)
        metrics = {
            'accuracy': accuracy_score(y, y_pred),
            'f1_macro': f1_score(y, y_pred, average='macro'),
            'f1_weighted': f1_score(y, y_pred, average='weighted')
        }
        
        return metrics

    def predict(self, X: np.ndarray) -> np.ndarray:
        """Predict emotions for new data.
        
        Args:
            X (np.ndarray): Feature vectors
            
        Returns:
            np.ndarray: Predicted emotion labels
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        return self.model.predict(X)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Get probability estimates for each emotion.
        
        Args:
            X (np.ndarray): Feature vectors
            
        Returns:
            np.ndarray: Probability estimates for each emotion class
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
            
        if hasattr(self.model, 'predict_proba'):
            return self.model.predict_proba(X)
        elif hasattr(self.model, 'decision_function'):
            # For models like SVM that don't directly provide probabilities
            decision_values = self.model.decision_function(X)
            return softmax(decision_values)
        else:
            raise NotImplementedError("Probability estimation not supported for this model")

    def evaluate(self, X: np.ndarray, y: np.ndarray) -> Dict[str, Any]:
        """Evaluate the model's performance.
        
        Args:
            X (np.ndarray): Feature vectors
            y (np.ndarray): True emotion labels
            
        Returns:
            Dict[str, Any]: Evaluation metrics
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before evaluation")
        
        y_pred = self.predict(X)
        
        # Calculate metrics
        metrics = {
            'accuracy': accuracy_score(y, y_pred),
            'f1_macro': f1_score(y, y_pred, average='macro'),
            'f1_weighted': f1_score(y, y_pred, average='weighted'),
            'confusion_matrix': confusion_matrix(y, y_pred).tolist(),
            'classification_report': classification_report(y, y_pred, output_dict=True)
        }
        
        return metrics

    def save(self, path: str):
        """Save the trained model and metadata to disk.
        
        Args:
            path (str): Path to save the model
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before saving")
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(path), exist_ok=True)
        
        # Save the model
        joblib.dump(self.model, f"{path}_model.joblib")
        
        # Save metadata
        metadata = {
            'model_type': self.model_type,
            'is_trained': self.is_trained,
            'emotions': self.EMOTIONS
        }
        
        with open(f"{path}_metadata.json", 'w') as f:
            json.dump(metadata, f)

    def load(self, path: str):
        """Load a trained model and metadata from disk.
        
        Args:
            path (str): Path to load the model from
        """
        # Load the model
        self.model = joblib.load(f"{path}_model.joblib")
        
        # Load metadata
        with open(f"{path}_metadata.json", 'r') as f:
            metadata = json.load(f)
        
        self.model_type = metadata['model_type']
        self.is_trained = metadata['is_trained']

def softmax(X: np.ndarray) -> np.ndarray:
    """Compute softmax values for each set of scores in x."""
    exp_x = np.exp(X - np.max(X, axis=1, keepdims=True))
    return exp_x / np.sum(exp_x, axis=1, keepdims=True) 