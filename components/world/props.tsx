"use client";
// Đạo cụ dùng chung cho mọi trạm trong "phòng chuyên án".
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { damp, rng, useFontsReady } from "../three/kit";

export const HEX = { ivory: "#e9e2d0", red: "#c8323a", redDeep: "#7a1218", gold: "#d8b250", green: "#4f9e6c", dim: "#4a463e", felt: "#14241a", paper: "#f3eee2", ink: "#1a1a1a", night: "#0b0a08", manila: "#c9a66b" };
export const K = Object.fromEntries(Object.entries(HEX).map(([k, v]) => [k, new THREE.Color(v)])) as Record<keyof typeof HEX, THREE.Color>;
export type V3 = [number, number, number];
export type SP = { step: number; active: boolean; past: boolean };

/* ---------- chữ và họa tiết vẽ bằng canvas ---------- */
export const F = {
  serif: (px: number, w = 800, it = false) => `${it ? "italic " : ""}${w} ${px}px "Noto Serif", Georgia, serif`,
  sans: (px: number, w = 600) => `${w} ${px}px "Be Vietnam Pro", system-ui, sans-serif`,
  mono: (px: number, w = 700) => `${w} ${px}px "JetBrains Mono", monospace`,
  hand: (px: number) => `400 ${px}px "Patrick Hand", "Segoe Print", cursive`,
};
export function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d")!, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
/** Tạo texture và tự vẽ lại khi phông chữ web nạp xong. */
export function useTex(make: () => THREE.Texture, deps: unknown[]) {
  const f = useFontsReady();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const t = useMemo(make, [...deps, f]);
  useEffect(() => () => t.dispose(), [t]);
  return t;
}
export function grain(g: CanvasRenderingContext2D, w: number, h: number, seed = 1, n = 1800) {
  const r = rng(seed); for (let i = 0; i < n; i++) { g.fillStyle = `rgba(80,60,30,${r() * 0.06})`; g.fillRect(r() * w, r() * h, 2, 2); }
}
/** Viết chữ tự xuống dòng, trả về tọa độ y sau dòng cuối. */
export function wrapFill(g: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
  let line = "";
  for (const word of text.split(" ")) {
    const t = line ? line + " " + word : word;
    if (g.measureText(t).width > maxW && line) { g.fillText(line, x, y); y += lh; line = word; } else line = t;
  }
  if (line) { g.fillText(line, x, y); y += lh; }
  return y;
}
export type PaperKind = "photo" | "doc" | "note" | "net" | "card" | "money" | "web";
export function paperTexture(kind: PaperKind, seed: number, tag?: string) {
  return canvasTex(512, 640, (g, W, H) => {
    const r = rng(seed);
    g.fillStyle = kind === "note" ? "#f2df8f" : "#f5f1e6"; g.fillRect(0, 0, W, H); grain(g, W, H, seed);
    if (kind === "photo") {
      const grd = g.createLinearGradient(0, 30, 0, 450); grd.addColorStop(0, "#5d564b"); grd.addColorStop(1, "#24211c");
      g.fillStyle = grd; g.fillRect(34, 34, W - 68, 430);
      g.fillStyle = "#14120f"; g.beginPath(); g.arc(W / 2, 210, 74, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(W / 2, 464, 160, 150, 0, Math.PI, 0); g.fill();
    } else if (kind === "doc" || kind === "note") {
      g.fillStyle = "#b3202a"; g.fillRect(44, 50, 200, 16); g.fillStyle = "#1a1a1a"; g.fillRect(44, 90, 330, 22);
      for (let y = 150; y < H - 130; y += 30) { g.fillStyle = "rgba(40,40,40,.35)"; g.fillRect(44, y, 300 + r() * 120, 9); if (r() < 0.2) { g.fillStyle = "#111"; g.fillRect(44 + r() * 120, y - 4, 90 + r() * 90, 17); } }
    } else if (kind === "net") {
      const pts = Array.from({ length: 12 }, () => [70 + r() * (W - 140), 90 + r() * (H - 280)] as const);
      g.strokeStyle = "rgba(26,26,26,.55)"; g.lineWidth = 3;
      pts.forEach((p, i) => { const q = pts[(i * 5 + 3) % pts.length]; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke(); });
      pts.forEach((p, i) => { g.fillStyle = i % 4 === 0 ? "#b3202a" : "#1a1a1a"; g.beginPath(); g.arc(p[0], p[1], i % 4 === 0 ? 15 : 9, 0, Math.PI * 2); g.fill(); });
    } else if (kind === "money") {
      for (let i = 0; i < 4; i++) { const y = 70 + i * 100; g.fillStyle = "#cfdcc4"; g.fillRect(60, y, W - 120, 78); g.strokeStyle = "#3d6b4a"; g.lineWidth = 5; g.strokeRect(60, y, W - 120, 78); g.beginPath(); g.arc(W / 2, y + 39, 26, 0, Math.PI * 2); g.stroke(); }
    } else if (kind === "web") {
      g.fillStyle = "#23211d"; g.fillRect(40, 44, W - 80, 400); g.fillStyle = "#3a3731"; g.fillRect(40, 44, W - 80, 44);
      ["#c8323a", "#d8b250", "#4f9e6c"].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(66 + i * 28, 66, 8, 0, Math.PI * 2); g.fill(); });
      for (let y = 120; y < 420; y += 34) { g.fillStyle = "rgba(233,226,208,.5)"; g.fillRect(66, y, 200 + r() * 180, 10); }
    } else { g.fillStyle = "#b3202a"; g.fillRect(40, 240, 260, 10); g.fillStyle = "rgba(40,40,40,.4)"; g.fillRect(40, 270, 380, 9); }
    if (tag) { g.fillStyle = "#b3202a"; g.font = F.mono(34); g.fillText(tag, 44, H - 50); }
  });
}
export function feltTexture() {
  const t = canvasTex(512, 512, (g) => {
    const r = rng(3); g.fillStyle = "#2f251a"; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 9000; i++) { g.fillStyle = r() < 0.5 ? `rgba(15,10,6,${r() * 0.35})` : `rgba(120,95,60,${r() * 0.14})`; g.fillRect(r() * 512, r() * 512, 2 + r() * 3, 2 + r() * 3); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(28, 18);
  return t;
}

/* ---------- thời gian ---------- */
/** Mốc thời gian (giây) của lần gần nhất `dep` đổi giá trị. Dùng: t - since.current. */
export function useSince(dep: unknown) {
  const at = useRef(0), pending = useRef(true);
  useEffect(() => { pending.current = true; }, [dep]);
  useFrame(({ clock }) => { if (pending.current) { at.current = clock.elapsedTime; pending.current = false; } });
  return at;
}
export const ease = (x: number) => { const t = Math.min(Math.max(x, 0), 1); return t * t * (3 - 2 * t); };

/* ---------- quân cờ hình người ---------- */
const pawnGeo = (() => {
  const pts: THREE.Vector2[] = [[0, 0], [0.3, 0], [0.3, 0.06], [0.22, 0.12], [0.12, 0.5], [0.17, 0.55], [0.09, 0.61]].map(([x, y]) => new THREE.Vector2(x, y));
  for (let a = -55; a <= 90; a += 14.5) pts.push(new THREE.Vector2(Math.cos((a * Math.PI) / 180) * 0.17, 0.77 + Math.sin((a * Math.PI) / 180) * 0.17));
  pts.push(new THREE.Vector2(0, 0.94));
  return new THREE.LatheGeometry(pts, 20);
})();
export type PawnT = { p: THREE.Vector3; c: THREE.Color; s: number };
/** Đám quân cờ. `place` được gọi mỗi khung hình để nêu vị trí, màu, cỡ mong muốn; quân cờ tự trượt mượt tới đó. */
export function Crowd({ count, place, lambda = 3, out }: { count: number; place: (i: number, o: PawnT, t: number) => void; lambda?: number; out?: React.MutableRefObject<PawnT[] | null> }) {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const st = useMemo(() => Array.from({ length: count }, () => ({ p: new THREE.Vector3(), c: new THREE.Color(), s: 1 })), [count]);
  const o = useMemo(() => ({ p: new THREE.Vector3(), c: new THREE.Color(), s: 1 }), []);
  const d = useMemo(() => new THREE.Object3D(), []);
  const init = useRef(false);
  useFrame(({ clock }, dt) => {
    const k = init.current ? 1 - Math.exp(-lambda * Math.min(dt, 0.05)) : 1;
    for (let i = 0; i < count; i++) {
      o.s = 1; o.c.copy(K.ivory); o.p.set(0, 0, 0); place(i, o, clock.elapsedTime);
      const s = st[i]; s.p.lerp(o.p, k); s.c.lerp(o.c, k); s.s += (o.s - s.s) * k;
      d.position.copy(s.p); d.scale.setScalar(Math.max(s.s, 1e-4)); d.updateMatrix();
      mesh.current.setMatrixAt(i, d.matrix); mesh.current.setColorAt(i, s.c);
    }
    init.current = true; if (out) out.current = st;
    mesh.current.instanceMatrix.needsUpdate = true; if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  });
  return <instancedMesh ref={mesh} args={[pawnGeo, undefined, count]} castShadow frustumCulled={false}><meshStandardMaterial roughness={0.42} metalness={0.05} /></instancedMesh>;
}

/* ---------- giấy tờ, biển, bìa hồ sơ ---------- */
/** Tờ giấy nằm trên mặt bàn. */
export function Sheet({ tex, w, h, position = [0, 0.02, 0], rot = 0 }: { tex: THREE.Texture; w: number; h: number; position?: V3; rot?: number }) {
  return <mesh position={position} rotation={[-Math.PI / 2, 0, rot]} receiveShadow castShadow><planeGeometry args={[w, h]} /><meshStandardMaterial map={tex} roughness={0.95} /></mesh>;
}
/** Biển đứng: thân tối, mặt trước là texture. `glow` 0..1 làm mờ/sáng. */
export function Sign({ tex, w, h, glow = 1, position, rotation }: { tex: THREE.Texture; w: number; h: number; glow?: number; position?: V3; rotation?: V3 }) {
  const m = useRef<THREE.MeshStandardMaterial>(null!); const g = useRef(glow);
  useFrame((_, dt) => { g.current = damp(g.current, glow, 4, dt); m.current.color.setScalar(0.3 + 0.7 * g.current); });
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow position={[0, h / 2, 0]}><boxGeometry args={[w, h, 0.08]} /><meshStandardMaterial color="#2a251d" roughness={0.9} /></mesh>
      <mesh position={[0, h / 2, 0.045]}><planeGeometry args={[w * 0.96, h * 0.96]} /><meshStandardMaterial ref={m} map={tex} roughness={0.9} /></mesh>
    </group>
  );
}
export function Pin({ position, color = HEX.red, s = 1 }: { position: V3; color?: string; s?: number }) {
  return <group position={position} scale={s}>
    <mesh castShadow position={[0, 0.16, 0]}><sphereGeometry args={[0.09, 20, 20]} /><meshStandardMaterial color={color} roughness={0.25} metalness={0.2} /></mesh>
    <mesh position={[0, 0.06, 0]}><cylinderGeometry args={[0.012, 0.012, 0.14]} /><meshStandardMaterial color="#bbb" metalness={0.9} roughness={0.2} /></mesh>
  </group>;
}
/** Bìa hồ sơ nằm trên bàn, nắp bật lên như nắp cặp. */
/** Bìa hồ sơ có nắp lật. `children` gắn lên mặt nắp (tọa độ tính từ tâm mặt bìa, trục y hướng lên), lật theo nắp. */
export function Folder({ open, w = 5, d = 3.4, cover, inside, position, children }: { open: boolean; w?: number; d?: number; cover: THREE.Texture; inside?: THREE.Texture; position?: V3; children?: React.ReactNode }) {
  const lid = useRef<THREE.Group>(null!), a = useRef(0);
  useFrame((_, dt) => { a.current = damp(a.current, open ? 1 : 0, 3, dt); lid.current.rotation.x = -a.current * 1.95; });
  return (
    <group position={position}>
      <mesh position={[0, 0.03, 0]} castShadow receiveShadow><boxGeometry args={[w, 0.06, d]} /><meshStandardMaterial color={HEX.manila} roughness={0.9} /></mesh>
      {inside && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0.04]} receiveShadow><planeGeometry args={[w * 0.92, d * 0.9]} /><meshStandardMaterial map={inside} roughness={0.95} /></mesh>}
      <group ref={lid} position={[0, 0.1, -d / 2]}>
        <mesh position={[0, 0, d / 2]} castShadow><boxGeometry args={[w, 0.05, d]} /><meshStandardMaterial color="#d2b078" roughness={0.85} /></mesh>
        {/* nhãn đỏ: mỏng hơn và lệch tâm so với nắp để hai mặt không trùng nhau (tránh z-fighting nhấp nháy) */}
        <mesh position={[w * 0.28, -0.002, d + 0.12]} castShadow><boxGeometry args={[w * 0.3, 0.03, 0.34]} /><meshStandardMaterial color="#b3202a" roughness={0.8} /></mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, d / 2]}><planeGeometry args={[w * 0.94, d * 0.9]} /><meshStandardMaterial map={cover} roughness={0.9} /></mesh>
        {children && <group position={[0, 0.03, d / 2]}>{children}</group>}
      </group>
    </group>
  );
}
/** Luồng đèn rọi từ trên xuống một điểm. */
export function Beam({ position, on, h = 5, r = 0.75, color = "#ffe2b0" }: { position: V3; on: boolean; h?: number; r?: number; color?: string }) {
  const m = useRef<THREE.MeshBasicMaterial>(null!);
  useFrame(({ clock }, dt) => { m.current.opacity = damp(m.current.opacity, on ? 0.2 + Math.sin(clock.elapsedTime * 3 + position[0]) * 0.03 : 0, 4, dt); });
  return <mesh position={[position[0], position[1] + h / 2, position[2]]}><coneGeometry args={[r, h, 28, 1, true]} /><meshBasicMaterial ref={m} color={color} transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} /></mesh>;
}
/** Khối hộp mọc lên từ mặt bàn (tường, bục, bậc). */
export function Rise({ on, size, position, color, opacity = 1, lambda = 3 }: { on: boolean; size: V3; position: V3; color: string; opacity?: number; lambda?: number }) {
  const g = useRef<THREE.Group>(null!), a = useRef(0);
  useFrame((_, dt) => { a.current = damp(a.current, on ? 1 : 0, lambda, dt); g.current.scale.y = Math.max(a.current, 1e-3); g.current.visible = a.current > 0.01; });
  return <group ref={g} position={position}><mesh position={[0, size[1] / 2, 0]} castShadow={opacity === 1} receiveShadow><boxGeometry args={size} /><meshStandardMaterial color={color} roughness={0.85} transparent={opacity < 1} opacity={opacity} depthWrite={opacity === 1} /></mesh></group>;
}
/** Mặt lưới phát sáng (mặt "mạng"). */
export function GlowGrid({ w, d, color, y = 0, fill = 0.1, div = 20 }: { w: number; d: number; color: string; y?: number; fill?: number; div?: number }) {
  const grid = useMemo(() => { const g = new THREE.GridHelper(1, div, color, color); const m = g.material as THREE.Material; m.transparent = true; m.opacity = 0.45; m.depthWrite = false; return g; }, [color, div]);
  const edge = useMemo(() => new THREE.EdgesGeometry(new THREE.PlaneGeometry(w, d)), [w, d]);
  return (
    <group position={[0, y, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[w, d]} /><meshStandardMaterial color={color} transparent opacity={fill} depthWrite={false} side={THREE.DoubleSide} /></mesh>
      <primitive object={grid} scale={[w, 1, d]} position={[0, 0.01, 0]} />
      <lineSegments geometry={edge} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}><lineBasicMaterial color={color} /></lineSegments>
    </group>
  );
}
/* ---------- nối, tín hiệu, dây ---------- */
const rodGeo = new THREE.CylinderGeometry(1, 1, 1, 8, 1, true);
const dotGeo = new THREE.SphereGeometry(1, 14, 14);
const UP = new THREE.Vector3(0, 1, 0);
/** Các thanh sáng nối hai điểm. `fill(i,a,b,t)` đặt hai đầu và trả về độ đậm 0..1 (0 = ẩn). */
export function Rods({ count, radius = 0.03, color, opacity = 0.9, additive = true, fill }: { count: number; radius?: number; color: string; opacity?: number; additive?: boolean; fill: (i: number, a: THREE.Vector3, b: THREE.Vector3, t: number) => number }) {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const v = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), dir: new THREE.Vector3(), d: new THREE.Object3D() }), []);
  useFrame(({ clock }) => {
    for (let i = 0; i < count; i++) {
      const w = fill(i, v.a, v.b, clock.elapsedTime);
      v.dir.subVectors(v.b, v.a); const len = v.dir.length();
      v.d.position.addVectors(v.a, v.b).multiplyScalar(0.5);
      if (len > 1e-4) v.d.quaternion.setFromUnitVectors(UP, v.dir.multiplyScalar(1 / len));
      const r = radius * Math.max(w, 0) || 1e-4; v.d.scale.set(r, Math.max(len, 1e-4), r); v.d.updateMatrix();
      mesh.current.setMatrixAt(i, v.d.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={mesh} args={[rodGeo, undefined, count]} frustumCulled={false}>
    <meshBasicMaterial color={color} transparent opacity={opacity} toneMapped={false} depthWrite={!additive} blending={additive ? THREE.AdditiveBlending : THREE.NormalBlending} />
  </instancedMesh>;
}
/** Chấm sáng (tín hiệu chạy trên dây). `fill(i,p,t)` đặt vị trí và trả về cỡ. */
export function Dots({ count, color, fill }: { count: number; color: string; fill: (i: number, p: THREE.Vector3, t: number) => number }) {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const d = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }) => {
    for (let i = 0; i < count; i++) { d.position.set(0, 0, 0); const s = fill(i, d.position, clock.elapsedTime); d.scale.setScalar(Math.max(s, 1e-4)); d.updateMatrix(); mesh.current.setMatrixAt(i, d.matrix); }
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={mesh} args={[dotGeo, undefined, count]} frustumCulled={false}><meshBasicMaterial color={color} toneMapped={false} /></instancedMesh>;
}
/** Dây cong đi qua các điểm, tự vẽ dần khi `on`. */
export function Arc({ points, on, color = HEX.red, r = 0.035, speed = 2.2, glow = 0.4 }: { points: V3[]; on: boolean; color?: string; r?: number; speed?: number; glow?: number }) {
  const SEG = 96;
  const geo = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), SEG, r, 6, false),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(points), r]);
  useEffect(() => () => geo.dispose(), [geo]);
  const a = useRef(0);
  useFrame((_, dt) => { a.current = damp(a.current, on ? 1 : 0, speed, dt); geo.setDrawRange(0, Math.floor(a.current * SEG) * 36); });
  return <mesh geometry={geo} castShadow><meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} roughness={0.6} /></mesh>;
}
/** Nạp ảnh thật trong public/images. Không có file thì trả về null (không hiện khung trống). */
export function useOptionalTexture(url: string) {
  const [t, setT] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let alive = true;
    new THREE.TextureLoader().load(url, tex => { if (!alive) return; tex.colorSpace = THREE.SRGBColorSpace; setT(tex); }, undefined, () => { if (alive) setT(null); });
    return () => { alive = false; };
  }, [url]);
  return t;
}
/** Ảnh thật kiểu polaroid có dòng chú thích nguồn. Không có file ảnh thì không vẽ gì (không có khung trống).
 *  `standing`: dựng đứng thay vì nằm trên bàn. `w` là chiều ngang ảnh; ảnh dọc tự thu hẹp để không quá cao. */
