import { Badge } from '@tremor/react';

export default function CommentCard({ comment }) {
    const sentimentColors = {
        Positive: 'green',
        Negative: 'red',
        Neutral: 'gray',
    };

    const confidence = comment.confidence || 85;

    return (
        <div className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-gray-900 text-sm">{comment.author}</span>
                <div className="flex items-center gap-2">
                    <Badge color={sentimentColors[comment.sentiment] || 'gray'} size="sm">
                        {comment.sentiment}
                    </Badge>
                    <span className="text-xs text-gray-400">{confidence}%</span>
                </div>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{comment.text}</p>
        </div>
    );
}
