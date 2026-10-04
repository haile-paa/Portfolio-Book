import { useEffect, useRef, useState } from "react";

/**
 * Hero visual: three project cards in a floating stack.
 *
 * How it loads (this is what fixes the black boxes and the slow start):
 *  1. A CSS 3D version of the stack paints immediately. It uses small WebP
 *     images that index.html preloads, so there is never an empty frame.
 *  2. Three.js is imported only after the page is idle (not in the main bundle).
 *  3. The WebGL scene waits for every image to be decoded, renders one frame,
 *     and only then fades in over the CSS version. If WebGL is missing, the
 *     visitor prefers reduced motion, or Data Saver is on, the CSS version stays.
 */

interface Card {
  name: string;
  src: string;
  ratio: number; // image width / height
  w: number; // card width in scene units
  x: number;
  y: number;
  z: number;
  ry: number; // turn in radians
}

const RY = -0.32;
const CARDS: Card[] = [
  { name: "Pedal Delivery", src: "/images/hero-pedal.webp", ratio: 800 / 451, w: 3.7, x: -0.55, y: -1.5, z: 1.1, ry: RY },
  { name: "Hulu Service", src: "/images/hero-hulu.webp", ratio: 800 / 385, w: 3.5, x: 0.35, y: 0.1, z: 0, ry: RY },
  { name: "YOVA", src: "/images/hero-yova.webp", ratio: 800 / 409, w: 3.3, x: 1.15, y: 1.5, z: -1.2, ry: RY },
];
const CAM_Z = 9;
const FOV = 40;
const VISIBLE_H = 2 * CAM_Z * Math.tan((FOV / 2) * (Math.PI / 180)); // scene units visible at z=0

const css = `
@keyframes hero-in{from{opacity:0;transform:var(--t) translateY(36px) scale(.94)}to{opacity:1;transform:var(--t)}}
@keyframes hero-float{0%,100%{translate:0 0}50%{translate:0 -10px}}
.hero-card{animation:hero-in .9s cubic-bezier(.2,.7,.2,1) both,hero-float 6s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.hero-card{animation:none}}
`;

