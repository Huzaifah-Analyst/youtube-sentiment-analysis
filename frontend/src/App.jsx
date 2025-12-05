import { useState } from 'react'
import axios from 'axios'
import { Grid, Card, Title, Button, TextInput, TabGroup, TabList, Tab, TabPanels, TabPanel } from '@tremor/react'
import LoadingState from './components/LoadingState'
import VideoInfoCard from './components/VideoInfoCard'
import KPICard from './components/KPICard'
import SentimentBarChart from './components/SentimentBarChart'
import CommentCard from './components/CommentCard'

function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const handleAnalyze = async () => {
    setLoading(true)
    setError('')
    setData(null)

    try {
      const response = await axios.post('/analyze', {
        video_url: url
      })
      setData(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred while analyzing.')
    } finally {
      setLoading(false)
    }
  }

  // Filter comments by sentiment
  const getFilteredComments = (filter) => {
    if (!data?.comments) return []

    switch (filter) {
      case 'positive':
        return data.comments.filter(c => c.sentiment === 'Positive').slice(0, 10)
      case 'negative':
        return data.comments.filter(c => c.sentiment === 'Negative').slice(0, 10)
      case 'confidence':
        return [...data.comments].sort((a, b) => (b.confidence || 85) - (a.confidence || 85)).slice(0, 10)
      default:
        return data.comments.slice(0, 20)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            YouTube Sentiment Analysis
          </h1>
          <p className="mt-3 text-xl text-gray-600">
            Analyze the sentiment of YouTube video comments with AI
          </p>
        </div>

        {/* Input Section */}
        <Card className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <TextInput
              placeholder="Paste YouTube URL here..."
              value={url}
              onValueChange={setUrl}
              className="flex-1"
              disabled={loading}
            />
            <Button
              onClick={handleAnalyze}
              disabled={loading || !url}
              size="lg"
              className="sm:w-auto w-full"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </Button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
              {error}
            </div>
          )}
        </Card>

        {/* Loading State */}
        {loading && <LoadingState />}

        {/* Results */}
        {data && !loading && (
          <div className="space-y-6">
            {/* Video Info */}
            <VideoInfoCard videoData={data} />

            {/* KPIs */}
            <Grid numItemsSm={2} numItemsLg={4} className="gap-6">
              <KPICard
                title="Total Comments"
                value={data.total_comments}
                icon="💬"
                color="blue"
              />
              <KPICard
                title="Positive"
                value={`${data.stats.positive_pct}%`}
                subtitle={`${data.stats.positive} comments`}
                icon="😊"
                color="green"
              />
              <KPICard
                title="Negative"
                value={`${data.stats.negative_pct}%`}
                subtitle={`${data.stats.negative} comments`}
                icon="😞"
                color="red"
              />
              <KPICard
                title="Sentiment Score"
                value={data.stats.positive_pct > 50 ? 'Positive' : 'Negative'}
                subtitle={`${Math.abs(data.stats.positive_pct - data.stats.negative_pct).toFixed(1)}% difference`}
                icon="📊"
                color={data.stats.positive_pct > 50 ? 'green' : 'red'}
              />
            </Grid>

            {/* Sentiment Visualization */}
            <SentimentBarChart stats={data.stats} />

            {/* Comments Section */}
            <Card>
              <Title className="mb-4">Actionable Comments</Title>
              <TabGroup>
                <TabList className="mb-4">
                  <Tab>All Comments</Tab>
                  <Tab>Most Positive</Tab>
                  <Tab>Most Negative</Tab>
                  <Tab>Highest Confidence</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {getFilteredComments('all').map((comment, index) => (
                        <CommentCard key={index} comment={comment} />
                      ))}
                    </div>
                  </TabPanel>
                  <TabPanel>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {getFilteredComments('positive').map((comment, index) => (
                        <CommentCard key={index} comment={comment} />
                      ))}
                    </div>
                  </TabPanel>
                  <TabPanel>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {getFilteredComments('negative').map((comment, index) => (
                        <CommentCard key={index} comment={comment} />
                      ))}
                    </div>
                  </TabPanel>
                  <TabPanel>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {getFilteredComments('confidence').map((comment, index) => (
                        <CommentCard key={index} comment={comment} />
                      ))}
                    </div>
                  </TabPanel>
                </TabPanels>
              </TabGroup>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
