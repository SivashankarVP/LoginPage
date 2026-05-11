'use client'

import React, { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

// Reusable component for creating distinct layers of micro-particles
const ParticleLayer = ({ 
  count, 
  size, 
  color, 
  speedMultiplier, 
  radius 
}: { 
  count: number, 
  size: number, 
  color: string, 
  speedMultiplier: number, 
  radius: number 
}) => {
  const pointsRef = useRef<THREE.Points>(null)
  
  const scrollRef = useRef(0)
  const targetScrollRef = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      targetScrollRef.current = window.scrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // Create a wide volume of space
      pos[i * 3] = (Math.random() - 0.5) * radius // x
      pos[i * 3 + 1] = (Math.random() - 0.5) * radius // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * radius // z
    }
    return [pos]
  }, [count, radius])

  useFrame((state, delta) => {
    if (!pointsRef.current) return

    // Smooth scroll interpolation
    scrollRef.current += (targetScrollRef.current - scrollRef.current) * delta * 3

    const t = state.clock.getElapsedTime()
    const scroll = scrollRef.current

    // Parallax enhancement: Each layer rotates and moves at different speeds
    
    // 1. Swirl effect
    pointsRef.current.rotation.y = t * 0.03 * speedMultiplier + scroll * 0.0003 * speedMultiplier

    // 2. Tilt effect
    pointsRef.current.rotation.x = t * 0.015 * speedMultiplier + scroll * 0.00015 * speedMultiplier

    // 3. Z-axis flying through space
    pointsRef.current.position.z = (scroll * 0.01 * speedMultiplier) % (radius / 2)
    
    // Ambient floating on Y axis
    pointsRef.current.position.y = Math.sin(t * 0.5 + scroll * 0.001) * 1.5 * speedMultiplier
  })

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={size}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.8}
      />
    </Points>
  )
}

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-black overflow-hidden pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        {/* Deep space fog */}
        <fog attach="fog" args={['#000000', 5, 30]} />
        
        {/* Layer 1: Dense Micro-Dust (Very small, numerous, slow-moving, subtle blue) */}
        <ParticleLayer count={15000} size={0.015} color="#aaddff" speedMultiplier={0.5} radius={40} />
        
        {/* Layer 2: Mid-Ground Stars (Medium size, normal speed, pure white) */}
        <ParticleLayer count={5000} size={0.03} color="#ffffff" speedMultiplier={1.0} radius={50} />
        
        {/* Layer 3: Foreground Large Particles (Larger, fast-moving, warm tint for deep parallax) */}
        <ParticleLayer count={1500} size={0.06} color="#ffccaa" speedMultiplier={2.0} radius={60} />
      </Canvas>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_40%,transparent_100%)] opacity-40 mix-blend-screen" />
      
      {/* Vignette shadow to give depth to the edges */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-70" />
    </div>
  )
}

export default AnimatedBackground