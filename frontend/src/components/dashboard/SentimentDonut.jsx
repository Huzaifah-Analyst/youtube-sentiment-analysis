import { memo } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

const SentimentDonut = memo(function SentimentDonut({ distribution, score }) {
    if (!distribution) return null

    // Determine dominant sentiment for center text
    const pos = distribution.positive ?? 0
    const neg = distribution.negative ?? 0
    const neu = distribution.neutral ?? 0
    let dominant = 'Neutral'
    let dominantPct = neu
    let dominantColor = '#94a3b8'
    if (pos >= neg && pos >= neu) {
        dominant = 'Positive'
        dominantPct = pos
        dominantColor = '#34d399'
    } else if (neg >= pos && neg >= neu) {
        dominant = 'Negative'
        dominantPct = neg
        dominantColor = '#f87171'
    }

    const data = {
        labels: ['Positive', 'Negative', 'Neutral'],
        datasets: [
            {
                data: [pos, neg, neu],
                backgroundColor: [
                    'rgba(52, 211, 153, 0.85)',   // Emerald
                    'rgba(248, 113, 113, 0.85)',  // Rose
                    'rgba(148, 163, 184, 0.75)',  // Slate
                ],
                borderColor: [
                    'rgba(52, 211, 153, 1)',
                    'rgba(248, 113, 113, 1)',
                    'rgba(148, 163, 184, 1)',
                ],
                borderWidth: 2,
                hoverOffset: 8,
            },
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#94a3b8',
                    padding: 20,
                    font: { size: 12, weight: '600' },
                    usePointStyle: true,
                    pointStyleWidth: 8,
                }
            },
            tooltip: {
                backgroundColor: 'rgba(10,10,26,0.95)',
                borderColor: 'rgba(99,102,241,0.3)',
                borderWidth: 1,
                titleColor: '#f1f5f9',
                bodyColor: '#94a3b8',
                padding: 12,
                callbacks: {
                    label: (ctx) => ` ${ctx.label}: ${ctx.raw}%`
                }
            }
        },
        cutout: '72%',
    }

    return (
        <div style={{ position: 'relative', height: '280px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Doughnut data={data} options={options} />
            {/* Center text — dominant sentiment + percentage */}
            <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                paddingBottom: '40px', /* shift up above legend */
            }}>
                <span style={{
                    color: dominantColor,
                    fontSize: '1.7rem',
                    fontWeight: 800,
                    lineHeight: 1,
                    textShadow: `0 0 20px ${dominantColor}66`,
                }}>
                    {dominantPct}%
                </span>
                <span style={{
                    color: dominantColor,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginTop: '4px',
                    opacity: 0.85,
                }}>
                    {dominant}
                </span>
            </div>
        </div>
    )
})

export default SentimentDonut
