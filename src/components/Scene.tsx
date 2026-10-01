import { useEffect, useRef } from "react";
import * as THREE from "three";

const CARDS: [string, number, number, number, number, number][] = [
  ["/images/pedal.jpg", 1.77, -1.1, 1.35, -1.2, 0.28],
  ["/images/hulu.jpg", 2.08, 1.0, -0.1, 0.5, -0.22],
  ["/images/yova.jpg", 1.95, -1.0, -1.6, -0.2, 0.16],
];

export default function Scene() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    r.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(r.domElement);
    const s = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(
      40,
      el.clientWidth / el.clientHeight,
      0.1,
      100,
    );
    cam.position.z = 9;
    const g = new THREE.Group();
    s.add(g);
    const amber = 0xf2a93b,
      loader = new THREE.TextureLoader();
    const cards = CARDS.map(([src, a, x, y, z, ry], i) => {
      const tex = loader.load(src);
      tex.colorSpace = THREE.SRGBColorSpace;
      const geo = new THREE.PlaneGeometry(3.5, 3.5 / a);
      const m = new THREE.Mesh(
        geo,
        new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }),
      );
      m.add(
        new THREE.LineSegments(
          new THREE.EdgesGeometry(geo),
          new THREE.LineBasicMaterial({
            color: amber,
            transparent: true,
            opacity: 0.6,
          }),
        ),
      );
      m.position.set(x, y, z);
      m.rotation.y = ry;
      g.add(m);
      return { m, y, i };
    });
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(3.7, 0.012, 8, 160),
      new THREE.MeshBasicMaterial({
        color: amber,
        transparent: true,
        opacity: 0.7,
      }),
    );
    ring.position.z = -2.5;
    ring.rotation.x = 0.35;
    g.add(ring);
    const mesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.2, 1),
      new THREE.MeshBasicMaterial({
        color: 0x2bb89a,
        wireframe: true,
        transparent: true,
        opacity: 0.25,
      }),
    );
    mesh.position.set(1.8, 1.4, -3);
    g.add(mesh);
    const n = 320,
      pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = Math.random() * 6.283,
        v = Math.acos(2 * Math.random() - 1),
        d = 3.5 + Math.random() * 3;
      pos.set(
        [
          d * Math.sin(v) * Math.cos(u),
          d * Math.sin(v) * Math.sin(u),
          d * Math.cos(v) - 1,
        ],
        i * 3,
      );
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(
      pg,
      new THREE.PointsMaterial({
        color: amber,
        size: 0.045,
        transparent: true,
        opacity: 0.8,
      }),
    );
    g.add(pts);
    let mx = 0,
      my = 0,
      t = 0,
      raf = 0;
    const move = (e: PointerEvent) => {
      mx = e.clientX / innerWidth - 0.5;
      my = e.clientY / innerHeight - 0.5;
    };
    addEventListener("pointermove", move);
    const draw = () => {
      t += 0.01;
      g.rotation.y +=
        (mx * 0.5 - g.rotation.y + Math.sin(t * 0.4) * 0.12) * 0.05;
      g.rotation.x += (my * 0.25 - g.rotation.x) * 0.05;
      cards.forEach(
        (c) => (c.m.position.y = c.y + Math.sin(t * 0.8 + c.i * 2) * 0.12),
      );
      ring.rotation.z = t * 0.15;
      mesh.rotation.x = t * 0.2;
      mesh.rotation.y = t * 0.3;
      pts.rotation.y = t * 0.04;
      r.render(s, cam);
      if (!calm) raf = requestAnimationFrame(draw);
    };
    const ro = new ResizeObserver(() => {
      r.setSize(el.clientWidth, el.clientHeight);
      cam.aspect = el.clientWidth / el.clientHeight;
      cam.updateProjectionMatrix();
      if (calm) draw();
    });
    ro.observe(el);
    draw();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      ro.disconnect();
      r.dispose();
      el.removeChild(r.domElement);
    };
  }, []);
  return (
    <div
      ref={ref}
      className='w-full h-[360px] md:h-[600px]'
      role='img'
      aria-label='Floating 3D previews of the Pedal Delivery, Hulu Service and YOVA apps'
    />
  );
}
