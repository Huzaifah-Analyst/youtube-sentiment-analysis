import joblib
import numpy as np
import os

MODEL_PATH = "sentiment_model.pkl"
VECTORIZER_PATH = "tfidf_vectorizer.pkl"

print("Testing numpy...")
try:
    a = np.array([1, 2, 3])
    print(f"Numpy works: {a}")
except Exception as e:
    print(f"Numpy failed: {e}")

print("Loading model...")
if os.path.exists(MODEL_PATH):
    try:
        model = joblib.load(MODEL_PATH)
        print("Model loaded.")
    except Exception as e:
        print(f"Model load failed: {e}")
else:
    print("Model file not found.")

print("Loading vectorizer...")
if os.path.exists(VECTORIZER_PATH):
    try:
        vectorizer = joblib.load(VECTORIZER_PATH)
        print("Vectorizer loaded.")
    except Exception as e:
        print(f"Vectorizer load failed: {e}")
else:
    print("Vectorizer file not found.")

if 'model' in locals() and 'vectorizer' in locals():
    print("Testing prediction...")
    try:
        text = ["This is a test"]
        features = vectorizer.transform(text)
        pred = model.predict(features)
        print(f"Prediction: {pred}")
    except Exception as e:
        print(f"Prediction failed: {e}")
