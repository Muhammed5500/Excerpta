"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// --- Floating nodes that form a knowledge network ---
function Nodes({ scrollY }: { scrollY: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const pointsRef = useRef<THREE.Points>(null!);
  const linesRef = useRef<THREE.LineSegments>(null!);

  const count = 200;

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const centers = [
      { x: -3, y: 1, z: 0, color: [0.776, 0.38, 0.247] },
      { x: 2.5, y: 1.5, z: -1, color: [0.416, 0.608, 0.8] },
      { x: 0, y: -1, z: 1, color: [0.471, 0.549, 0.365] },
      { x: 3, y: -1.5, z: 0.5, color: [0.831, 0.635, 0.498] },
      { x: -2, y: -2, z: -0.5, color: [0.769, 0.4, 0.525] },
    ];

    for (let i = 0; i < count; i++) {
      const c = centers[Math.floor(Math.random() * centers.length)];
      const spread = 2.2;
      pos[i * 3] = c.x + (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = c.y + (Math.random() - 0.5) * spread;
      pos[i * 3 + 2] = c.z + (Math.random() - 0.5) * spread;

      const vary = 0.12;
      col[i * 3] = c.color[0] + (Math.random() - 0.5) * vary;
      col[i * 3 + 1] = c.color[1] + (Math.random() - 0.5) * vary;
      col[i * 3 + 2] = c.color[2] + (Math.random() - 0.5) * vary;
    }

    return { positions: pos, colors: col };
  }, []);

  const linePositions = useMemo(() => {
    const lines: number[] = [];
    const threshold = 1.8;
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        if (Math.sqrt(dx * dx + dy * dy + dz * dz) < threshold) {
          lines.push(
            positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
            positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
          );
        }
      }
    }
    return new Float32Array(lines);
  }, [positions]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Continuous scroll value in "viewport units"
    const sv = scrollY / window.innerHeight;

    if (groupRef.current) {
      // Constant slow rotation + scroll-driven twist
      groupRef.current.rotation.y = t * 0.04 + sv * 0.5;
      groupRef.current.rotation.x = Math.sin(t * 0.025) * 0.15 + sv * 0.1;
      groupRef.current.position.y = sv * 0.4;
    }

    if (pointsRef.current) {
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      mat.size = 0.06 + Math.sin(t * 0.4) * 0.012;
      mat.opacity = Math.max(0.55, 1 - sv * 0.25);
    }

    if (linesRef.current) {
      const mat = linesRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = Math.max(0.12, 0.25 - sv * 0.06);
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.06} vertexColors transparent opacity={1} sizeAttenuation depthWrite={false} />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#87867f" transparent opacity={0.2} depthWrite={false} />
      </lineSegments>
    </group>
  );
}

// --- Floating accent rings ---
function FloatingRings({ scrollY }: { scrollY: number }) {
  const ring1Ref = useRef<THREE.Mesh>(null!);
  const ring2Ref = useRef<THREE.Mesh>(null!);
  const ring3Ref = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const sv = scrollY / window.innerHeight;
    const ringOpacity = Math.max(0.08, 0.22 - sv * 0.04);

    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.12 + sv * 0.3;
      ring1Ref.current.rotation.z = t * 0.08;
      ring1Ref.current.position.y = Math.sin(t * 0.18) * 0.3;
      (ring1Ref.current.material as THREE.MeshBasicMaterial).opacity = ringOpacity;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = t * 0.1 + sv * 0.2;
      ring2Ref.current.rotation.x = t * 0.07;
      ring2Ref.current.position.y = Math.cos(t * 0.14) * 0.2;
      (ring2Ref.current.material as THREE.MeshBasicMaterial).opacity = ringOpacity;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = t * 0.09 + sv * 0.4;
      ring3Ref.current.rotation.y = t * 0.05;
      (ring3Ref.current.material as THREE.MeshBasicMaterial).opacity = ringOpacity * 0.6;
    }
  });

  return (
    <>
      <mesh ref={ring1Ref} position={[-2.5, 0.5, -1]}>
        <torusGeometry args={[1.5, 0.008, 16, 100]} />
        <meshBasicMaterial color="#c6613f" transparent opacity={0.15} />
      </mesh>
      <mesh ref={ring2Ref} position={[2, -0.5, -0.5]}>
        <torusGeometry args={[1.2, 0.006, 16, 100]} />
        <meshBasicMaterial color="#6a9bcc" transparent opacity={0.15} />
      </mesh>
      <mesh ref={ring3Ref} position={[0, 0, -2]}>
        <torusGeometry args={[2, 0.005, 16, 100]} />
        <meshBasicMaterial color="#788c5d" transparent opacity={0.1} />
      </mesh>
    </>
  );
}

// --- Camera ---
function CameraRig({ scrollY }: { scrollY: number }) {
  const { camera } = useThree();

  useFrame(() => {
    const sv = scrollY / window.innerHeight;
    camera.position.z = 6 - Math.min(sv, 1) * 2;
    camera.position.y = Math.min(sv, 1) * 0.5;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// --- Background canvas (fixed, full page) ---
export function SceneBackground() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 6], fov: 50 }}
        style={{ background: "transparent" }}
      >
        <CameraRig scrollY={scrollY} />
        <ambientLight intensity={0.5} />
        <Nodes scrollY={scrollY} />
        <FloatingRings scrollY={scrollY} />
      </Canvas>
    </div>
  );
}

// --- Hero overlay (the text portion) ---
export default function HeroScene() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const h = containerRef.current.offsetHeight;
      setScrollProgress(Math.min(1, Math.max(0, -rect.top / h)));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="relative h-[100vh] w-full">
      <div
        className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center"
        style={{ opacity: 1 - scrollProgress * 1.5 }}
      >
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full card-bg backdrop-blur-sm border border-border-light">
            <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" />
            <span className="text-xs text-slate-medium font-medium tracking-wide">
              Live from 34+ sources
            </span>
          </div>
        </div>

        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-light text-slate-primary leading-[1.05] tracking-tight max-w-4xl">
          Research,
          <br />
          <span className="text-terracotta">distilled.</span>
        </h1>

        <p className="mt-6 text-base md:text-lg text-slate-medium max-w-lg leading-relaxed">
          Curated research and articles on blockchain, AI,
          game theory, and more — all in one place.
        </p>

        <div className="absolute bottom-10 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-[10px] uppercase tracking-[0.2em] text-slate-muted">Scroll</span>
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
            <path d="M8 4V20M8 20L2 14M8 20L14 14" stroke="#87867f" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
