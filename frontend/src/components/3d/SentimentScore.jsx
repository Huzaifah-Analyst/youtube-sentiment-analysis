import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three'

const AnimatedText = animated(Text)

export default function SentimentScore({ score = 0 }) {
    const color = useMemo(() => {
        // Lerp between red (-1) and green (+1)
        const t = (score + 1) / 2 // Convert -1..1 to 0..1
        const red = new THREE.Color('#ef4444')
        const green = new THREE.Color('#22c55e')
        return new THREE.Color().lerpColors(red, green, t)
    }, [score])

    const { springColor } = useSpring({
        springColor: color,
        config: { tension: 120, friction: 14 }
    })

    const textRef = useRef()

    useFrame((state) => {
        if (textRef.current) {
            textRef.current.position.y = 5 + Math.sin(state.clock.elapsedTime) * 0.1
        }
    })

    return (
        <AnimatedText
            ref={textRef}
            position={[0, 5, 0]}
            fontSize={1.2}
            color={springColor}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.05}
            outlineColor="#000000"
        >
            {score >= 0 ? '+' : ''}{score.toFixed(2)}
        </AnimatedText>
    )
}
