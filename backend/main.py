import ssl
import os
ssl._create_default_https_context = ssl._create_unverified_context
os.environ['CURL_CA_BUNDLE'] = ''
os.environ['REQUESTS_CA_BUNDLE'] = ''
os.environ['HF_HUB_DISABLE_SSL'] = '1'

from fastapi import FastAPI, HTTPException, Depends, status
from pydantic import BaseModel
from typing import List
import joblib
import os
import re
import json
import random
from googleapiclient.discovery import build
from dotenv import load_dotenv
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from collections import Counter
from sklearn.feature_extraction.text import CountVectorizer
import numpy as np
from datetime import datetime, timedelta
import asyncio
import resend
import schemas
import auth
from database import client, users_collection, history_collection
from hf_model import query_sentiment, query_emotion
from bson import ObjectId

# Load environment variables
load_dotenv(dotenv_path=Path(__file__).parent / '.env')

# ── Email configuration ─────────────────────────────────────────────────────
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
EMAIL_FROM = os.getenv("EMAIL_FROM", "onboarding@resend.dev")
ALLOW_EMAIL_OTP_FALLBACK = os.getenv("ALLOW_EMAIL_OTP_FALLBACK", "true").lower() == "true"

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

async def send_otp_email(to_email: str, code: str):
    if not RESEND_API_KEY:
        print(f"[EMAIL SKIPPED] OTP for {to_email}: {code}", flush=True)
        return {"email_sent": False, "reason": "resend_api_key_missing", "provider": "resend"}
    payload = {
        "from": EMAIL_FROM,
        "to": [to_email],
        "subject": "YT Vibe Check - Verify Your Email",
        "text": f"""Your verification code is: {code}

Valid for 10 minutes.
If you did not sign up, ignore this email.

- YT Vibe Check""",
    }
    # Resend SDK is sync; run in thread to keep endpoint non-blocking.
    await asyncio.to_thread(resend.Emails.send, payload)
    print(f"[EMAIL SENT] OTP to {to_email}", flush=True)
    return {"email_sent": True, "reason": None, "provider": "resend"}

app = FastAPI(title="YouTube Sentiment Analysis API")

def serialize_doc(doc):
    if doc:
        doc["id"] = str(doc.pop("_id"))
    return doc


@app.on_event("startup")
async def startup():
    ADMIN_EMAIL = "huzaifahnaseer377@gmail.com"
    try:
        await client.admin.command("ping")
        print("MongoDB Atlas connected successfully!", flush=True)
    except Exception as e:
        print(f"MongoDB connection failed: {e}", flush=True)

    await users_collection.update_many({}, {"$set": {"is_admin": False}})
    await users_collection.update_one(
        {"email": ADMIN_EMAIL},
        {"$set": {"is_admin": True}},
    )

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model and Vectorizer
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "sentiment_model.pkl")
VECTORIZER_PATH = os.path.join(BASE_DIR, "models", "tfidf_vectorizer.pkl")
HF_API_TOKEN = os.getenv("HF_API_TOKEN")

model = None
vectorizer = None

try:
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)
    print("Model and Vectorizer loaded successfully.", flush=True)
except Exception as e:
    print(f"Warning: Model/Vectorizer not found. Error: {e}", flush=True)

print(
    "[MODEL CHECK] "
    f"MODEL_PATH={MODEL_PATH} exists={os.path.exists(MODEL_PATH)} | "
    f"VECTORIZER_PATH={VECTORIZER_PATH} exists={os.path.exists(VECTORIZER_PATH)}",
    flush=True,
)
print(f"[HF CHECK] HF_API_TOKEN set={bool(HF_API_TOKEN)}", flush=True)

emotion_pipeline = None
try:
    # Optional local fallback; avoid top-level import so deploys without transformers still start (HF API is primary).
    from transformers import pipeline

    # Using top_k=1 to ensure consistent output shape
    emotion_pipeline = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base", top_k=1)
    print("Emotion pipeline loaded successfully", flush=True)
except Exception as e:
    print(f"Warning: Emotion pipeline not loaded. Error: {e}", flush=True)

# YouTube API Setup
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)

class AnalysisRequest(BaseModel):
    video_url: str

class CompareRequest(BaseModel):
    url1: str
    url2: str

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

