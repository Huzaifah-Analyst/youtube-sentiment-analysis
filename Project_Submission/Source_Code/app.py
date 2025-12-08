import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from wordcloud import WordCloud
import matplotlib.pyplot as plt
from main import analyze_sentiment, AnalysisRequest, app # Importing from local main.py
import asyncio

# Page Config
st.set_page_config(
    page_title="YouTube Sentiment Dashboard",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .stApp {
        background-color: #0e1117;
        color: #fafafa;
    }
    .metric-card {
        background-color: #262730;
        padding: 20px;
        border-radius: 10px;
        border: 1px solid #41424b;
        text-align: center;
    }
    .metric-value {
        font-size: 2rem;
        font-weight: bold;
    }
    .metric-label {
        font-size: 0.9rem;
        color: #a0a0a0;
    }
</style>
""", unsafe_allow_html=True)

# Title
st.title("📊 YouTube Sentiment Dashboard")
st.markdown("Analyze audience sentiment, trends, and topics from YouTube videos.")

# Sidebar
with st.sidebar:
    st.header("Input")
    url = st.text_input("YouTube Video URL", placeholder="https://youtube.com/watch?v=...")
    analyze_btn = st.button("Analyze Video", type="primary")
    
    st.markdown("---")
    st.markdown("### About")
    st.markdown("This tool uses ML to analyze comments and visualize sentiment trends.")

# Main Logic
if analyze_btn and url:
    with st.spinner("Fetching comments and analyzing sentiment..."):
        try:
            # We need to run the async function from main.py
            # Since Streamlit is sync, we use asyncio.run
            # Note: main.py functions might depend on global 'model' and 'vectorizer' which are loaded on import
            
            # Create request object
            req = AnalysisRequest(video_url=url)
            
            # Run analysis
            # We need to ensure the event loop handles this correctly
            result = asyncio.run(analyze_sentiment(req))
            
            # --- Dashboard Layout ---
            
            # 1. Video Info & KPIs
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                st.image(result['video_info']['thumbnail'], use_column_width=True)
                st.caption(f"**{result['video_info']['title']}**")
                st.caption(f"Channel: {result['video_info']['channel']}")
            
            with col2:
                st.markdown(f"""
                <div class="metric-card">
                    <div class="metric-value">{result['video_info']['total_comments']}</div>
                    <div class="metric-label">Total Comments</div>
                </div>
                """, unsafe_allow_html=True)
                
            with col3:
                score = result['kpi']['sentiment_score']
                color = "#4ade80" if score > 0 else "#f87171"
                st.markdown(f"""
                <div class="metric-card">
                    <div class="metric-value" style="color: {color}">{score:+.2f}</div>
                    <div class="metric-label">Sentiment Score</div>
                </div>
                """, unsafe_allow_html=True)

            with col4:
                st.markdown(f"""
                <div class="metric-card">
                    <div class="metric-value" style="color: #60a5fa">{result['kpi']['polarity_index']}</div>
                    <div class="metric-label">Polarity Index</div>
                </div>
                """, unsafe_allow_html=True)
            
            st.markdown("---")
            
            # 2. Charts Row 1
            c1, c2 = st.columns(2)
            
            with c1:
                st.subheader("Sentiment Distribution")
                dist = result['sentiment_distribution']
                
                # Donut Chart
                fig_donut = px.pie(
                    names=['Positive', 'Negative', 'Neutral'],
                    values=[dist['positive'], dist['negative'], dist['neutral']],
                    hole=0.6,
                    color_discrete_sequence=['#4ade80', '#f87171', '#9ca3af']
                )
                fig_donut.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', font_color='white')
                st.plotly_chart(fig_donut, use_container_width=True)
                
            with c2:
                st.subheader("Sentiment Trend (Last 24h)")
                trend_data = result['trend_data']
                df_trend = pd.DataFrame(trend_data)
                
                # Line Chart
                fig_trend = go.Figure()
                fig_trend.add_trace(go.Scatter(x=df_trend['time'], y=df_trend['positive'], name='Positive', line=dict(color='#4ade80')))
                fig_trend.add_trace(go.Scatter(x=df_trend['time'], y=df_trend['negative'], name='Negative', line=dict(color='#f87171')))
                fig_trend.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', font_color='white', hovermode="x unified")
                st.plotly_chart(fig_trend, use_container_width=True)
            
            # 3. Charts Row 2
            c3, c4 = st.columns(2)
            
            with c3:
                st.subheader("Topic Word Cloud")
                wc_data = result['word_cloud_data']
                # Convert to dict for wordcloud library
                wc_dict = {item['text']: item['value'] for item in wc_data}
                
                # Generate Cloud
                wc = WordCloud(width=800, height=400, background_color='#0e1117', colormap='Greens').generate_from_frequencies(wc_dict)
                
                # Display using matplotlib
                fig_wc, ax = plt.subplots()
                ax.imshow(wc, interpolation='bilinear')
                ax.axis('off')
                st.pyplot(fig_wc)
                
            with c4:
                st.subheader("Top Phrases (N-Grams)")
                ngram_data = result['ngram_data']
                df_ngram = pd.DataFrame(ngram_data)
                
                # Bar Chart
                fig_bar = px.bar(df_ngram, x='count', y='text', orientation='h', color_discrete_sequence=['#60a5fa'])
                fig_bar.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', font_color='white', yaxis={'categoryorder':'total ascending'})
                st.plotly_chart(fig_bar, use_container_width=True)

        except Exception as e:
            st.error(f"An error occurred: {e}")
