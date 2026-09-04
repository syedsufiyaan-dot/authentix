import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { FallbackPhoneVisual } from './FallbackPhoneVisual';

function PhoneMesh({ isScanning = false }: { isScanning?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const scanBeamRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.25;
      groupRef.current.rotation.x = Math.cos(t * 0.3) * 0.1;
    }
    if (scanBeamRef.current && isScanning) {
      scanBeamRef.current.position.y = Math.sin(t * 2) * 1.8;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer Phone Shell */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.2, 4.4, 0.22]} />
        <meshStandardMaterial
          color="#070B14"
          metalness={0.8}
          roughness={0.2}
          emissive="#05080D"
        />
      </mesh>

      {/* Screen Glass */}
      <mesh position={[0, 0, 0.12]}>
        <planeGeometry args={[2.05, 4.2]} />
        <meshStandardMaterial
          color="#0B111C"
          emissive="#070B14"
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Glowing Chassis Edge Accent */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.24, 4.44, 0.2]} />
        <meshBasicMaterial color="#36E1CC" wireframe={true} opacity={0.3} transparent={true} />
      </mesh>

      {/* Internal Processor Die */}
      <mesh position={[0, 0.8, 0.13]}>
        <boxGeometry args={[0.7, 0.7, 0.02]} />
        <meshStandardMaterial color="#20B8FF" emissive="#20B8FF" emissiveIntensity={0.6} />
      </mesh>

      {/* Internal Battery Block */}
      <mesh position={[0, -0.6, 0.13]}>
        <boxGeometry args={[1.6, 1.8, 0.02]} />
        <meshStandardMaterial color="#36E1CC" emissive="#36E1CC" emissiveIntensity={0.3} />
      </mesh>

      {/* Holographic Diagnostic Scanner Laser */}
      {isScanning && (
        <mesh ref={scanBeamRef} position={[0, 0, 0.15]}>
          <planeGeometry args={[2.1, 0.08]} />
          <meshBasicMaterial color="#36E1CC" transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  );
}

export const PhoneModel3D: React.FC<{ isScanning?: boolean; className?: string }> = ({
  isScanning = false,
  className = '',
}) => {
  return (
    <div className={`relative w-full h-full min-h-[380px] flex items-center justify-center ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        fallback={<FallbackPhoneVisual isScanning={isScanning} />}
        className="w-full h-full"
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} color="#36E1CC" />
        <pointLight position={[-5, -5, -2]} intensity={0.8} color="#20B8FF" />
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
          <PhoneMesh isScanning={isScanning} />
        </Float>
        <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.2} minPolarAngle={Math.PI / 2 - 0.2} />
      </Canvas>
    </div>
  );
};
