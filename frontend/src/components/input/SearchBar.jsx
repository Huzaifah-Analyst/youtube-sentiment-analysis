import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Play } from 'lucide-react'

export default function SearchBar({ onAnalyze, loading }) {
    const [url, setUrl] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        if (url) onAnalyze(url)
    }

    const examples = [
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Rick Roll (Classic)
        "https://www.youtube.com/watch?v=jNQXAC9IVRw", // Me at the zoo
    ]

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto mb-12"
        >
            <form onSubmit={handleSubmit} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                <div className="relative flex bg-gray-900 border border-gray-700 rounded-2xl p-2 shadow-2xl">
                    <div className="flex-1 flex items-center px-4">
                        <Search className="w-5 h-5 text-gray-400 mr-3" />
                        <input
                            type="text"
                            placeholder="Paste YouTube URL here..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full bg-transparent text-white outline-none placeholder-gray-500"
                            disabled={loading}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !url}
                        className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${loading || !url
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25 active:scale-95'
                            }`}
                    >
                        {loading ? (
                            <span className="animate-pulse">Analyzing...</span>
                        ) : (
                            <>
                                <span>Analyze</span>
                                <Play className="w-4 h-4 fill-current" />
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="mt-4 flex justify-center gap-3 text-sm text-gray-500">
                <span>Try:</span>
                {examples.map((ex, i) => (
                    <button
                        key={i}
                        onClick={() => { setUrl(ex); onAnalyze(ex); }}
                        className="hover:text-blue-400 transition-colors underline decoration-dotted"
                    >
                        Example {i + 1}
                    </button>
                ))}
            </div>
        </motion.div>
    )
}
