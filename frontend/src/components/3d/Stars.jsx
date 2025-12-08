import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Stars() {
    const ref = useRef()

    const particles = useMemo(() => {
        const temp = []
        for (let i = 0; i < 5000; i++) {
            const x = THREE.MathUtils.randFloatSpread(100)
            const y = THREE.MathUtils.randFloatSpread(100)
            const z = THREE.MathUtils.randFloatSpread(100)
            temp.push(x, y, z)
        }
        return new Float32Array(temp)
    }, [])

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 10
            ref.current.rotation.y -= delta / 15
        }
    })

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <points ref={ref}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={particles.length / 3}
                        array={particles}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.05}
                    color="#ffffff"
                    sizeAttenuation={true}
                    transparent
                    opacity={0.6}
                />
            </points>
        </group>
    )
}
