import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import time

def train_model(input_path, model_path, vectorizer_path):
    print("Loading processed data...")
    try:
        df = pd.read_csv(input_path)
        # Drop NaN values created during saving/loading
        df.dropna(subset=['cleaned_text'], inplace=True)
    except Exception as e:
        print(f"Error loading data: {e}")
        return

    print(f"Data loaded. Shape: {df.shape}")

    X = df['cleaned_text']
    y = df['target']

    print("Splitting data into Train and Test sets...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Vectorizing text (TF-IDF)...")
    # Using max_features to limit model size and training time
    vectorizer = TfidfVectorizer(max_features=10000, ngram_range=(1,2))
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)

    print("Training Logistic Regression model...")
    start_time = time.time()
    model = LogisticRegression(max_iter=1000, n_jobs=1)
    model.fit(X_train_tfidf, y_train)
    print(f"Training complete in {time.time() - start_time:.2f} seconds.")

    print("Evaluating model...")
    y_pred = model.predict(X_test_tfidf)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    print("Saving model and vectorizer...")
    joblib.dump(model, model_path)
    joblib.dump(vectorizer, vectorizer_path)
    print("Model saved successfully.")

if __name__ == "__main__":
    input_csv = r"e:\study\7th sem\fyp\starting the project\processed_sentiment_data.csv"
    model_file = r"e:\study\7th sem\fyp\starting the project\sentiment_model.pkl"
    vectorizer_file = r"e:\study\7th sem\fyp\starting the project\tfidf_vectorizer.pkl"
    
    train_model(input_csv, model_file, vectorizer_file)
