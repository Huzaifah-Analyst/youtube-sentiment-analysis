import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import Stars from './Stars'
import Nebula from './Nebula'
import SentimentScore from './SentimentScore'

export default function SentimentCanvas({ data, onClusterClick }) {
    const sentimentScore = data?.sentiment_score || 0

    return (
        <div className="w-full h-screen">
            <Canvas style={{ background: '#0a0a0f' }}>
                <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={75} />

                {/* Lighting */}
                <ambientLight intensity={0.3} />
                <pointLight position={[10, 10, 10]} intensity={0.5} color="#ffffff" />
                <pointLight position={[-10, -10, -10]} intensity={0.3} color="#4f46e5" />

                {/* 3D Scene */}
                <Stars />
                <Nebula data={data} onClusterClick={onClusterClick} />
                <SentimentScore score={sentimentScore} />

                {/* Controls */}
                <OrbitControls
                    enableZoom={true}
                    enablePan={false}
                    minDistance={5}
                    maxDistance={20}
                    zoomSpeed={0.5}
                />
            </Canvas>
        </div>
    )
}
