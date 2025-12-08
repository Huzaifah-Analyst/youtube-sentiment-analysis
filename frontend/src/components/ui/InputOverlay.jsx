import { Html } from '@react-three/drei'
import { Button, TextInput } from '@tremor/react'

export default function InputOverlay({ onAnalyze, url, setUrl, loading }) {
    return (
        <Html
            position={[0, 6, 0]}
            transform
            occlude
            style={{ width: '600px' }}
        >
            <div className="bg-gray-900/90 backdrop-blur-xl p-8 rounded-2xl border border-gray-700 shadow-2xl">
                <h2 className="text-3xl font-bold text-white mb-2 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Sentiment Nebula
                </h2>
                <p className="text-gray-400 text-sm mb-6 text-center">
                    Enter a YouTube URL to visualize sentiment in 3D
                </p>

                <TextInput
                    placeholder="https://youtube.com/watch?v=..."
                    value={url}
                    onValueChange={setUrl}
                    className="mb-4"
                    disabled={loading}
                />

                <Button
                    onClick={onAnalyze}
                    disabled={loading || !url}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    size="lg"
                >
                    {loading ? 'Analyzing...' : 'Analyze Sentiment'}
                </Button>
            </div>
        </Html>
    )
}