def is_spam_or_bot(text: str, seen_comments: set) -> bool:
    """Returns True if comment should be filtered out."""
    # Filter: contains URL
    if re.search(r'http://|https://|www\.', text, re.IGNORECASE):
        return True
    
    # Filter: exact duplicate
    lower = text.strip().lower()
    if lower in seen_comments:
        return True
    seen_comments.add(lower)
    
    # Filter: less than 3 words
    words = text.strip().split()
    if len(words) < 3:
        return True
    
    # Filter: only emojis/no alphabets
    if not re.search(r'[a-zA-Z]', text):
        return True
    
    # Filter: all caps and longer than 5 words
    alpha_text = re.sub(r'[^a-zA-Z\s]', '', text).strip()
    alpha_words = alpha_text.split()
    if len(alpha_words) > 5 and alpha_text == alpha_text.upper() and alpha_text.replace(' ', '').isalpha():
        return True
    
    return False

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
    word_sentiments = {}  # Store aggregate sentiment for coloring

    for item in comments_data:
        cleaned = clean_text(item['text'])
        # Filter out empty strings and very short words (len > 2)
        words = [w for w in cleaned.split() if len(w) > 2]
        sentiment = item['sentiment']
        for word in words:
            word_scores[word] += 1
            if word not in word_sentiments:
                word_sentiments[word] = {'Positive': 0, 'Negative': 0, 'Neutral': 0}
            word_sentiments[word][sentiment] += 1

    # Format for frontend
    cloud_data = []
    for word, count in word_scores.most_common(50):
        sents = word_sentiments[word]
        dominant = 'neutral'
        if sents['Positive'] > sents['Negative'] and sents['Positive'] > sents['Neutral']:
            dominant = 'positive'
        elif sents['Negative'] > sents['Positive'] and sents['Negative'] > sents['Neutral']:
            dominant = 'negative'

        cloud_data.append({
            "text": word,
            "value": count * 10,  # Scale for visualization
            "sentiment": dominant
        })

    # Fallback: if all words were filtered out, use top-10 raw tokens
    if not cloud_data:
        raw_counts = Counter()
        for item in comments_data:
            raw_counts.update(item['text'].lower().split())
        for word, count in raw_counts.most_common(10):
            cloud_data.append({"text": word, "value": count * 10, "sentiment": "neutral"})

    print("WORDCLOUD DATA:", cloud_data[:5], flush=True)
    return cloud_data

# AUTH ENDPOINTS
@app.post("/api/signup")
async def signup(user: schemas.UserCreate):
    ADMIN_EMAIL = "huzaifahnaseer377@gmail.com"
    db_user = await users_collection.find_one({"email": user.email})

    if db_user:
        if db_user.get("is_verified"):
            raise HTTPException(status_code=400, detail="Email already registered and verified. Please log in.")
        # Unverified — refresh OTP and resend
        code = str(random.randint(100000, 999999))
        await users_collection.update_one(
            {"email": user.email},
            {"$set": {
                "verification_code": code,
                "verification_expires": datetime.utcnow() + timedelta(minutes=10),
                "hashed_password": auth.get_password_hash(user.password),
            }},
        )
    else:
        # New user
        hashed_pw = auth.get_password_hash(user.password)
        code = str(random.randint(100000, 999999))
        expires = datetime.utcnow() + timedelta(minutes=10)
        new_user = {
            "email": user.email,
            "hashed_password": hashed_pw,
            "created_at": datetime.utcnow(),
            "is_admin": (user.email == ADMIN_EMAIL),
            "is_verified": False,
            "verification_code": code,
            "verification_expires": expires,
        }
        await users_collection.insert_one(new_user)

    # Try to send email
    try:
        email_status = await send_otp_email(user.email, code)
    except Exception as e:
        print(f"[EMAIL FAILED] Error: {e}", flush=True)
        if ALLOW_EMAIL_OTP_FALLBACK:
            return {
                "message": "Email service unavailable. Use fallback verification code.",
                "email": user.email,
                "dev_code": code,
                "email_sent": False,
                "email_reason": "provider_error",
            }
        raise HTTPException(status_code=500, detail="Failed to send verification email. Please try again.")

    if not email_status["email_sent"] and ALLOW_EMAIL_OTP_FALLBACK:
        return {
            "message": "Email service unavailable. Use fallback verification code.",
            "email": user.email,
            "dev_code": code,
            "email_sent": False,
            "email_reason": email_status["reason"],
        }

    return {
        "message": "Verification code sent",
        "email": user.email,
        "email_sent": True,
        "email_reason": None,
    }

