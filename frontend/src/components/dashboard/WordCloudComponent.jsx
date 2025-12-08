import { useCallback, memo } from 'react'
import WordCloud from 'react-d3-cloud'

const WordCloudComponent = memo(function WordCloudComponent({ data }) {
    if (!data || data.length === 0) return null

    const fontSizeMapper = useCallback((word) => Math.log2(word.value) * 4 + 12, [])
    const rotate = useCallback(() => 0, [])

    const fillMapper = useCallback((word) => {
        if (word.sentiment === 'positive') return '#4ade80'
        if (word.sentiment === 'negative') return '#f87171'
        return '#9ca3af'
    }, [])

    return (
        <div className="h-64 w-full flex items-center justify-center bg-gray-900/30 rounded-lg">
            <WordCloud
                data={data}
                fontSize={fontSizeMapper}
                rotate={rotate}
                padding={4}
                fill={fillMapper}
                font="Inter"
            />
        </div>
    )
})

export default WordCloudComponent
