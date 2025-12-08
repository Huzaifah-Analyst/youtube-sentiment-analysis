import { useState } from 'react'
import axios from 'axios'
import { Card, Title } from '@tremor/react'
import { motion } from 'framer-motion'
import KPIStrip from './components/dashboard/KPIStrip'
import SentimentDonut from './components/dashboard/SentimentDonut'
import SentimentTrendLine from './components/dashboard/SentimentTrendLine'
import WordCloudComponent from './components/dashboard/WordCloudComponent'
import NGramBarChart from './components/dashboard/NGramBarChart'
import Header from './components/layout/Header'
import SearchBar from './components/input/SearchBar'
import LoadingOverlay from './components/feedback/LoadingOverlay'

// Animation variants for staggered reveal
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
}

function App() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const handleAnalyze = async (url) => {
    setLoading(true)
    setError('')
    setData(null)

    try {
      // Simulate a slight delay to show off the loading animation (optional, remove in prod if needed)
      // await new Promise(r => setTimeout(r, 2000)) 

      const response = await axios.post('/analyze', {
        video_url: url
      })
      setData(response.data)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || 'An error occurred while analyzing.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 overflow-y-auto selection:bg-blue-500/30">
      {/* Background Gradient Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[128px]" />
      </div>

      <LoadingOverlay isLoading={loading} />

      <div className="max-w-7xl mx-auto relative z-10">
        <Header />

        <SearchBar onAnalyze={handleAnalyze} loading={loading} />

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-center mb-8 backdrop-blur-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Dashboard Content */}
        {data && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Row 1: Video Info & KPIs */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Video Info Card */}
              <motion.div variants={itemVariants} className="lg:col-span-1">
                <Card className="h-full bg-gray-900/40 border-gray-800 backdrop-blur-md hover:border-gray-700 transition-colors">
                  <div className="relative group overflow-hidden rounded-lg mb-4">
                    <img
                      src={data.video_info.thumbnail}
                      alt="Thumbnail"
                      className="w-full h-32 object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                  </div>
                  <Title className="text-white text-lg line-clamp-2 mb-2 font-bold">{data.video_info.title}</Title>
                  <p className="text-gray-400 text-sm">{data.video_info.channel}</p>
                </Card>
              </motion.div>

              {/* KPI Strip */}
              <motion.div variants={itemVariants} className="lg:col-span-3">
                <KPIStrip kpi={data.kpi} totalComments={data.video_info.total_comments} />
              </motion.div>
            </div>

            {/* Row 2: Sentiment Distribution & Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div variants={itemVariants}>
                <Card className="bg-gray-900/40 border-gray-800 backdrop-blur-md">
                  <Title className="text-white mb-6">Sentiment Distribution</Title>
                  <SentimentDonut distribution={data.sentiment_distribution} score={data.kpi.sentiment_score} />
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="bg-gray-900/40 border-gray-800 backdrop-blur-md">
                  <Title className="text-white mb-6">Sentiment Trend (Last 24h)</Title>
                  <SentimentTrendLine data={data.trend_data} />
                </Card>
              </motion.div>
            </div>

            {/* Row 3: Topic Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div variants={itemVariants}>
                <Card className="bg-gray-900/40 border-gray-800 backdrop-blur-md">
                  <Title className="text-white mb-6">Topic Word Cloud</Title>
                  <WordCloudComponent data={data.word_cloud_data} />
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="bg-gray-900/40 border-gray-800 backdrop-blur-md">
                  <Title className="text-white mb-6">Top Phrases (N-Grams)</Title>
                  <NGramBarChart data={data.ngram_data} />
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default App

