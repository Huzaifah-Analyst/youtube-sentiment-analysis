import { Card, Title, Badge, TabGroup, TabList, Tab, TabPanels, TabPanel } from '@tremor/react'
import CommentCard from '../CommentCard'

export default function CommentsSidebar({ data, isVisible, onClose }) {
    if (!isVisible || !data) return null

    const getFilteredComments = (filter) => {
        if (!data?.comments) return []

        switch (filter) {
            case 'positive':
                return data.comments.filter(c => c.sentiment === 'Positive').slice(0, 10)
            case 'negative':
                return data.comments.filter(c => c.sentiment === 'Negative').slice(0, 10)
            case 'confidence':
                return [...data.comments].sort((a, b) => (b.confidence || 85) - (a.confidence || 85)).slice(0, 10)
            default:
                return data.comments.slice(0, 15)
        }
    }

    return (
        <div className="fixed right-0 top-0 h-screen w-96 bg-gray-900/95 backdrop-blur-xl border-l border-gray-700 shadow-2xl overflow-hidden flex flex-col z-50 animate-slide-in">
            <div className="p-6 border-b border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <Title className="text-white">Comments</Title>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-2xl"
                    >
                        ×
                    </button>
                </div>
                <div className="flex gap-2">
                    <Badge color="green">{data.stats.positive} Positive</Badge>
                    <Badge color="red">{data.stats.negative} Negative</Badge>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <TabGroup>
                    <TabList className="mb-4">
                        <Tab>All</Tab>
                        <Tab>Positive</Tab>
                        <Tab>Negative</Tab>
                        <Tab>Top</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <div className="space-y-3">
                                {getFilteredComments('all').map((comment, index) => (
                                    <CommentCard key={index} comment={comment} />
                                ))}
                            </div>
                        </TabPanel>
                        <TabPanel>
                            <div className="space-y-3">
                                {getFilteredComments('positive').map((comment, index) => (
                                    <CommentCard key={index} comment={comment} />
                                ))}
                            </div>
                        </TabPanel>
                        <TabPanel>
                            <div className="space-y-3">
                                {getFilteredComments('negative').map((comment, index) => (
                                    <CommentCard key={index} comment={comment} />
                                ))}
                            </div>
                        </TabPanel>
                        <TabPanel>
                            <div className="space-y-3">
                                {getFilteredComments('confidence').map((comment, index) => (
                                    <CommentCard key={index} comment={comment} />
                                ))}
                            </div>
                        </TabPanel>
                    </TabPanels>
                </TabGroup>
            </div>
        </div>
    )
}
