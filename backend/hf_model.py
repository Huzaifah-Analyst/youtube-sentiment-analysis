import requests
import os
import time

from dotenv import load_dotenv
from pathlib import Path

# Load .env from same directory as this file
load_dotenv(dotenv_path=Path(__file__).parent / '.env')

HF_API_TOKEN = os.getenv("HF_API_TOKEN")

# Debug print to confirm token loaded
print(f"[HF MODEL] Token loaded: {HF_API_TOKEN[:10]}..." if HF_API_TOKEN else "[HF MODEL] ERROR: Token NOT found!")

SENTIMENT_URL = "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest"
EMOTION_URL = "https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base"

HEADERS = {"Authorization": f"Bearer {HF_API_TOKEN}"}

def query_sentiment(texts: list) -> list:
    """
    Returns list of dicts: [{label, score}, ...]
    Labels: Positive, Negative, Neutral (3-class, proper model)
    """
    if not HF_API_TOKEN:
        print("[HF API] Token missing. Skipping HF call.", flush=True)
        return None
        
    payload = {"inputs": texts, "options": {"wait_for_model": True}}
    
    try:
        response = requests.post(SENTIMENT_URL, headers=HEADERS, json=payload, timeout=30, verify=False)
        
        if response.status_code == 503:
            # Model loading, wait and retry
            print("[HF API] Sentiment model warming up, retrying in 20s...", flush=True)
            time.sleep(20)
            response = requests.post(SENTIMENT_URL, headers=HEADERS, json=payload, timeout=30, verify=False)
        
        if response.status_code != 200:
            print(f"[HF API] Sentiment endpoint returned {response.status_code}: {response.text}", flush=True)
            return None
        
        results = response.json()
        predictions = []
        for item in results:
            # item is list of [{label, score}]
            best = max(item, key=lambda x: x['score'])
            label = best['label'].capitalize()
            # Normalize labels
            if 'pos' in label.lower(): label = 'Positive'
            elif 'neg' in label.lower(): label = 'Negative'
            else: label = 'Neutral'
            predictions.append({
                "label": label,
                "score": best['score']
            })
        return predictions
        
    except requests.exceptions.RequestException as e:
        print(f"[HF API] Sentiment request exception: {e}", flush=True)
        return None

def query_emotion(texts: list) -> list:
    """
    Returns list of emotion labels
    """
    if not HF_API_TOKEN:
        return None
        
    payload = {"inputs": texts, "options": {"wait_for_model": True}}
    
    try:
        response = requests.post(EMOTION_URL, headers=HEADERS, json=payload, timeout=30, verify=False)
        
        if response.status_code == 503:
            print("[HF API] Emotion model warming up, retrying in 20s...", flush=True)
            time.sleep(20)
            response = requests.post(EMOTION_URL, headers=HEADERS, json=payload, timeout=30, verify=False)
        
        if response.status_code != 200:
            print(f"[HF API] Emotion endpoint returned {response.status_code}: {response.text}", flush=True)
            return None
        
        results = response.json()
        emotions = []
        for item in results:
            best = max(item, key=lambda x: x['score'])
            emotions.append(best['label'])
        return emotions
        
    except requests.exceptions.RequestException as e:
        print(f"[HF API] Emotion request exception: {e}", flush=True)
        return None
