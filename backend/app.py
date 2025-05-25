from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import traceback
from datetime import datetime
from bson import json_util
from services.youtube_service import fetch_video_info, fetch_video_comments
from services.nlp_service import analyze_emotions
from config.mongodb import get_database, setup_indexes
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Configure CORS to allow requests from frontend
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://localhost:5173"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# MongoDB connection
db = get_database()

def serialize_mongo_doc(doc):
    """Convert MongoDB document to JSON-serializable format."""
    if doc is None:
        return None
    if isinstance(doc, dict):
        # Remove _id field and handle any nested documents
        doc.pop('_id', None)
        return {k: serialize_mongo_doc(v) for k, v in doc.items()}
    if isinstance(doc, list):
        return [serialize_mongo_doc(item) for item in doc]
    return doc

def save_video(video_data):
    """Save or update video information in MongoDB."""
    try:
        video_data['lastAnalyzed'] = datetime.utcnow()
        return db.videos.update_one(
            {'videoId': video_data['videoId']},
            {'$set': video_data},
            upsert=True
        )
    except Exception as e:
        print(f"Error saving video: {str(e)}")
        traceback.print_exc()
        raise

def save_comments(video_id, comments):
    try:
        if not comments:
            print("No comments to save")
            return

        # Add videoId to each comment
        for comment in comments:
            comment['videoId'] = video_id

        # Insert comments one by one instead of bulk write
        for comment in comments:
            db.comments.update_one(
                {'commentId': comment['commentId']},
                {'$set': comment},
                upsert=True
            )
        print(f"Successfully saved {len(comments)} comments")
    except Exception as e:
        print(f"Error saving comments: {str(e)}")
        traceback.print_exc()
        raise e

def get_video(video_id):
    try:
        return db.videos.find_one({'videoId': video_id})
    except Exception as e:
        print(f"Error getting video: {str(e)}")
        return None

def get_video_comments(video_id, page=1, limit=10, sort_by='publishedAt', emotion=None):
    """Retrieve comments with pagination and filtering."""
    try:
        query = {'videoId': video_id}
        
        if emotion:
            query['emotion'] = emotion

        sort_order = -1 if sort_by in ['publishedAt', 'likeCount', 'emotionConfidence'] else 1
        
        # If limit is 0 or negative, return all comments
        if limit <= 0:
            comments = list(db.comments.find(
                query,
                {'_id': 0}  # Exclude _id field
            ).sort(sort_by, sort_order))
            total = len(comments)
            return {
                'comments': comments,
                'total': total,
                'page': 1,
                'totalPages': 1
            }
        
        # Otherwise, use pagination
        skip = (page - 1) * limit
        comments = list(db.comments.find(
            query,
            {'_id': 0}  # Exclude _id field
        ).sort(sort_by, sort_order).skip(skip).limit(limit))

        total = db.comments.count_documents(query)
        
        return {
            'comments': comments,
            'total': total,
            'page': page,
            'totalPages': (total + limit - 1) // limit
        }
    except Exception as e:
        print(f"Error getting comments: {str(e)}")
        traceback.print_exc()
        raise

def get_emotion_stats(video_id):
    """Get emotion statistics for a video."""
    try:
        pipeline = [
            {'$match': {'videoId': video_id}},
            {
                '$group': {
                    '_id': '$emotion',
                    'count': {'$sum': 1},
                    'avgConfidence': {'$avg': '$emotionConfidence'}
                }
            }
        ]
        
        stats = db.comments.aggregate(pipeline)
        return {stat['_id']: {'count': stat['count'], 'avgConfidence': stat['avgConfidence']} 
                for stat in stats}
    except Exception as e:
        print(f"Error getting emotion stats: {str(e)}")
        traceback.print_exc()
        raise

@app.route('/comments', methods=['GET'])
def get_comments():
    try:
        video_id = request.args.get('videoId')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        sort_by = request.args.get('sortBy', 'publishedAt')
        emotion = request.args.get('emotion')

        if not video_id:
            return jsonify({'error': 'Video ID is required'}), 400

        print(f"Processing request for video ID: {video_id}")

        # Check if we already have this video's data
        video = get_video(video_id)
        print(f"Retrieved video from DB: {video is not None}")

        if not video:
            print("Video not found in database, fetching from YouTube...")
            # Fetch new data from YouTube
            video = fetch_video_info(video_id)
            print(f"Fetched video info: {video['title']}")
            save_video(video)

        # Always fetch and analyze new comments
        print("Fetching fresh comments from YouTube...")
        youtube_comments = fetch_video_comments(video_id)
        print(f"Fetched {len(youtube_comments)} comments from YouTube")
        if youtube_comments:
            print("Sample comment:", youtube_comments[0])
            
            analyzed_comments = analyze_emotions(youtube_comments)
            print(f"Analyzed {len(analyzed_comments)} comments")
            if analyzed_comments:
                print("Sample analyzed comment:", analyzed_comments[0])
            
            save_comments(video_id, analyzed_comments)

        # Get comments from database with pagination and filtering
        result = get_video_comments(
            video_id,
            page=page,
            limit=limit,
            sort_by=sort_by,
            emotion=emotion
        )
        print(f"Retrieved {len(result['comments'])} comments from database")

        # Get emotion statistics
        emotion_stats = get_emotion_stats(video_id)
        print(f"Emotion stats: {emotion_stats}")

        response_data = {
            'videoInfo': video,
            'comments': result['comments'],
            'pagination': {
                'page': result['page'],
                'totalPages': result['totalPages'],
                'total': result['total']
            },
            'emotionStats': emotion_stats
        }

        print(f"Sending response with {len(result['comments'])} comments")
        return app.response_class(
            response=json_util.dumps(response_data),
            status=200,
            mimetype='application/json'
        )

    except Exception as e:
        print(f"Error processing request: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/search', methods=['GET'])
def search_comments():
    try:
        video_id = request.args.get('videoId')
        query = request.args.get('query')

        if not video_id or not query:
            return jsonify({'error': 'Video ID and search query are required'}), 400

        # Search comments using MongoDB text search
        comments = list(db.comments.find({
            'videoId': video_id,
            'text': {'$regex': query, '$options': 'i'}
        }, {'_id': 0}))  # Exclude _id field

        return jsonify({'comments': serialize_mongo_doc(comments)})

    except Exception as e:
        print(f"Error in search: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Setup database indexes
    setup_indexes(db)
    
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)