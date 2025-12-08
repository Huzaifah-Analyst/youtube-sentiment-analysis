# 📊 YouTube Sentiment Analysis Dashboard

A Streamlit-based dashboard that analyzes YouTube video comments to determine audience sentiment, visualize trends, and identify key topics.

## 🚀 Features
- **Sentiment Score**: Overall positive/negative rating.
- **Trend Analysis**: See how sentiment changes over time.
- **Word Cloud**: Visualize the most frequent topics.
- **N-Grams**: Top phrases used in comments.

## 🛠️ Installation

1.  **Clone the repository**:
    ```bash
    git clone <your-repo-url>
    cd streamlit_dashboard
    ```

2.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Setup Environment Variables**:
    - Create a `.env` file in the root directory.
    - Add your YouTube API Key:
        ```
        YOUTUBE_API_KEY=your_api_key_here
        ```

4.  **Run the App**:
    ```bash
    streamlit run app.py
    ```

## 📂 Project Structure
- `app.py`: Main Streamlit application.
- `main.py`: Backend logic for fetching and analyzing data.
- `models/`: Pre-trained Machine Learning models.
