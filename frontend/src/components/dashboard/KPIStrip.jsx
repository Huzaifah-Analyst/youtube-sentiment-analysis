import { memo } from 'react'
import { Card } from '@tremor/react'

const KPIStrip = memo(function KPIStrip({ kpi, totalComments }) {
    if (!kpi) return null

    const getSentimentLabel = (score) => {
        if (score > 0.3) return { text: 'Positive', color: 'text-green-400' }
        if (score < -0.3) return { text: 'Negative', color: 'text-red-400' }
        return { text: 'Neutral', color: 'text-gray-400' }
    }

    const sentiment = getSentimentLabel(kpi.sentiment_score)

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gray-900/40 border-gray-800 backdrop-blur-md hover:border-gray-700 transition-colors">
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Comments</p>
                <p className="text-3xl font-bold text-white mt-2">{totalComments.toLocaleString()}</p>
            </Card>

            <Card className="bg-gray-900/40 border-gray-800 backdrop-blur-md hover:border-gray-700 transition-colors">
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Sentiment Score</p>
                <div className="flex items-baseline gap-2 mt-2">
                    <p className={`text-3xl font-bold ${sentiment.color}`}>
                        {kpi.sentiment_score > 0 ? '+' : ''}{kpi.sentiment_score}
                    </p>
                    <span className={`text-sm font-medium ${sentiment.color} opacity-80`}>
                        {sentiment.text}
                    </span>
                </div>
            </Card>

            <Card className="bg-gray-900/40 border-gray-800 backdrop-blur-md hover:border-gray-700 transition-colors">
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Polarity Index</p>
                <p className="text-3xl font-bold text-blue-400 mt-2">{kpi.polarity_index}</p>
                <p className="text-xs text-gray-500 mt-1">Opinion Intensity</p>
            </Card>
        </div>
    )
})

export default KPIStrip
