from services.youtube_service import fetch_video_info, fetch_video_comments
from services.nlp_service import analyze_emotions
from config.mongodb import get_database
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_youtube_api():
    """Test YouTube API functionality"""
    try:
        video_id = "dQw4w9WgXcQ"  # Test with Rick Astley video
        print("\n1. Testing YouTube API Connection...")
        print(f"API Key present: {'YOUTUBE_API_KEY' in os.environ}")
        
        print("\n2. Testing Video Info Fetch...")
        video_info = fetch_video_info(video_id)
        print("Video Info Success!")
        print(f"Title: {video_info['title']}")
        
        print("\n3. Testing Comments Fetch...")
        comments = fetch_video_comments(video_id, max_comments=2)
        print("Comments Success!")
        print(f"Number of comments fetched: {len(comments)}")
        print(f"Sample comment: {comments[0]['text'][:100]}...")
        
        return True
    except Exception as e:
        print(f"YouTube API Error: {str(e)}")
        return False

def test_nlp_service():
    """Test NLP Service functionality"""
    try:
        print("\n4. Testing NLP Service...")
        test_comments = [
            {
                'commentId': 'test1',
                'text': 'This video is amazing! I love it so much!',
                'author': 'TestUser'
            }
        ]
        
        analyzed = analyze_emotions(test_comments)
        print("NLP Analysis Success!")
        print(f"Detected emotion: {analyzed[0]['emotion']}")
        print(f"Confidence: {analyzed[0]['emotionConfidence']}")
        
        return True
    except Exception as e:
        print(f"NLP Service Error: {str(e)}")
        return False

def test_mongodb():
    """Test MongoDB connection and operations"""
    try:
        print("\n5. Testing MongoDB Connection...")
        print(f"MongoDB URI present: {'MONGODB_URI' in os.environ}")
        
        db = get_database()
        print("Database connection successful!")
        
        # Test write operation
        test_doc = {
            'test_id': 'test1',
            'message': 'Test document'
        }
        result = db.test_collection.insert_one(test_doc)
        print("Write operation successful!")
        
        # Test read operation
        read_doc = db.test_collection.find_one({'test_id': 'test1'})
        print("Read operation successful!")
        
        # Cleanup
        db.test_collection.delete_one({'test_id': 'test1'})
        print("Cleanup successful!")
        
        return True
    except Exception as e:
        print(f"MongoDB Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("Starting endpoint tests...")
    
    youtube_success = test_youtube_api()
    nlp_success = test_nlp_service()
    mongodb_success = test_mongodb()
    
    print("\nTest Summary:")
    print(f"YouTube API Tests: {'✓ PASSED' if youtube_success else '✗ FAILED'}")
    print(f"NLP Service Tests: {'✓ PASSED' if nlp_success else '✗ FAILED'}")
    print(f"MongoDB Tests: {'✓ PASSED' if mongodb_success else '✗ FAILED'}") 