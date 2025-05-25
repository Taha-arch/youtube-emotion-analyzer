from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from gensim.models import Word2Vec
import numpy as np
from typing import List, Dict, Any, Union
import pickle
import os

class FeatureExtractor:
    def __init__(self, method: str = 'tfidf', max_features: int = 5000):
        """Initialize the feature extractor.
        
        Args:
            method (str): Feature extraction method ('bow', 'tfidf', or 'word2vec')
            max_features (int): Maximum number of features for BoW and TF-IDF
        """
        self.method = method
        self.max_features = max_features
        self.model = None
        self.vectorizer = None
        
        if method == 'bow':
            self.vectorizer = CountVectorizer(
                max_features=max_features,
                stop_words='english'
            )
        elif method == 'tfidf':
            self.vectorizer = TfidfVectorizer(
                max_features=max_features,
                stop_words='english'
            )
        elif method == 'word2vec':
            self.model = None  # Will be trained on the data
        else:
            raise ValueError(f"Unsupported method: {method}")

    def train_word2vec(self, tokenized_texts: List[List[str]], save_path: str = None):
        """Train Word2Vec model on the tokenized texts."""
        self.model = Word2Vec(
            sentences=tokenized_texts,
            vector_size=300,
            window=5,
            min_count=1,
            workers=4
        )
        
        if save_path:
            self.model.save(save_path)

    def load_word2vec(self, path: str):
        """Load a pre-trained Word2Vec model."""
        self.model = Word2Vec.load(path)

    def get_word2vec_vector(self, tokens: List[str]) -> np.ndarray:
        """Get the average Word2Vec vector for a list of tokens."""
        vectors = []
        for token in tokens:
            try:
                vectors.append(self.model.wv[token])
            except KeyError:
                continue
        
        if vectors:
            return np.mean(vectors, axis=0)
        return np.zeros(self.model.vector_size)

    def fit(self, texts: Union[List[str], List[List[str]]]):
        """Fit the feature extractor on the training data."""
        if self.method in ['bow', 'tfidf']:
            if isinstance(texts[0], list):
                # Join tokens if texts are tokenized
                texts = [' '.join(tokens) for tokens in texts]
            self.vectorizer.fit(texts)
        elif self.method == 'word2vec':
            if isinstance(texts[0], str):
                raise ValueError("Word2Vec requires tokenized texts")
            self.train_word2vec(texts)

    def transform(self, texts: Union[List[str], List[List[str]]]) -> np.ndarray:
        """Transform texts to feature vectors."""
        if self.method in ['bow', 'tfidf']:
            if isinstance(texts[0], list):
                texts = [' '.join(tokens) for tokens in texts]
            return self.vectorizer.transform(texts).toarray()
        elif self.method == 'word2vec':
            if isinstance(texts[0], str):
                raise ValueError("Word2Vec requires tokenized texts")
            return np.array([self.get_word2vec_vector(tokens) for tokens in texts])

    def fit_transform(self, texts: Union[List[str], List[List[str]]]) -> np.ndarray:
        """Fit and transform in one step."""
        self.fit(texts)
        return self.transform(texts)

    def get_feature_names(self) -> List[str]:
        """Get feature names (vocabulary) for BoW and TF-IDF."""
        if self.method in ['bow', 'tfidf']:
            return self.vectorizer.get_feature_names_out()
        return []

    def save(self, path: str):
        """Save the feature extractor to disk."""
        if self.method == 'word2vec':
            if self.model:
                self.model.save(f"{path}_word2vec.model")
        else:
            with open(f"{path}_{self.method}.pkl", 'wb') as f:
                pickle.dump(self.vectorizer, f)

    def load(self, path: str):
        """Load the feature extractor from disk."""
        if self.method == 'word2vec':
            self.load_word2vec(f"{path}_word2vec.model")
        else:
            with open(f"{path}_{self.method}.pkl", 'rb') as f:
                self.vectorizer = pickle.load(f) 