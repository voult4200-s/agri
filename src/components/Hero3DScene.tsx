import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Environment, OrbitControls, useGLTF, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

/* ── Custom Robot Model ────────────────────────────────── */
function RobotModel() {
  const { scene, animations } = useGLTF("/models/robot.glb");
  const ref = useRef<THREE.Group>(null!);
  const mixer = useRef<THREE.AnimationMixer | null>(null);

  // Setup animations if available
  if (animations.length > 0 && !mixer.current) {
    mixer.current = new THREE.AnimationMixer(scene);
    animations.forEach((clip) => {
      const action = mixer.current!.clipAction(clip);
      action.play();
    });
  }

  useFrame((_, delta) => {
    if (mixer.current) {
      mixer.current.update(delta);
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
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
  const count = 150;

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

/* ── Mouse Follower Light ──────────────────────────────── */
function MouseLight() {
  const light = useRef<THREE.PointLight>(null!);
  const { viewport } = useThree();

  useFrame(({ pointer }) => {
    light.current.position.x = (pointer.x * viewport.width) / 2;
    light.current.position.y = (pointer.y * viewport.height) / 2;
  });

  return <pointLight ref={light} intensity={2} color="#86efac" distance={8} position={[0, 0, 3]} />;
}

/* ── Main Scene ────────────────────────────────────────── */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
      <pointLight position={[-3, 2, 2]} intensity={0.8} color="#22c55e" />
      <pointLight position={[3, -1, -2]} intensity={0.4} color="#3b82f6" />
      <MouseLight />

      <RobotModel />
      <ParticleRing />

      {/* Ground shadow */}
      <ContactShadows
        position={[0, -2.5, 0]}
        opacity={0.4}
        scale={10}
        blur={2}
        far={5}
      />

      <Environment preset="city" />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={1}
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
export default function Hero3DScene() {
  return (
    <div className="w-full h-full min-h-[500px]" style={{ cursor: "grab" }}>
      <Canvas
        camera={{ position: [0, 0.5, 8], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
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
