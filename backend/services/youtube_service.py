from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_youtube_client():
    """Get authenticated YouTube client."""
    api_key = os.getenv('YOUTUBE_API_KEY')
    if not api_key:
        raise ValueError("YouTube API key not found in environment variables")
    return build('youtube', 'v3', developerKey=api_key)

def fetch_video_info(video_id):
    """Fetch video information from YouTube."""
    try:
        youtube = get_youtube_client()
        response = youtube.videos().list(
            part='snippet,statistics',
            id=video_id
        ).execute()

        if not response.get('items'):
            raise ValueError('Video not found')

        video = response['items'][0]
        snippet = video['snippet']
        statistics = video['statistics']

        return {
            'videoId': video_id,
            'title': snippet['title'],
            'description': snippet['description'],
            'thumbnail': snippet['thumbnails']['high']['url'],
            'channelId': snippet['channelId'],
            'channelTitle': snippet['channelTitle'],
            'publishedAt': snippet['publishedAt'],
            'viewCount': int(statistics.get('viewCount', 0)),
            'likeCount': int(statistics.get('likeCount', 0)),
            'commentCount': int(statistics.get('commentCount', 0)),
        }
    except HttpError as e:
        raise Exception(f"YouTube API error: {str(e)}")

def fetch_video_comments(video_id, max_comments=100):
    """Fetch comments from YouTube."""
    try:
        youtube = get_youtube_client()
        comments = []
        next_page_token = None

        while True:
            request = youtube.commentThreads().list(
                part='snippet',
                videoId=video_id,
                maxResults=min(100, max_comments - len(comments)),
                pageToken=next_page_token,
                textFormat='plainText'
            )
            response = request.execute()

            for item in response['items']:
                comment = item['snippet']['topLevelComment']['snippet']
                comments.append({
                    'commentId': item['id'],
                    'text': comment['textDisplay'],
                    'author': comment['authorDisplayName'],
                    'authorChannelId': comment.get('authorChannelId', {}).get('value'),
                    'likeCount': comment.get('likeCount', 0),
                    'publishedAt': comment['publishedAt'],
                })

            next_page_token = response.get('nextPageToken')
            if not next_page_token or len(comments) >= max_comments:
                break

        return comments
    except HttpError as e:
        if "commentsDisabled" in str(e):
            raise Exception("Comments are disabled for this video")
        raise Exception(f"YouTube API error: {str(e)}") 