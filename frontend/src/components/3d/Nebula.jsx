import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Nebula({ data, onClusterClick }) {
    const meshRef = useRef()
    const [hovered, setHovered] = useState(null)

    const particles = useMemo(() => {
        if (!data?.particles) {
            // Default particles if no data
            return {
                positions: new Float32Array(300),
                colors: new Float32Array(300),
                sizes: new Float32Array(100)
            }
        }

        const positions = []
        const colors = []
        const sizes = []

        data.particles.forEach(particle => {
            positions.push(...particle.position)
            colors.push(...particle.color)
            sizes.push(particle.size || 0.1)
        })

        return {
            positions: new Float32Array(positions),
            colors: new Float32Array(colors),
            sizes: new Float32Array(sizes)
        }
    }, [data])

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.1
        }
    })

    return (
        <points
            ref={meshRef}
            onPointerOver={(e) => {
                e.stopPropagation()
                setHovered(true)
            }}
            onPointerOut={() => setHovered(false)}
            onClick={(e) => {
                e.stopPropagation()
                if (onClusterClick) onClusterClick()
            }}
        >
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particles.positions.length / 3}
                    array={particles.positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={particles.colors.length / 3}
                    array={particles.colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={hovered ? 0.15 : 0.1}
                vertexColors
                transparent
                opacity={0.8}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    )
}
