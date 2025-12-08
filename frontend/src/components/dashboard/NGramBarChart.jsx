import { memo } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const NGramBarChart = memo(function NGramBarChart({ data }) {
    if (!data || data.length === 0) return null

    const chartData = {
        labels: data.map(d => d.text),
        datasets: [
            {
                label: 'Frequency',
                data: data.map(d => d.count),
                backgroundColor: 'rgba(59, 130, 246, 0.8)', // Blue
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
                borderRadius: 4,
                barThickness: 20,
            },
        ],
    }

    const options = {
        indexAxis: 'y', // Horizontal bar chart
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => ` Count: ${context.raw}`
                }
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(75, 85, 99, 0.2)' },
                ticks: { color: '#9ca3af' },
            },
            y: {
                grid: { display: false },
                ticks: { color: '#e5e7eb', font: { size: 11 } },
            },
        },
    }

    return (
        <div className="h-64 w-full">
            <Bar data={chartData} options={options} />
        </div>
    )
})

export default NGramBarChart
