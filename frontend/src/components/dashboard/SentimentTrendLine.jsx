import { memo } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const SentimentTrendLine = memo(function SentimentTrendLine({ data }) {
    if (!data || data.length === 0) return null

    const chartData = {
        labels: data.map(d => d.time),
        datasets: [
            {
                label: 'Positive %',
                data: data.map(d => d.positive),
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                tension: 0.4,
                fill: true,
            },
            {
                label: 'Negative %',
                data: data.map(d => d.negative),
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                fill: true,
            },
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: { color: '#9ca3af' }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        scales: {
            y: {
                grid: { color: 'rgba(75, 85, 99, 0.2)' },
                ticks: { color: '#9ca3af' },
                min: 0,
                max: 100,
            },
            x: {
                grid: { display: false },
                ticks: { color: '#9ca3af' },
            },
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    }

    return (
        <div className="h-64 w-full">
            <Line data={chartData} options={options} />
        </div>
    )
})

export default SentimentTrendLine
