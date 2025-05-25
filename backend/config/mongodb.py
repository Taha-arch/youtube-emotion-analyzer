from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_database():
    """
    Get MongoDB database instance with proper configuration
    """
    client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017'))
    return client.youtube_emotions

def setup_indexes(db):
    """
    Setup all required indexes for optimal performance
    """
    # Text index for search functionality
    db.comments.create_index([('text', 'text')])
    
    # Compound indexes for filtering and sorting
    db.comments.create_index([('videoId', 1), ('emotion', 1)])
    db.comments.create_index([('videoId', 1), ('publishedAt', -1)])
    db.comments.create_index([('videoId', 1), ('likeCount', -1)])
    db.comments.create_index([('videoId', 1), ('emotionConfidence', -1)])
    
    # Video collection indexes
    db.videos.create_index([('videoId', 1)], unique=True) 