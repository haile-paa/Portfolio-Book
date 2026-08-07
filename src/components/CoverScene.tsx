import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Slow-drifting field of gold embers behind the cover text.
 * Deliberately restrained: low particle count, soft opacity, gentle motion.
 * Respects prefers-reduced-motion by simply not animating (still renders static field).
 */
function Embers() {
  const ref = useRef<THREE.Points>(null);
  const reduced = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const positions = useMemo(() => {
    const count = 260;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current || reduced) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.02;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach='attributes-position' args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color='#C9A24B'
        transparent
        opacity={0.55}
        sizeAttenuation
      />
    </points>
  );
}

export default function CoverScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      className='!absolute inset-0'
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.4} />
      <Embers />
    </Canvas>
  );
}
