import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

const messages = [
    "Fetching comments from YouTube...",
    "Cleaning text data...",
    "Vectorizing comments...",
    "Running sentiment analysis model...",
    "Generating visualizations...",
]

export default function LoadingOverlay({ isLoading }) {
    const [msgIndex, setMsgIndex] = useState(0)

    useEffect(() => {
        if (!isLoading) {
            setMsgIndex(0)
            return
        }
        const interval = setInterval(() => {
            setMsgIndex((prev) => (prev + 1) % messages.length)
        }, 1500)
        return () => clearInterval(interval)
    }, [isLoading])

    if (!isLoading) return null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="inline-block mb-6"
                >
                    <Loader2 className="w-16 h-16 text-blue-500" />
                </motion.div>

                <div className="h-8 overflow-hidden relative">
                    <AnimatePresence mode='wait'>
                        <motion.p
                            key={msgIndex}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="text-xl font-medium text-white"
                        >
                            {messages[msgIndex]}
                        </motion.p>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
