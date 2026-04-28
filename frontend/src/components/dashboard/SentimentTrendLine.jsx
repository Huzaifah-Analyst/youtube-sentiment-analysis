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
                borderColor: '#34d399',
                borderWidth: 2.5,
                // Gradient fill — defined via plugin callback
                backgroundColor: (ctx) => {
                    const chart = ctx.chart
                    const { ctx: canvas, chartArea } = chart
                    if (!chartArea) return 'rgba(52,211,153,0.08)'
                    const gradient = canvas.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
                    gradient.addColorStop(0, 'rgba(52,211,153,0.40)')
                    gradient.addColorStop(1, 'rgba(52,211,153,0.00)')
                    return gradient
                },
                tension: 0.45,
                fill: true,
                pointBackgroundColor: '#34d399',
                pointRadius: 3,
                pointHoverRadius: 6,
            },
            {
                label: 'Negative %',
                data: data.map(d => d.negative),
                borderColor: '#f87171',
                borderWidth: 2.5,
                backgroundColor: (ctx) => {
                    const chart = ctx.chart
                    const { ctx: canvas, chartArea } = chart
                    if (!chartArea) return 'rgba(248,113,113,0.08)'
                    const gradient = canvas.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
                    gradient.addColorStop(0, 'rgba(248,113,113,0.35)')
                    gradient.addColorStop(1, 'rgba(248,113,113,0.00)')
                    return gradient
                },
                tension: 0.45,
                fill: true,
                pointBackgroundColor: '#f87171',
                pointRadius: 3,
                pointHoverRadius: 6,
            },
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#94a3b8',
                    font: { size: 12, weight: '600' },
                    usePointStyle: true,
                    pointStyleWidth: 8,
                    padding: 16,
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(10,10,26,0.95)',
                borderColor: 'rgba(99,102,241,0.3)',
                borderWidth: 1,
                titleColor: '#f1f5f9',
                bodyColor: '#94a3b8',
                padding: 12,
            },
        },
        scales: {
            y: {
                grid: { color: 'rgba(99,102,241,0.08)' },
                ticks: { color: '#64748b', font: { size: 11 } },
                min: 0,
                max: 100,
                border: { display: false },
            },
            x: {
                grid: { display: false },
                ticks: { color: '#64748b', font: { size: 11 } },
                border: { display: false },
            },
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false,
        },
    }

    return (
        <div style={{ height: '280px', width: '100%' }}>
            <Line data={chartData} options={options} />
        </div>
    )
})

export default SentimentTrendLine
