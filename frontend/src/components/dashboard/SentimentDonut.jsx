import { memo } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

const SentimentDonut = memo(function SentimentDonut({ distribution, score }) {
    if (!distribution) return null

    const data = {
        labels: ['Positive', 'Negative', 'Neutral'],
        datasets: [
            {
                data: [distribution.positive, distribution.negative, distribution.neutral],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',  // Green
                    'rgba(239, 68, 68, 0.8)',  // Red
                    'rgba(156, 163, 175, 0.8)', // Gray
                ],
                borderColor: [
                    'rgba(34, 197, 94, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(156, 163, 175, 1)',
                ],
                borderWidth: 1,
                hoverOffset: 4
            },
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#9ca3af', padding: 20, font: { size: 12 } }
            },
            tooltip: {
                callbacks: {
                    label: (context) => ` ${context.label}: ${context.raw}%`
                }
            }
        },
        cutout: '70%',
    }

    return (
        <div className="relative h-64 w-full flex items-center justify-center">
            <Doughnut data={data} options={options} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-gray-400 text-xs uppercase tracking-wider">Score</span>
                <span className={`text-2xl font-bold ${score > 0 ? 'text-green-400' : score < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {score > 0 ? '+' : ''}{score}
                </span>
            </div>
        </div>
    )
})

export default SentimentDonut
