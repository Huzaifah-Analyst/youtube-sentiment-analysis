# YouTube Sentiment Analysis Dashboard

AI-powered real-time sentiment analysis for YouTube comments using machine learning and modern web technologies.

## Features

- 🎯 Real-time sentiment analysis of YouTube video comments
- 📊 Professional dashboard with Tremor components
- 🎨 Beautiful data visualizations (bar charts, KPI cards)
- 🔍 Filterable comments (Most Positive, Most Negative, Highest Confidence)
- 🚀 Fast API backend with Python
- ⚡ React + Vite frontend with Tailwind CSS

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Scikit-learn** - Machine learning for sentiment classification
- **YouTube Data API v3** - Comment fetching
- **TF-IDF Vectorizer** - Text feature extraction

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **Tremor** - Dashboard components
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

## Project Structure

```
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── train_model.py          # ML model training
│   ├── preprocessing.py        # Data preprocessing
│   └── sentiment_model.pkl     # Trained model
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── App.jsx            # Main app
│   │   └── index.css          # Global styles
│   └── package.json
└── requirements.txt            # Python dependencies

## Setup Instructions

### Backend Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
Create a `.env` file with:
```
YOUTUBE_API_KEY=your_api_key_here
```

4. Train the model (if needed):
```bash
python train_model.py
```

5. Run the backend:
```bash
uvicorn main:app --reload --port 8000
```

### Frontend Setup

1. Navigate to frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

4. Open http://localhost:5173

## Usage

1. Paste a YouTube video URL into the input field
2. Click "Analyze" to fetch and analyze comments
3. View sentiment distribution in KPI cards and charts
4. Filter comments by sentiment or confidence using tabs

## API Endpoints

- `POST /analyze` - Analyze YouTube video sentiment
  - Request: `{ "video_url": "https://youtube.com/watch?v=..." }`
  - Response: Sentiment stats, comments, and analysis

## License

MIT

## Contributors

[Your Name] - Final Year Project
