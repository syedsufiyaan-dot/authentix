import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

function PremiumPhone() {
  const phoneRef = useRef<THREE.Group>(null);
  const scanLineRef = useRef<THREE.Mesh>(null);
  const scanGlowRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  const screenTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 1200;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return new THREE.CanvasTexture(canvas);
    }

    const gradient = ctx.createLinearGradient(0, 0, 600, 1200);
    gradient.addColorStop(0, '#071525');
    gradient.addColorStop(0.35, '#0c3970');
    gradient.addColorStop(0.68, '#1066ae');
    gradient.addColorStop(1, '#06111c');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 1200);

    const glow = ctx.createRadialGradient(
      430,
      420,
      30,
      430,
      420,
      430
    );

    glow.addColorStop(0, 'rgba(40,210,255,0.78)');
    glow.addColorStop(0.45, 'rgba(20,100,220,0.38)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 600, 1200);

    ctx.strokeStyle = 'rgba(85,220,255,0.25)';
    ctx.lineWidth = 48;
    ctx.beginPath();
    ctx.arc(470, 650, 340, 0.7, 4.3);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(50,140,255,0.18)';
    ctx.lineWidth = 75;
    ctx.beginPath();
    ctx.arc(90, 470, 300, -1, 2.2);
    ctx.stroke();

    // Status bar
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 27px Arial';
    ctx.fillText('9:41', 42, 62);

    // Date
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.82)';
    ctx.font = '23px Arial';
    ctx.fillText('Friday, September 5', 300, 230);

    // Time
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 102px Arial';
    ctx.fillText('9:41', 300, 340);

    // Home indicator
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.roundRect(220, 1135, 160, 9, 6);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    return texture;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (phoneRef.current) {
      // Smooth full 360 rotation
      phoneRef.current.rotation.y = t * 0.24;

      // subtle premium tilt
      phoneRef.current.rotation.x =
        -0.045 + Math.sin(t * 0.3) * 0.018;

      phoneRef.current.rotation.z =
        Math.sin(t * 0.22) * 0.012;

      phoneRef.current.position.y =
        Math.sin(t * 0.7) * 0.045;
    }

    // Scanning line moving vertically
    if (scanLineRef.current) {
      scanLineRef.current.position.y =
        Math.sin(t * 1.65) * 1.58;
    }

    // Glow follows scan line
    if (scanGlowRef.current) {
      scanGlowRef.current.position.y =
        Math.sin(t * 1.65) * 1.58;

      const mat = scanGlowRef.current.material as THREE.MeshBasicMaterial;

      mat.opacity =
        0.08 + Math.abs(Math.sin(t * 1.65)) * 0.13;
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * 0.16;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.11;
    }
  });

  return (
    <>
      <group ref={phoneRef}>

        {/* Slim titanium body */}
        <RoundedBox
          args={[1.95, 4.45, 0.22]}
          radius={0.20}
          smoothness={10}
        >
          <meshPhysicalMaterial
            color="#c8cdd2"
            metalness={1}
            roughness={0.08}
            clearcoat={1}
            clearcoatRoughness={0.035}
          />
        </RoundedBox>

        {/* Front glass */}
        <RoundedBox
          args={[1.86, 4.34, 0.035]}
          radius={0.17}
          smoothness={10}
          position={[0, 0, 0.13]}
        >
          <meshPhysicalMaterial
            color="#020407"
            metalness={0.1}
            roughness={0.015}
            clearcoat={1}
            clearcoatRoughness={0}
          />
        </RoundedBox>

        {/* Screen */}
        <mesh position={[0, 0, 0.151]}>
          <planeGeometry args={[1.76, 4.15]} />
          <meshBasicMaterial map={screenTexture} />
        </mesh>

        {/* Dynamic island */}
        <RoundedBox
          args={[0.60, 0.16, 0.022]}
          radius={0.08}
          smoothness={8}
          position={[0, 1.82, 0.17]}
        >
          <meshBasicMaterial color="#000000" />
        </RoundedBox>

        {/* Front camera */}
        <mesh position={[0.19, 1.82, 0.184]}>
          <circleGeometry args={[0.032, 32]} />
          <meshStandardMaterial
            color="#071621"
            emissive="#06314a"
            emissiveIntensity={0.45}
          />
        </mesh>

        {/* SCANNING LINE */}
        <mesh
          ref={scanLineRef}
          position={[0, 0, 0.19]}
        >
          <planeGeometry args={[1.68, 0.026]} />

          <meshBasicMaterial
            color="#53fff0"
            transparent
            opacity={0.95}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* SCANNING GLOW */}
        <mesh
          ref={scanGlowRef}
          position={[0, 0, 0.185]}
        >
          <planeGeometry args={[1.70, 0.32]} />

          <meshBasicMaterial
            color="#36E1CC"
            transparent
            opacity={0.12}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Left buttons */}
        <RoundedBox
          args={[0.045, 0.48, 0.075]}
          radius={0.018}
          position={[-0.995, 0.62, 0]}
        >
          <meshStandardMaterial
            color="#d4d8db"
            metalness={1}
            roughness={0.1}
          />
        </RoundedBox>

        <RoundedBox
          args={[0.045, 0.48, 0.075]}
          radius={0.018}
          position={[-0.995, 0.05, 0]}
        >
          <meshStandardMaterial
            color="#d4d8db"
            metalness={1}
            roughness={0.1}
          />
        </RoundedBox>

        {/* Right power button */}
        <RoundedBox
          args={[0.045, 0.70, 0.075]}
          radius={0.018}
          position={[0.995, 0.38, 0]}
        >
          <meshStandardMaterial
            color="#d4d8db"
            metalness={1}
            roughness={0.1}
          />
        </RoundedBox>

        {/* Back panel */}
        <RoundedBox
          args={[1.86, 4.33, 0.03]}
          radius={0.17}
          smoothness={10}
          position={[0, 0, -0.13]}
        >
          <meshPhysicalMaterial
            color="#778087"
            metalness={0.72}
            roughness={0.15}
            clearcoat={1}
            clearcoatRoughness={0.06}
          />
        </RoundedBox>

        {/* Rear camera island */}
        <RoundedBox
          args={[0.70, 0.88, 0.09]}
          radius={0.14}
          smoothness={8}
          position={[-0.48, 1.48, -0.18]}
        >
          <meshPhysicalMaterial
            color="#8b9399"
            metalness={0.9}
            roughness={0.11}
          />
        </RoundedBox>

        {/* Camera lenses */}
        {[
          [-0.62, 1.65],
          [-0.34, 1.58],
          [-0.58, 1.32],
        ].map(([x, y], index) => (
          <mesh
            key={index}
            position={[x, y, -0.25]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry
              args={[0.125, 0.125, 0.05, 48]}
            />

            <meshPhysicalMaterial
              color="#071420"
              metalness={0.5}
              roughness={0.035}
              clearcoat={1}
            />
          </mesh>
        ))}

        {/* Flash */}
        <mesh position={[-0.31, 1.31, -0.235]}>
          <circleGeometry args={[0.052, 32]} />
          <meshBasicMaterial color="#f3e9cf" />
        </mesh>

      </group>

      {/* Holographic scan platform */}
      <group position={[0, -2.48, 0]}>

        <mesh
          ref={ring1Ref}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry
            args={[1.25, 0.022, 20, 100]}
          />

          <meshBasicMaterial
            color="#36E1CC"
            transparent
            opacity={0.75}
          />
        </mesh>

        <mesh
          ref={ring2Ref}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 0.02, 0]}
        >
          <torusGeometry
            args={[0.92, 0.011, 20, 100]}
          />

          <meshBasicMaterial
            color="#20B8FF"
            transparent
            opacity={0.50}
          />
        </mesh>

      </group>
    </>
  );
}

