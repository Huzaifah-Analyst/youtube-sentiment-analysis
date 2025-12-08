import { motion } from 'framer-motion'

export default function Header() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
        >
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
                YouTube Sentiment Dashboard
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                AI-powered analysis to uncover the true vibe of any video.
            </p>
        </motion.div>
    )
}
