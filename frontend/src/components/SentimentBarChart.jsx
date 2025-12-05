import { Card, Title, BarChart } from '@tremor/react';

export default function SentimentBarChart({ stats }) {
    if (!stats) return null;

    const data = [
        {
            name: 'Sentiment Distribution',
            Positive: stats.positive || 0,
            Negative: stats.negative || 0,
            Neutral: stats.neutral || 0,
        },
    ];

    return (
        <Card>
            <Title>Sentiment Distribution</Title>
            <BarChart
                className="mt-6"
                data={data}
                index="name"
                categories={['Positive', 'Negative', 'Neutral']}
                colors={['green', 'red', 'gray']}
                valueFormatter={(value) => `${value} comments`}
                yAxisWidth={60}
                showLegend={true}
                stack={false}
            />
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                    <div className="text-2xl font-bold text-green-600">{stats.positive_pct}%</div>
                    <div className="text-sm text-gray-600">Positive</div>
                </div>
                <div>
                    <div className="text-2xl font-bold text-red-600">{stats.negative_pct}%</div>
                    <div className="text-sm text-gray-600">Negative</div>
                </div>
                <div>
                    <div className="text-2xl font-bold text-gray-600">{stats.neutral_pct || 0}%</div>
                    <div className="text-sm text-gray-600">Neutral</div>
                </div>
            </div>
        </Card>
    );
}