export const PhoneModel3D: React.FC<{
  isScanning?: boolean;
  className?: string;
}> = ({
  className = '',
}) => {
  return (
    <div
      className={`relative w-full h-full min-h-[420px] overflow-hidden rounded-3xl ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(32,184,255,0.09),transparent_68%)]" />

      <Canvas
        camera={{
          position: [0, 0.05, 7.2],
          fov: 35,
        }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
      >
        <ambientLight intensity={1.3} />

        <directionalLight
          position={[4, 6, 5]}
          intensity={3.6}
          color="#ffffff"
        />

        <directionalLight
          position={[-4, 2, -3]}
          intensity={2.1}
          color="#9fdcff"
        />

        <pointLight
          position={[-4, 2, 4]}
          intensity={6}
          distance={10}
          color="#36E1CC"
        />

        <pointLight
          position={[4, -2, 3]}
          intensity={5}
          distance={10}
          color="#20B8FF"
        />

        <PremiumPhone />
      </Canvas>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-5 py-2 rounded-xl border border-accent-cyan/20 bg-bg-darkest/60 backdrop-blur-lg">
        <span className="text-[9px] tracking-[0.25em] uppercase font-mono text-accent-cyan whitespace-nowrap">
          Scanning Device
        </span>
      </div>
    </div>
  );
};
