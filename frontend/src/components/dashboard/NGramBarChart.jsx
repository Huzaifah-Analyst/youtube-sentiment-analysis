import { memo } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const NGramBarChart = memo(function NGramBarChart({ data }) {
    if (!data || data.length === 0) return null

    // Build indigo→purple gradient colors per bar
    const total = data.length
    const barColors = data.map((_, i) => {
        const t = total > 1 ? i / (total - 1) : 0
        // Interpolate from indigo (#6366f1) to purple (#a855f7)
        const r = Math.round(99 + (168 - 99) * t)
        const g = Math.round(102 + (85 - 102) * t)
        const b = Math.round(241 + (247 - 241) * t)
        return `rgba(${r},${g},${b},0.85)`
    })

    const borderColors = data.map((_, i) => {
        const t = total > 1 ? i / (total - 1) : 0
        const r = Math.round(99 + (168 - 99) * t)
        const g = Math.round(102 + (85 - 102) * t)
        const b = Math.round(241 + (247 - 241) * t)
        return `rgba(${r},${g},${b},1)`
    })

    const chartData = {
        labels: data.map(d => d.text),
        datasets: [
            {
                label: 'Frequency',
                data: data.map(d => d.count),
                backgroundColor: barColors,
                borderColor: borderColors,
                borderWidth: 1,
                borderRadius: 6,
                barThickness: 22,
            },
        ],
    }

    const options = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(10,10,26,0.95)',
                borderColor: 'rgba(99,102,241,0.3)',
                borderWidth: 1,
                titleColor: '#f1f5f9',
                bodyColor: '#94a3b8',
                padding: 12,
                callbacks: {
                    label: (ctx) => ` Mentions: ${ctx.raw}`
                }
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(99,102,241,0.08)' },
                ticks: { color: '#64748b', font: { size: 11 } },
                border: { display: false },
            },
            y: {
                grid: { display: false },
                ticks: { color: '#e2e8f0', font: { size: 11, weight: '500' } },
                border: { display: false },
            },
        },
    }

    return (
        <div style={{ height: '280px', width: '100%' }}>
            <Bar data={chartData} options={options} />
        </div>
    )
})

export default NGramBarChart
