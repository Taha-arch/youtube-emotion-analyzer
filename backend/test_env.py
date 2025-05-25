import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Try to read and print environment variables
print("YouTube API Key:", os.getenv('YOUTUBE_API_KEY'))
print("MongoDB URI:", os.getenv('MONGODB_URI'))
print("PORT:", os.getenv('PORT'))
print("NODE_ENV:", os.getenv('NODE_ENV')) 