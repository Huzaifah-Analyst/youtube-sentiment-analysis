import pandas as pd
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import time

# Download necessary NLTK data
nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('omw-1.4')

def load_data(filepath):
    print("Loading dataset...")
    # Sentiment140 has no header. Columns: target, ids, date, flag, user, text
    cols = ['target', 'ids', 'date', 'flag', 'user', 'text']
    try:
        df = pd.read_csv(filepath, encoding='latin-1', header=None, names=cols)
        print(f"Dataset loaded. Shape: {df.shape}")
        return df
    except Exception as e:
        print(f"Error loading data: {e}")
        return None

def clean_text(text):
    if not isinstance(text, str):
        return ""
    
    # 1. Lowercase
    text = text.lower()
    
    # 2. Remove URLs
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    
    # 3. Remove User Mentions (@user)
    text = re.sub(r'@\w+', '', text)
    
    # 4. Remove special characters and numbers (keep only letters)
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    
    # 5. Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def preprocess_data(input_path, output_path):
    start_time = time.time()
    
    df = load_data(input_path)
    if df is None:
        return

    # Keep only necessary columns
    df = df[['target', 'text']]
    
    # Map target: 0 -> Negative, 4 -> Positive. We might want to map 4 to 1 for binary classification.
    # Let's keep it simple: 0 = Negative, 1 = Positive
    print("Mapping targets...")
    df['target'] = df['target'].apply(lambda x: 1 if x == 4 else 0)

    print("Cleaning text (this might take a while)...")
    # Using a smaller sample for testing if needed, but here we process all
    # df = df.sample(10000) # Uncomment for quick testing
    
    df['cleaned_text'] = df['text'].apply(clean_text)
    
    # Remove empty rows after cleaning
    df = df[df['cleaned_text'] != '']
    
    print(f"Saving processed data to {output_path}...")
    df.to_csv(output_path, index=False)
    
    print(f"Preprocessing complete in {time.time() - start_time:.2f} seconds.")
    print(df.head())

if __name__ == "__main__":
    input_csv = r"e:\study\7th sem\fyp\starting the project\training.1600000.processed.noemoticon.csv"
    output_csv = r"e:\study\7th sem\fyp\starting the project\processed_sentiment_data.csv"
    
    preprocess_data(input_csv, output_csv)
