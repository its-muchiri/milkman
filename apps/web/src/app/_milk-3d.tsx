'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, MeshDistortMaterial, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function MilkPack3D() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.4;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
  });

  return (
    <Float rotationIntensity={0.4} floatIntensity={1.5} speed={2}>
      <mesh ref={meshRef} scale={[1.2, 1.8, 1]} castShadow>
        <capsuleGeometry args={[0.7, 1.6, 4, 16]} />
        <MeshDistortMaterial
          color="#FAF7F0"
          envMapIntensity={0.9}
          clearcoat={1}
          clearcoatRoughness={0.1}
          distort={0.4}
          speed={2}
        />
      </mesh>
      <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.1, 32]} />
        <meshStandardMaterial color="#2B4BFF" transparent opacity={0.18} />
      </mesh>
    </Float>
  );
}

export function MilkPackScene() {
  return (
    <Canvas dpr={[1, 2]} gl={{ antialias: true }}>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 3, 5]} intensity={1.2} />
      <spotLight position={[-5, 5, 2]} angle={0.5} intensity={0.8} />
      <MilkPack3D />
      <Environment preset="city" />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} />
    </Canvas>
  );
}
