import { Card } from '@tremor/react';

export default function VideoInfoCard({ videoData }) {
    if (!videoData) return null;

    return (
        <Card className="mb-6">
            <div className="flex flex-col md:flex-row gap-6">
                {videoData.thumbnail_url && (
                    <img
                        src={videoData.thumbnail_url}
                        alt="Video thumbnail"
                        className="w-full md:w-48 h-auto rounded-lg object-cover"
                    />
                )}
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {videoData.video_title || 'Video Title'}
                    </h2>
                    <p className="text-gray-600 mb-3">
                        {videoData.channel_name || 'Channel Name'}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        {videoData.view_count && (
                            <span>👁️ {videoData.view_count.toLocaleString()} views</span>
                        )}
                        {videoData.upload_date && (
                            <span>📅 {new Date(videoData.upload_date).toLocaleDateString()}</span>
                        )}
                        <span>💬 {videoData.total_comments || 0} comments analyzed</span>
                    </div>
                </div>
            </div>
        </Card>
    );
}
