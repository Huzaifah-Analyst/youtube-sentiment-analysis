from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import os
import re
from googleapiclient.discovery import build
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

app = FastAPI(title="YouTube Sentiment Analysis API")

# CORS Setup (Allow Frontend to connect)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model and Vectorizer
MODEL_PATH = "sentiment_model.pkl"
VECTORIZER_PATH = "tfidf_vectorizer.pkl"

model = None
vectorizer = None

try:
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)
    print("Model and Vectorizer loaded successfully.")
except Exception as e:
    print(f"Warning: Model/Vectorizer not found. Make sure to train the model first. Error: {e}")

# YouTube API Setup
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)

class AnalysisRequest(BaseModel):
    video_url: str

def get_video_id(url):
    """Extracts Video ID from YouTube URL"""
    video_id = None
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
    # Simple cleaning for inference (must match training preprocessing)
    text = text.lower()
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    text = re.sub(r'@\w+', '', text)
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

@app.post("/analyze")
async def analyze_sentiment(request: AnalysisRequest):
    if not model or not vectorizer:
        raise HTTPException(status_code=503, detail="Model not loaded")

    video_id = get_video_id(request.video_url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    try:
        print(f"Processing video_id: {video_id}")
        # Fetch Comments
        request = youtube.commentThreads().list(
            part="snippet",
            videoId=video_id,
            maxResults=100, # Fetch top 100 comments
            textFormat="plainText"
        )
        response = request.execute()
        print("Comments fetched successfully")

        comments = []
        for item in response['items']:
            comment = item['snippet']['topLevelComment']['snippet']['textDisplay']
            author = item['snippet']['topLevelComment']['snippet']['authorDisplayName']
            comments.append({"text": comment, "author": author})

        if not comments:
             print("No comments found")
             return {"message": "No comments found for this video.", "stats": {}}

        # Analyze Sentiment
        print(f"Analyzing {len(comments)} comments")
        cleaned_comments = [clean_text(c['text']) for c in comments]
        print("Comments cleaned")
        tfidf_features = vectorizer.transform(cleaned_comments)
        print("Vectorization complete")
        predictions = model.predict(tfidf_features)
        print("Prediction complete")

        # Aggregate Results
        positive_count = sum(predictions) # Assuming 1 is Positive
        negative_count = len(predictions) - positive_count
        total = len(predictions)

        results = []
        for i, comment in enumerate(comments):
            sentiment = "Positive" if predictions[i] == 1 else "Negative"
            results.append({
                "author": comment['author'],
                "text": comment['text'],
                "sentiment": sentiment
            })

        return {
            "video_id": video_id,
            "total_comments": total,
            "stats": {
                "positive": positive_count,
                "negative": negative_count,
                "positive_pct": round((positive_count / total) * 100, 2),
                "negative_pct": round((negative_count / total) * 100, 2)
            },
            "comments": results
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "YouTube Sentiment Analysis API is running"}