@app.post("/api/verify-email", response_model=schemas.Token)
async def verify_email(payload: schemas.VerifyEmailRequest):
    user = await users_collection.find_one({"email": payload.email})
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    if not user.get("verification_code") or user.get("verification_code") != payload.code:
        raise HTTPException(status_code=400, detail="Invalid or expired code")
    if user.get("verification_expires") and datetime.utcnow() > user.get("verification_expires"):
        raise HTTPException(status_code=400, detail="Invalid or expired code")

    await users_collection.update_one(
        {"email": payload.email},
        {"$set": {"is_verified": True}, "$unset": {"verification_code": "", "verification_expires": ""}},
    )

    access_token = auth.create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/resend-code")
async def resend_code(payload: schemas.ResendCodeRequest):
    user = await users_collection.find_one({"email": payload.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.get("is_verified"):
        raise HTTPException(status_code=400, detail="Account already verified")

    code = str(random.randint(100000, 999999))
    await users_collection.update_one(
        {"email": payload.email},
        {"$set": {"verification_code": code, "verification_expires": datetime.utcnow() + timedelta(minutes=10)}},
    )

    try:
        email_status = await send_otp_email(user["email"], code)
        if not email_status["email_sent"] and ALLOW_EMAIL_OTP_FALLBACK:
            return {
                "message": "Email service unavailable. Use fallback verification code.",
                "email": user["email"],
                "dev_code": code,
                "email_sent": False,
                "email_reason": email_status["reason"],
            }
        return {
            "message": "New code sent",
            "email_sent": True,
            "email_reason": None,
        }
    except Exception as e:
        print(f"[EMAIL FAILED] Resend error: {e}", flush=True)
        if ALLOW_EMAIL_OTP_FALLBACK:
            return {
                "message": "Email service unavailable. Use fallback verification code.",
                "email": user["email"],
                "dev_code": code,
                "email_sent": False,
                "email_reason": "provider_error",
            }
        raise HTTPException(status_code=500, detail="Failed to resend verification email. Please try again.")

@app.post("/api/login", response_model=schemas.Token)
async def login(user_credentials: schemas.UserLogin):
    user = await users_collection.find_one({"email": user_credentials.email})
    if not user:
        raise HTTPException(status_code=403, detail="Invalid Credentials")
    
    if not auth.verify_password(user_credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=403, detail="Invalid Credentials")
    
    access_token = auth.create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/users/me", response_model=schemas.UserOut)
async def get_me(current_user: dict = Depends(auth.get_current_user)):
    return current_user

@app.get("/api/history", response_model=List[schemas.AnalysisHistoryOut])
async def get_history(current_user: dict = Depends(auth.get_current_user)):
    cursor = history_collection.find({"user_id": str(current_user["id"])}).sort("analyzed_at", -1)
    histories = await cursor.to_list(length=100)
    return [serialize_doc(h) for h in histories]

@app.delete("/api/history/{analysis_id}")
async def delete_analysis(analysis_id: str, current_user: dict = Depends(auth.get_current_user)):
    if not ObjectId.is_valid(analysis_id):
        raise HTTPException(status_code=400, detail="Invalid analysis ID")

    delete_result = await history_collection.delete_one(
        {"_id": ObjectId(analysis_id), "user_id": str(current_user["id"])}
    )
    if delete_result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Analysis record not found or unauthorized")

    return {"message": "Deleted successfully"}

# ADMIN ENDPOINTS
def require_admin(current_user: dict = Depends(auth.get_current_user)):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@app.get("/api/admin/users")
async def admin_get_users(admin: dict = Depends(require_admin)):
    users = await users_collection.find({}).sort("created_at", 1).to_list(length=1000)
    result = []
    for u in users:
        count = await history_collection.count_documents({"user_id": str(u["_id"])})
        result.append({
            "id": str(u["_id"]),
            "email": u.get("email"),
            "created_at": u.get("created_at"),
            "is_admin": u.get("is_admin", False),
            "analysis_count": count
        })
    return result

@app.get("/api/admin/stats")
async def admin_get_stats(admin: dict = Depends(require_admin)):
    total_users = await users_collection.count_documents({})
    total_analyses = await history_collection.count_documents({})
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_count = await history_collection.count_documents({"analyzed_at": {"$gte": today_start}})
    return {
        "total_users": total_users,
        "total_analyses": total_analyses,
        "today_count": today_count
    }

def process_sentiments_and_emotions(comments, cleaned_comments):
    BATCH_SIZE = 20  # HF API batch limit
    
    # Sentiment in batches
    all_sentiments = []
    for i in range(0, len(cleaned_comments), BATCH_SIZE):
        batch = cleaned_comments[i:i+BATCH_SIZE]
        results = query_sentiment(batch)
        if results:
            all_sentiments.extend(results)
        elif model is not None and vectorizer is not None:
            # Fallback to old pkl model for this batch
            batch_features = vectorizer.transform(batch)
            batch_probs = model.predict_proba(batch_features)
            batch_preds = model.predict(batch_features)
            for j in range(len(batch)):
                max_prob = np.max(batch_probs[j])
                if max_prob < 0.65:
                    label = "Neutral"
                elif batch_preds[j] == 1:
                    label = "Positive"
                else:
                    label = "Negative"
                all_sentiments.append({"label": label, "score": float(max_prob)})
        else:
            # Last-resort fallback when neither HF nor local model is available.
            all_sentiments.extend(
                [{"label": "Neutral", "score": 0.0} for _ in batch]
            )

    # Emotion in batches
    all_emotions = []
    for i in range(0, len(cleaned_comments), BATCH_SIZE):
        batch = cleaned_comments[i:i+BATCH_SIZE]
        results = query_emotion(batch)
        if results:
            all_emotions.extend(results)
        else:
            # fallback to emotion pipeline or neutral
            fallback_emotions = []
            for c in batch:
                if emotion_pipeline:
                    try:
                        emo_result = emotion_pipeline(c[:512])
                        emo = emo_result[0][0]['label'] if isinstance(emo_result[0], list) else emo_result[0]['label']
                    except Exception:
                        emo = "neutral"
                else:
                    emo = "neutral"
                fallback_emotions.append(emo)
            all_emotions.extend(fallback_emotions)

    positive_count = 0
    negative_count = 0
    neutral_count = 0
    emotion_counts = Counter()

    for i, comment in enumerate(comments):
        sentiment = all_sentiments[i]["label"]
        comment['sentiment'] = sentiment
        if sentiment == "Positive":
            positive_count += 1
        elif sentiment == "Negative":
            negative_count += 1
        else:
            neutral_count += 1

        emotion = all_emotions[i]
        comment['emotion'] = emotion
        emotion_counts[emotion] += 1
        
    return positive_count, negative_count, neutral_count, emotion_counts

@app.post("/analyze")
async def analyze_sentiment(
    request: AnalysisRequest, 
    current_user: dict = Depends(auth.get_optional_current_user)
):
    has_local_model = model is not None and vectorizer is not None
    has_hf_token = bool(HF_API_TOKEN)
    if not has_local_model and not has_hf_token:
        raise HTTPException(
            status_code=503,
            detail=(
                "No inference backend available. "
                "Set HF_API_TOKEN or provide local model files in backend/models."
            ),
        )

    video_id = get_video_id(request.video_url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")

    # Save URL early before 'request' variable could be overwritten
    request_data_url = request.video_url

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
        raw_comments = []
        next_page_token = None
        
        # Fetch up to 200 comments for better analysis
        while len(raw_comments) < 200:
            yt_request = youtube.commentThreads().list(
                part="snippet",
                videoId=video_id,
                maxResults=100,
                pageToken=next_page_token,
                textFormat="plainText"
            )
            yt_response = yt_request.execute()
            print("Comments fetched successfully", flush=True)
            
            for item in yt_response['items']:
                snippet = item['snippet']['topLevelComment']['snippet']
                raw_comments.append({
                    "text": snippet['textDisplay'],
                    "author": snippet['authorDisplayName'],
                    "publishedAt": snippet['publishedAt']
                })
            
            next_page_token = yt_response.get('nextPageToken')
            if not next_page_token:
                break

        if not raw_comments:
             print("No comments found", flush=True)
             return {"message": "No comments found", "stats": {}}

        # 3. Apply Spam/Bot Filter
        seen = set()
        comments = []
        filtered_count = 0
        for c in raw_comments:
            if is_spam_or_bot(c['text'], seen):
                filtered_count += 1
            else:
                comments.append(c)

        print(f"Filtered {filtered_count} spam/bot comments. Analyzing {len(comments)}", flush=True)

        if not comments:
            return {"message": "All comments were filtered as spam/bot", "filtered_count": filtered_count, "stats": {}}

        # 4. Analyze Sentiment (with HF API)
        print(f"Analyzing {len(comments)} comments", flush=True)
        cleaned_comments = [clean_text(c['text']) for c in comments]
        print("Comments cleaned", flush=True)

        positive_count, negative_count, neutral_count, emotion_counts = process_sentiments_and_emotions(comments, cleaned_comments)

        total_analyzed = len(comments)
        
        # 5. Generate Stats
        sentiment_score = (positive_count - negative_count) / total_analyzed
        polarity_index = (positive_count + negative_count) / total_analyzed 
        
        sentiment_distribution = {
            "positive": round((positive_count / total_analyzed) * 100, 1),
            "negative": round((negative_count / total_analyzed) * 100, 1),
            "neutral": round((neutral_count / total_analyzed) * 100, 1)
        }

        emotion_distribution = {}
        for emo in ['anger', 'disgust', 'fear', 'joy', 'neutral', 'sadness', 'surprise']:
            emotion_distribution[emo] = round((emotion_counts[emo] / total_analyzed) * 100, 1) if total_analyzed > 0 else 0

        toxic_percentage = round(emotion_distribution.get('anger', 0) + emotion_distribution.get('disgust', 0), 1)

        # 6. Generate Visualizations
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

        result = {
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
            "emotion_distribution": emotion_distribution,
            "toxic_percentage": toxic_percentage,
            "trend_data": trend_data,
            "word_cloud_data": word_cloud_data,
            "ngram_data": ngram_data,
            "comments": comments,
            "filtered_count": filtered_count,
            "total_fetched": len(raw_comments)
        }

        # Step 7: Save to History if user is logged in
        print(f"SAVING ANALYSIS FOR USER: {current_user['id'] if current_user else 'ANONYMOUS'}", flush=True)
        if current_user:
            try:
                history_doc = {
                    "user_id": str(current_user["id"]),
                    "video_url": request_data_url,
                    "video_title": video_title,
                    "results_json": json.dumps(result),
                    "analyzed_at": datetime.utcnow(),
                }
                await history_collection.insert_one(history_doc)
                print(f"Analysis saved for user: {current_user['email']}", flush=True)
            except Exception as e:
                print(f"Error saving history: {e}", flush=True)

        return result

    except Exception as e:
        print(f"Error: {e}", flush=True)
        raise HTTPException(status_code=500, detail=str(e))

async def analyze_video_url(video_url: str):
    """Core analysis logic — reusable helper for both /analyze and /api/compare."""
    has_local_model = model is not None and vectorizer is not None
    has_hf_token = bool(HF_API_TOKEN)
    if not has_local_model and not has_hf_token:
        raise HTTPException(
            status_code=503,
            detail=(
                "No inference backend available. "
                "Set HF_API_TOKEN or provide local model files in backend/models."
            ),
        )

    video_id = get_video_id(video_url)
    if not video_id:
        raise ValueError(f"Invalid YouTube URL: {video_url}")

    print(f"Processing video_id: {video_id}", flush=True)

    # 1. Fetch Video Details
    vid_request = youtube.videos().list(part="snippet,statistics", id=video_id)
    vid_response = vid_request.execute()
    if not vid_response['items']:
        raise ValueError(f"Video not found: {video_url}")

    vid_details = vid_response['items'][0]
    video_title = vid_details['snippet']['title']
    channel_title = vid_details['snippet']['channelTitle']
    thumbnail = vid_details['snippet']['thumbnails']['high']['url']
    total_comments_api = int(vid_details['statistics'].get('commentCount', 0))

    # 2. Fetch Comments
    raw_comments = []
    next_page_token = None
    while len(raw_comments) < 200:
        req = youtube.commentThreads().list(
            part="snippet",
            videoId=video_id,
            maxResults=100,
            pageToken=next_page_token,
            textFormat="plainText"
        )
        resp = req.execute()
        for item in resp['items']:
            snippet = item['snippet']['topLevelComment']['snippet']
            raw_comments.append({
                "text": snippet['textDisplay'],
                "author": snippet['authorDisplayName'],
                "publishedAt": snippet['publishedAt']
            })
        next_page_token = resp.get('nextPageToken')
        if not next_page_token:
            break

    if not raw_comments:
        raise ValueError(f"No comments found for video: {video_url}")

    # Apply spam filter
    seen = set()
    comments = []
    filtered_count = 0
    for c in raw_comments:
        if is_spam_or_bot(c['text'], seen):
            filtered_count += 1
        else:
            comments.append(c)

    if not comments:
        raise ValueError("All comments filtered as spam/bot")

    # 3. Sentiment Analysis (with HF API)
    cleaned_comments = [clean_text(c['text']) for c in comments]
    
    positive_count, negative_count, neutral_count, emotion_counts = process_sentiments_and_emotions(comments, cleaned_comments)

    total_analyzed = len(comments)
    sentiment_score = (positive_count - negative_count) / total_analyzed
    polarity_index = (positive_count + negative_count) / total_analyzed

    sentiment_distribution = {
        "positive": round((positive_count / total_analyzed) * 100, 1),
        "negative": round((negative_count / total_analyzed) * 100, 1),
        "neutral": round((neutral_count / total_analyzed) * 100, 1),
    }
    emotion_distribution = {}
    for emo in ['anger', 'disgust', 'fear', 'joy', 'neutral', 'sadness', 'surprise']:
        emotion_distribution[emo] = round((emotion_counts[emo] / total_analyzed) * 100, 1) if total_analyzed > 0 else 0

    toxic_percentage = round(emotion_distribution.get('anger', 0) + emotion_distribution.get('disgust', 0), 1)

    word_cloud_data = generate_word_cloud(comments)
    ngram_data = generate_ngrams(cleaned_comments, n=2, top_k=8)

    chunk_size = max(total_analyzed // 10, 1)
    trend_data = []
    for i in range(0, total_analyzed, chunk_size):
        chunk = comments[i:i + chunk_size]
        chunk_pos = sum(1 for c in chunk if c['sentiment'] == 'Positive')
        chunk_total = len(chunk)
        trend_data.append({
            "time": chunk[0]['publishedAt'][11:16],
            "positive": round((chunk_pos / chunk_total) * 100, 1),
            "negative": round(((chunk_total - chunk_pos) / chunk_total) * 100, 1),
        })
    trend_data.reverse()

    return {
        "video_info": {
            "title": video_title,
            "channel": channel_title,
            "thumbnail": thumbnail,
            "total_comments": total_comments_api,
        },
        "kpi": {
            "sentiment_score": round(sentiment_score, 2),
            "polarity_index": round(polarity_index, 2),
        },
        "sentiment_distribution": sentiment_distribution,
        "emotion_distribution": emotion_distribution,
        "toxic_percentage": toxic_percentage,
        "trend_data": trend_data,
        "word_cloud_data": word_cloud_data,
        "ngram_data": ngram_data,
        "comments": comments,
        "filtered_count": filtered_count,
        "total_fetched": len(raw_comments),
    }


@app.post("/api/compare")
async def compare_videos(
    request: CompareRequest,
    current_user: dict = Depends(auth.get_optional_current_user)
):
    """Analyze two YouTube videos independently and return side-by-side results."""
    result = {}
    errors = {}

    # Analyze video 1
    try:
        result["video1"] = await analyze_video_url(request.url1)
    except Exception as e:
        print(f"Video 1 error: {e}", flush=True)
        errors["video1"] = str(e)
        result["video1"] = None

    # Analyze video 2
    try:
        result["video2"] = await analyze_video_url(request.url2)
    except Exception as e:
        print(f"Video 2 error: {e}", flush=True)
        errors["video2"] = str(e)
        result["video2"] = None

    if errors:
        result["errors"] = errors

    # If both failed, return 400
    if result["video1"] is None and result["video2"] is None:
        raise HTTPException(
            status_code=400,
            detail=f"Both videos failed to analyze. Errors: {errors}"
        )

    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