export function PhotoCard({ url, caption, position, rot = 0, w = 3, standing = false, pin = true }: { url: string; caption: string; position: V3; rot?: number; w?: number; standing?: boolean; pin?: boolean }) {
  const t = useOptionalTexture(url);
  const cap = useTex(() => canvasTex(1024, 140, (g, W, H) => {
    g.fillStyle = "#f7f4ec"; g.fillRect(0, 0, W, H);
    let px = 44; g.font = F.serif(px, 400, true); while (g.measureText(caption).width > W - 60 && px > 22) { px -= 2; g.font = F.serif(px, 400, true); }
    g.fillStyle = "#3a3630"; g.textAlign = "center"; g.fillText(caption, W / 2, H / 2 + px * 0.35);
  }), [caption]);
  if (!t) return null;
  const img = t.image as { width: number; height: number }, ar = img.height / img.width;
  const pw = ar > 1 ? w / ar * 1.1 : w, ph = pw * ar, p = 0.06 * w, capH = w * 0.137, H = p + ph + capH, FW = Math.max(pw, w * 0.82) + 2 * p;
  return (
    <group position={position} rotation={standing ? [0, rot, 0] : [-Math.PI / 2, 0, rot]}>
      <mesh position={[0, 0, -0.006]} castShadow receiveShadow><planeGeometry args={[FW, H]} /><meshStandardMaterial color="#f7f4ec" roughness={0.9} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, H / 2 - p - ph / 2, 0]}><planeGeometry args={[pw, ph]} /><meshStandardMaterial map={t} roughness={0.75} /></mesh>
      <mesh position={[0, -H / 2 + capH / 2, 0]}><planeGeometry args={[FW - 2 * p, capH]} /><meshStandardMaterial map={cap} roughness={0.9} /></mesh>
      {pin && <mesh position={[0, H / 2 - p * 0.6, 0.1]} castShadow><sphereGeometry args={[0.09, 16, 16]} /><meshStandardMaterial color={HEX.red} roughness={0.3} /></mesh>}
    </group>
  );
}

/** Vòng sóng lan trên mặt bàn. */
export function Ripples({ position, on, color = HEX.red, n = 3, max = 2.2 }: { position: V3; on: boolean; color?: string; n?: number; max?: number }) {
  const g = useRef<THREE.Group>(null!), a = useRef(0);
  useFrame(({ clock }, dt) => {
    a.current = damp(a.current, on ? 1 : 0, 4, dt);
    g.current.children.forEach((m, j) => { const ph = (clock.elapsedTime * 0.45 + j / n) % 1; m.scale.setScalar(0.3 + ph * max); ((m as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = (1 - ph) * 0.6 * a.current; });
  });
  return <group ref={g} position={position} rotation={[-Math.PI / 2, 0, 0]}>{Array.from({ length: n }, (_, j) => <mesh key={j}><ringGeometry args={[0.95, 1, 64]} /><meshBasicMaterial color={color} transparent opacity={0} depthWrite={false} /></mesh>)}</group>;
}
