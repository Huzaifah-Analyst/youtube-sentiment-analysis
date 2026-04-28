import { useCallback, memo } from 'react'
import WordCloud from 'react-d3-cloud'

const WordCloudComponent = memo(function WordCloudComponent({ data }) {
    console.log("WORD CLOUD DATA:", data)

    if (!data || data.length === 0) {
        return (
            <div style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                No word cloud data available
            </div>
        )
    }

    const fontSizeMapper = useCallback((word) => Math.log2(word.value) * 10 + 14, [])
    const rotate = useCallback(() => 0, [])

    const fillMapper = useCallback((word) => {
        if (word.sentiment === 'positive') return '#4ade80'
        if (word.sentiment === 'negative') return '#f87171'
        return '#9ca3af'
    }, [])

    return (
        <div style={{ width: '100%', height: '300px' }}>
            <WordCloud
                data={data}
                width={500}
                height={300}
                fontSize={fontSizeMapper}
                rotate={rotate}
                padding={5}
                fill={fillMapper}
                font="Inter"
            />
        </div>
    )
})

export default WordCloudComponent
