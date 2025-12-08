from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import os
import re
from googleapiclient.discovery import build
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from collections import Counter
from sklearn.feature_extraction.text import CountVectorizer
import numpy as np
from datetime import datetime

# Load environment variables
load_dotenv()

app = FastAPI(title="YouTube Sentiment Analysis API")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model and Vectorizer
# Load Model and Vectorizer
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "sentiment_model.pkl")
VECTORIZER_PATH = os.path.join(BASE_DIR, "models", "tfidf_vectorizer.pkl")

model = None
vectorizer = None

try:
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)
    print("Model and Vectorizer loaded successfully.", flush=True)
except Exception as e:
    print(f"Warning: Model/Vectorizer not found. Error: {e}", flush=True)

# YouTube API Setup
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)

class AnalysisRequest(BaseModel):
    video_url: str

def get_video_id(url):
    """Extracts Video ID from YouTube URL"""
    patterns = [
        r'(?:v=|\/)([0-9A-Za-z_-]{11}).*',
        r'(?:youtu\.be\/)([0-9A-Za-z_-]{11})',
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def clean_text(text):
    text = text.lower()
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    text = re.sub(r'@\w+', '', text)
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def generate_ngrams(texts, n=2, top_k=10):
    """Generate top N-grams from a list of texts"""
    if not texts:
        return []
    try:
        c_vec = CountVectorizer(ngram_range=(n, n), stop_words='english')
        ngrams = c_vec.fit_transform(texts)
        count_values = ngrams.toarray().sum(axis=0)
        vocab = c_vec.vocabulary_
        ngram_counts = sorted([(count_values[i], k) for k, i in vocab.items()], reverse=True)
        return [{"text": k, "count": int(v)} for v, k in ngram_counts[:top_k]]
    except ValueError:
        return []

def generate_word_cloud(comments_data):
    """Generate word cloud data weighted by frequency and sentiment"""
    word_scores = Counter()
    word_sentiments = {} # Store aggregate sentiment for coloring

    for item in comments_data:
        words = clean_text(item['text']).split()
        sentiment = item['sentiment']
        for word in words:
            if len(word) > 3: # Skip short words
                word_scores[word] += 1
                if word not in word_sentiments:
                    word_sentiments[word] = {'Positive': 0, 'Negative': 0}
                word_sentiments[word][sentiment] += 1
    
    # Format for frontend
    cloud_data = []
    for word, count in word_scores.most_common(50):
        # Determine dominant sentiment for the word
        sents = word_sentiments[word]
        dominant = 'neutral'
        if sents['Positive'] > sents['Negative']:
            dominant = 'positive'
        elif sents['Negative'] > sents['Positive']:
            dominant = 'negative'
            
        cloud_data.append({
            "text": word,
            "value": count * 10, # Scale for visualization
            "sentiment": dominant
        })
    return cloud_data

@app.post("/analyze")
async def analyze_sentiment(request: AnalysisRequest):
    if not model or not vectorizer:
        raise HTTPException(status_code=503, detail="Model not loaded")

    video_id = get_video_id(request.video_url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    try:
        print(f"Processing video_id: {video_id}", flush=True)
        # 1. Fetch Video Details
        vid_request = youtube.videos().list(
            part="snippet,statistics",
            id=video_id
        )
        vid_response = vid_request.execute()
        if not vid_response['items']:
            raise HTTPException(status_code=404, detail="Video not found")
            
        vid_details = vid_response['items'][0]
        video_title = vid_details['snippet']['title']
        channel_title = vid_details['snippet']['channelTitle']
        thumbnail = vid_details['snippet']['thumbnails']['high']['url']
        total_comments_api = int(vid_details['statistics'].get('commentCount', 0))

        # 2. Fetch Comments
        comments = []
        next_page_token = None
        
        # Fetch up to 200 comments for better analysis
        while len(comments) < 200:
            request = youtube.commentThreads().list(
                part="snippet",
                videoId=video_id,
                maxResults=100,
                pageToken=next_page_token,
                textFormat="plainText"
            )
            response = request.execute()
            print("Comments fetched successfully", flush=True)
            
            for item in response['items']:
                snippet = item['snippet']['topLevelComment']['snippet']
                comments.append({
                    "text": snippet['textDisplay'],
                    "author": snippet['authorDisplayName'],
                    "publishedAt": snippet['publishedAt']
                })
            
            next_page_token = response.get('nextPageToken')
            if not next_page_token:
                break

        if not comments:
             print("No comments found", flush=True)
             return {"message": "No comments found", "stats": {}}

        # 3. Analyze Sentiment
        print(f"Analyzing {len(comments)} comments", flush=True)
        cleaned_comments = [clean_text(c['text']) for c in comments]
        print("Comments cleaned", flush=True)
        tfidf_features = vectorizer.transform(cleaned_comments)
        print("Vectorization complete", flush=True)
        predictions = model.predict(tfidf_features)
        print("Prediction complete", flush=True)

        # Attach sentiment to comments
        positive_count = 0
        negative_count = 0
        
        for i, comment in enumerate(comments):
            sentiment = "Positive" if predictions[i] == 1 else "Negative"
            comment['sentiment'] = sentiment
            if sentiment == "Positive":
                positive_count += 1
            else:
                negative_count += 1

        total_analyzed = len(comments)
        
        # 4. Generate Stats
        sentiment_score = (positive_count - negative_count) / total_analyzed
        polarity_index = (positive_count + negative_count) / total_analyzed 
        
        sentiment_distribution = {
            "positive": round((positive_count / total_analyzed) * 100, 1),
            "negative": round((negative_count / total_analyzed) * 100, 1),
            "neutral": 0 
        }

        # 5. Generate Visualizations
        word_cloud_data = generate_word_cloud(comments)
        ngram_data = generate_ngrams(cleaned_comments, n=2, top_k=8)
        
        # Simple trend simulation based on fetched order
        chunk_size = max(len(comments) // 10, 1)
        trend_data = []
        for i in range(0, len(comments), chunk_size):
            chunk = comments[i:i+chunk_size]
            chunk_pos = sum(1 for c in chunk if c['sentiment'] == 'Positive')
            chunk_total = len(chunk)
            timestamp = chunk[0]['publishedAt'][11:16] # Extract HH:MM
            trend_data.append({
                "time": timestamp,
                "positive": round((chunk_pos / chunk_total) * 100, 1),
                "negative": round(((chunk_total - chunk_pos) / chunk_total) * 100, 1)
            })
        trend_data.reverse() 

        return {
            "video_info": {
                "title": video_title,
                "channel": channel_title,
                "thumbnail": thumbnail,
                "total_comments": total_comments_api
            },
            "kpi": {
                "sentiment_score": round(sentiment_score, 2),
                "polarity_index": round(polarity_index, 2)
            },
            "sentiment_distribution": sentiment_distribution,
            "trend_data": trend_data,
            "word_cloud_data": word_cloud_data,
            "ngram_data": ngram_data
        }

    except Exception as e:
        print(f"Error: {e}", flush=True)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
