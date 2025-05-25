import re
import nltk
import spacy
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from typing import List, Dict, Any

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')
    nltk.download('wordnet')

class TextPreprocessor:
    def __init__(self, use_spacy: bool = True):
        """Initialize the text preprocessor.
        
        Args:
            use_spacy (bool): Whether to use spaCy for preprocessing (True) or NLTK (False)
        """
        self.use_spacy = use_spacy
        self.stop_words = set(stopwords.words('english'))
        
        if use_spacy:
            try:
                self.nlp = spacy.load('en_core_web_sm')
            except OSError:
                import subprocess
                subprocess.run(['python', '-m', 'spacy', 'download', 'en_core_web_sm'])
                self.nlp = spacy.load('en_core_web_sm')
        else:
            self.lemmatizer = WordNetLemmatizer()

    def clean_text(self, text: str) -> str:
        """Clean text by removing special characters and extra whitespace."""
        # Convert to lowercase
        text = text.lower()
        
        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        
        # Remove email addresses
        text = re.sub(r'\S+@\S+', '', text)
        
        # Remove special characters and numbers
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        return text

    def preprocess_spacy(self, text: str) -> List[str]:
        """Preprocess text using spaCy."""
        doc = self.nlp(text)
        tokens = []
        
        for token in doc:
            if (not token.is_stop and 
                not token.is_punct and 
                not token.is_space and 
                len(token.text) > 2):
                tokens.append(token.lemma_)
        
        return tokens

    def preprocess_nltk(self, text: str) -> List[str]:
        """Preprocess text using NLTK."""
        # Tokenize
        tokens = word_tokenize(text)
        
        # Remove stopwords and lemmatize
        tokens = [
            self.lemmatizer.lemmatize(token)
            for token in tokens
            if token not in self.stop_words and len(token) > 2
        ]
        
        return tokens

    def preprocess(self, text: str) -> Dict[str, Any]:
        """Preprocess the input text.
        
        Args:
            text (str): Input text to preprocess
            
        Returns:
            dict: Dictionary containing original and preprocessed text
        """
        # Clean the text
        cleaned_text = self.clean_text(text)
        
        # Tokenize and lemmatize
        if self.use_spacy:
            tokens = self.preprocess_spacy(cleaned_text)
        else:
            tokens = self.preprocess_nltk(cleaned_text)
        
        return {
            'original': text,
            'cleaned': cleaned_text,
            'tokens': tokens,
            'preprocessed': ' '.join(tokens)
        }

    def preprocess_batch(self, texts: List[str]) -> List[Dict[str, Any]]:
        """Preprocess a batch of texts.
        
        Args:
            texts (List[str]): List of texts to preprocess
            
        Returns:
            List[Dict]: List of dictionaries containing original and preprocessed texts
        """
        return [self.preprocess(text) for text in texts] 