/** Instant CSS 3D version. Same composition as the WebGL scene. */
function Stack({ hidden }: { hidden: boolean }) {
  return (
    <div
      aria-hidden
      className='absolute inset-0 transition-opacity duration-700'
      style={{ opacity: hidden ? 0 : 1, perspective: `calc(var(--u) * ${CAM_Z})`, transformStyle: "preserve-3d" }}
    >
      {CARDS.map((c, i) => [c, i] as const).reverse().map(([c, i]) => (
        <img
          key={c.src}
          src={c.src}
          alt=''
          width={800}
          height={Math.round(800 / c.ratio)}
          decoding='async'
          draggable={false}
          className='hero-card absolute left-1/2 top-1/2 block rounded-[14px] border border-white/20 shadow-[0_30px_60px_-20px_rgba(0,0,0,.7)]'
          style={
            {
              width: `calc(var(--u) * ${c.w})`,
              height: "auto",
              "--t": `translate(-50%,-50%) translate3d(calc(var(--u) * ${c.x}),calc(var(--u) * ${-c.y}),calc(var(--u) * ${c.z})) rotateY(${((c.ry * 180) / Math.PI).toFixed(1)}deg)`,
              transform: "var(--t)",
              animationDelay: `${i * 0.12}s, ${i * 0.9}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export default function Scene() {
  const host = useRef<HTMLDivElement>(null);
  const mount = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = host.current!;
    const slot = mount.current!;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (calm || saveData) return; // the CSS stack is the final visual

    let dead = false;
    let cleanup = () => {};

    const start = async () => {
      let THREE: typeof import("three");
      try {
        THREE = await import("three");
      } catch {
        return;
      }
      if (dead) return;

      // 1) Decode all images before building anything, so no card is ever black.
      const imgs = await Promise.all(
        CARDS.map(
          (c) =>
            new Promise<HTMLImageElement>((resolve, reject) => {
              const im = new Image();
              im.src = c.src;
              im.decode().then(() => resolve(im), reject);
            }),
        ),
      ).catch(() => null);
      if (dead || !imgs) return;

      let renderer: import("three").WebGLRenderer;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      try {
        renderer = new THREE.WebGLRenderer({ antialias: dpr < 2, alpha: true, powerPreference: "high-performance" });
      } catch {
        return; // no WebGL: keep the CSS stack
      }
      renderer.setPixelRatio(dpr);
      renderer.setClearColor(0x000000, 0);
      const canvas = renderer.domElement;
      canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
      slot.appendChild(canvas);

      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(FOV, 1, 0.1, 50);
      cam.position.z = CAM_Z;
      const world = new THREE.Group();
      scene.add(world);

      const disposables: { dispose(): void }[] = [];
      const track = <T extends { dispose(): void }>(o: T) => (disposables.push(o), o);

      // helpers
      const roundedShape = (w: number, h: number, r: number) => {
        const s = new THREE.Shape();
        const x = -w / 2, y = -h / 2;
        s.moveTo(x + r, y);
        s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
        s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
        s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
        return s;
      };
      const radialTexture = (stops: [number, string][]) => {
        const c = document.createElement("canvas");
        c.width = c.height = 128;
        const g = c.getContext("2d")!;
        const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
        stops.forEach(([o, col]) => grd.addColorStop(o, col));
        g.fillStyle = grd;
        g.fillRect(0, 0, 128, 128);
        const t = track(new THREE.CanvasTexture(c));
        t.colorSpace = THREE.SRGBColorSpace;
        return t;
      };
      const shadowTexture = () => {
        const c = document.createElement("canvas");
        c.width = c.height = 256;
        const g = c.getContext("2d")!;
        g.shadowColor = "rgba(0,0,0,1)";
        g.shadowBlur = 38;
        g.fillStyle = "#000";
        g.beginPath();
        if (g.roundRect) g.roundRect(64, 64, 128, 128, 18);
        else g.rect(64, 64, 128, 128);
        g.fill();
        return track(new THREE.CanvasTexture(c));
      };

      // 2) Soft background glows
      const tealGlow = radialTexture([[0, "rgba(43,184,154,.55)"], [1, "rgba(43,184,154,0)"]]);
      const amberGlow = radialTexture([[0, "rgba(242,169,59,.45)"], [1, "rgba(242,169,59,0)"]]);
      const glow = (tex: import("three").Texture, x: number, y: number, size: number) => {
        const m = track(new THREE.SpriteMaterial({ map: tex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
        const s = new THREE.Sprite(m);
        s.position.set(x, y, -3.5);
        s.scale.set(size, size, 1);
        s.renderOrder = -2;
        world.add(s);
      };
      glow(tealGlow, 1.2, 0.8, 11);
      glow(amberGlow, -1.8, -2, 7);

      // 3) Cards: rounded, textured, with a soft shadow and a hairline border
      const shadowTex = shadowTexture();
      const maxAniso = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      const meshes = CARDS.map((c, i) => {
        const h = c.w / c.ratio;
        const shape = roundedShape(c.w, h, 0.14);
        const geo = track(new THREE.ShapeGeometry(shape, 8));
        const pos = geo.attributes.position;
        const uv = new Float32Array(pos.count * 2);
        for (let k = 0; k < pos.count; k++) {
          uv[k * 2] = (pos.getX(k) + c.w / 2) / c.w;
          uv[k * 2 + 1] = (pos.getY(k) + h / 2) / h;
        }
        geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));

        const tex = track(new THREE.Texture(imgs[i]));
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = maxAniso;
        tex.needsUpdate = true;
        const mat = track(new THREE.MeshBasicMaterial({ map: tex }));
        const mesh = new THREE.Mesh(geo, mat);

        const edge = track(new THREE.BufferGeometry().setFromPoints(shape.getPoints(10).map((p) => new THREE.Vector3(p.x, p.y, 0.002))));
        mesh.add(new THREE.LineLoop(edge, track(new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22 }))));

        const sh = new THREE.Mesh(
          track(new THREE.PlaneGeometry(c.w * 1.45, h * 1.6)),
          track(new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.55, depthWrite: false })),
        );
        sh.position.set(0.12, -0.22, -0.06);
        sh.renderOrder = -1;
        mesh.add(sh);

        mesh.position.set(c.x, c.y, c.z);
        mesh.rotation.y = c.ry;
        world.add(mesh);
        return { mesh, y: c.y, i };
      });

      // 4) A little dust
      const N = 90;
      const dust = new Float32Array(N * 3);
      for (let k = 0; k < N; k++) dust.set([(Math.random() - 0.5) * 9, (Math.random() - 0.5) * 7, -3 + Math.random() * 5], k * 3);
      const pg = track(new THREE.BufferGeometry());
      pg.setAttribute("position", new THREE.BufferAttribute(dust, 3));
      const dot = radialTexture([[0, "rgba(255,214,140,1)"], [1, "rgba(255,214,140,0)"]]);
      const pts = new THREE.Points(
        pg,
        track(new THREE.PointsMaterial({ map: dot, size: 0.12, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending })),
      );
      world.add(pts);

      // 5) Sizing
      const fit = () => {
        const w = el.clientWidth, h = el.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        cam.aspect = w / h;
        cam.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(() => { fit(); if (!raf) render(); });
      ro.observe(el);

      // 6) Loop: runs only while the hero is on screen and the tab is visible
      let mx = 0, my = 0, raf = 0, visible = true, last = performance.now(), t = 0;
      const onMove = (e: PointerEvent) => {
        mx = e.clientX / innerWidth - 0.5;
        my = e.clientY / innerHeight - 0.5;
      };
      addEventListener("pointermove", onMove, { passive: true });

      const render = () => {
        const sway = Math.sin(t * 0.35) * 0.1;
        world.rotation.y += (mx * 0.45 + sway - world.rotation.y) * 0.06;
        world.rotation.x += (my * 0.22 - world.rotation.x) * 0.06;
        meshes.forEach(({ mesh, y, i }) => { mesh.position.y = y + Math.sin(t * 0.8 + i * 2) * 0.1; });
        const arr = pg.attributes.position as import("three").BufferAttribute;
        for (let k = 0; k < N; k++) {
          let py = arr.getY(k) + 0.0025;
          if (py > 3.5) py = -3.5;
          arr.setY(k, py);
        }
        arr.needsUpdate = true;
        renderer.render(scene, cam);
      };
      const tick = (now: number) => {
        t += Math.min((now - last) / 1000, 0.05);
        last = now;
        render();
        raf = visible && !document.hidden ? requestAnimationFrame(tick) : 0;
      };
      const kick = () => {
        if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(tick); }
      };
      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); });
      io.observe(el);
      document.addEventListener("visibilitychange", kick);

      fit();
      render(); // first frame is drawn BEFORE we reveal the canvas
      setReady(true);
      kick();

      cleanup = () => {
        cancelAnimationFrame(raf);
        raf = 0;
        io.disconnect();
        ro.disconnect();
        removeEventListener("pointermove", onMove);
        document.removeEventListener("visibilitychange", kick);
        disposables.forEach((d) => d.dispose());
        renderer.dispose();
        renderer.forceContextLoss();
        canvas.remove();
      };
    };

    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const id = ric ? ric(() => void start(), { timeout: 700 }) : window.setTimeout(() => void start(), 150);

    return () => {
      dead = true;
      if (!ric) clearTimeout(id);
      cleanup();
      setReady(false);
    };
  }, []);

  return (
    <div
      ref={host}
      className='relative w-full h-[360px] md:h-[600px] [--h:360px] md:[--h:600px] overflow-visible'
      style={{ "--u": `calc(var(--h) / ${VISIBLE_H.toFixed(3)})` } as React.CSSProperties}
      role='img'
      aria-label='Floating previews of the Pedal Delivery, Hulu Service and YOVA apps'
    >
      <style>{css}</style>
      <Stack hidden={ready} />
      <div ref={mount} className='absolute inset-0 transition-opacity duration-700' style={{ opacity: ready ? 1 : 0 }} />
    </div>
  );
}
