import { useRef, useMemo, Suspense, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

/* ── Custom Robot Model ────────────────────────────────── */
function RobotModel() {
  const { scene, animations } = useGLTF("/models/robot.glb");
  const ref = useRef<THREE.Group>(null!);
  const mixer = useRef<THREE.AnimationMixer | null>(null);

  // Setup animations if available
  useEffect(() => {
    if (animations.length > 0 && !mixer.current) {
      mixer.current = new THREE.AnimationMixer(scene);
      animations.forEach((clip) => {
        const action = mixer.current!.clipAction(clip);
        action.play();
      });
    }
    return () => {
      if (mixer.current) {
        mixer.current.stopAllAction();
        mixer.current = null;
      }
    };
  }, [scene, animations]);

  useFrame((_, delta) => {
    if (mixer.current) {
      mixer.current.update(delta);
    }
  });

  return (
    <Float speed={1.0} rotationIntensity={0.1} floatIntensity={0.2}>
      <primitive
        ref={ref}
        object={scene}
        scale={5.5}
        position={[0, -1.8, 0]}
      />
    </Float>
  );
}

/* ── Glowing Particle Ring ─────────────────────────────── */
function ParticleRing() {
  const ref = useRef<THREE.Points>(null!);
  const count = 50; // Reduced from 150 to 50 for better performance

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 2.5 + Math.random() * 0.4;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 0.12;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#22c55e" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

/* ── Main Scene ────────────────────────────────────────── */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
      <pointLight position={[-3, 2, 2]} intensity={0.8} color="#22c55e" />
      <pointLight position={[3, -1, -2]} intensity={0.4} color="#3b82f6" />

      <RobotModel />
      <ParticleRing />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5} // Reduced from 1 to 0.5 for better performance
        maxPolarAngle={Math.PI / 1.8}
        minPolarAngle={Math.PI / 3}
      />
    </>
  );
}

/* ── Loading Spinner ───────────────────────────────────── */
function Loader() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 2;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color="#22c55e" wireframe />
    </mesh>
  );
}

/* ── Exported Component ────────────────────────────────── */
function ErrorFallback() {
  return (
    <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-transparent">
      <div className="text-center p-8 backdrop-blur-sm bg-white/5 rounded-3xl border border-white/10">
        <div className="relative w-48 h-48 mx-auto mb-6">
          <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full animate-pulse" />
          <img 
            src="/logo.jpg" 
            alt="Agri Companion" 
            className="relative w-full h-full object-contain rounded-full shadow-2xl border-2 border-green-500/50" 
          />
        </div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
          Agri Companion AI
        </h3>
        <p className="text-slate-400 mt-2 text-sm max-w-[250px] mx-auto">
          Optimized interface for your device.
        </p>
      </div>
    </div>
  );
}

export default function Hero3DScene() {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    // Check WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setWebglSupported(false);
      setHasError(true);
      return;
    }

    // Fallback timeout for WebGL initialization
    const timeout = setTimeout(() => {
      if (isLoading) {
        setHasError(true);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [isLoading]);

  if (hasError || !webglSupported) return <ErrorFallback />;

  return (
    <div className="w-full h-full min-h-[500px]" style={{ cursor: "grab" }}>
      <Canvas
        camera={{ position: [0, 0.5, 8], fov: 50 }}
        dpr={[1, 1]} // Reduced from [1, 1.5] for better performance
        gl={{ 
          antialias: false, 
          alpha: true,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false
        }}
        onCreated={({ gl }) => {
          setIsLoading(false);
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            setHasError(true);
          }, false);
          gl.domElement.addEventListener('webglcontextrestored', () => {
            setHasError(false);
          }, false);
        }}
        onError={() => {
          setHasError(true);
        }}
        style={{ background: "transparent", overflow: "visible" }}
      >
        <Suspense fallback={<Loader />}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Preload the model
useGLTF.preload("/models/robot.glb");
