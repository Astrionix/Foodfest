import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sparkles, useCursor } from '@react-three/drei'
import type { Mesh } from 'three'

type GenieAvatarProps = {
  mood: GenieMood
  onTap?: () => void
}

export type GenieMood = 'idle' | 'delighted' | 'eyerolled' | 'warning' | 'sass'

const paletteMap: Record<GenieMood, { base: string; glow: string }> = {
  idle: { base: '#7E3AF2', glow: '#FFB347' },
  delighted: { base: '#FF5E67', glow: '#FFE074' },
  eyerolled: { base: '#3F2E8C', glow: '#7BD3FF' },
  warning: { base: '#FF2F45', glow: '#FFD166' },
  sass: { base: '#22D3EE', glow: '#FFE29A' },
}

function GenieCore({ mood, onTap }: { mood: GenieMood; onTap?: () => void }) {
  const bodyRef = useRef<Mesh>(null)
  const auraRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const palette = useMemo(() => paletteMap[mood], [mood])

  useCursor(hovered)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const bob = Math.sin(t * 1.6) * 0.08
    const twist = Math.sin(t * 0.6) * 0.24
    if (bodyRef.current) {
      bodyRef.current.position.y = 0.4 + bob
      bodyRef.current.rotation.y = twist
    }
    if (auraRef.current) {
      auraRef.current.rotation.z = t * 0.28
    }
  })

  return (
    <group>
      <mesh
        ref={bodyRef}
        castShadow
        receiveShadow
        onClick={onTap}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.9, 64, 64]} />
        <meshStandardMaterial
          color={palette.base}
          emissive={palette.glow}
          emissiveIntensity={0.5}
          roughness={0.35}
          metalness={0.1}
        />
      </mesh>

      <mesh position={[0, -1.05, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.9, 0.9, 1.2]}>
        <coneGeometry args={[0.7, 1.8, 32]} />
        <meshStandardMaterial
          color={palette.base}
          emissive={palette.glow}
          emissiveIntensity={0.3}
          roughness={0.4}
        />
      </mesh>

      <mesh ref={auraRef} scale={[1.6, 1.6, 1.6]}>
        <torusGeometry args={[1.05, 0.05, 16, 64]} />
        <meshStandardMaterial color={palette.glow} emissive={palette.glow} emissiveIntensity={0.6} transparent opacity={0.38} />
      </mesh>
    </group>
  )
}

function GenieAvatar({ mood, onTap }: GenieAvatarProps) {
  const palette = paletteMap[mood]

  return (
    <Canvas shadows camera={{ position: [0, 1.6, 4], fov: 40 }}>
      <color attach="background" args={[0.04, 0.01, 0.03]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 6]} intensity={1.1} castShadow />
      <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.6}>
        <GenieCore mood={mood} onTap={onTap} />
      </Float>
      <Sparkles count={45} scale={[3, 3, 3]} size={2} speed={0.6} color={palette.glow} />
      <Sparkles count={25} scale={[1.8, 1.8, 1.8]} size={1.2} speed={0.9} color={palette.base} opacity={0.4} />
    </Canvas>
  )
}

export default GenieAvatar
