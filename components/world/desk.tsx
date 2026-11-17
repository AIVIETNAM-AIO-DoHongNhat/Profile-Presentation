"use client";
// Đồ vật 3D trên bàn hồ sơ: con dấu cao su, đinh ghim, chỉ đỏ, kính lúp, tia va chạm.
// Dựng bằng hình khối có sẵn (không tải mô hình ngoài) để giữ đúng chất "bàn làm việc"; diễn hoạt bằng timeline GSAP.
import { Billboard, Line, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Line2 } from "three-stdlib";
import { MONO, P, SERIF, circ, lines, shape, stamp, text } from "./art";
import { SNAP, sdt, useLive, useShake } from "./fx";
import { PAGE_Y, useArt, type Draw } from "./pop";

type V3 = [number, number, number];
const WOOD = "#8a5a33", WOOD_D = "#5e3b20", STEEL = "#7c838c";

/** Chạy timeline; ở chế độ chụp màn hình (?snap=1) nhảy thẳng tới cuối. */
function run(tl: gsap.core.Timeline) { if (SNAP) tl.progress(1); return () => { tl.kill(); }; }

/* ---------------- con dấu cao su ---------------- */
const HANDLE = (() => {
  const p = [[0, 0], [0.16, 0], [0.17, 0.05], [0.1, 0.14], [0.085, 0.42], [0.18, 0.56], [0.25, 0.72], [0.2, 0.88], [0.08, 0.95], [0, 0.96]];
  return new THREE.LatheGeometry(p.map(([x, y]) => new THREE.Vector2(x, y)), 28);
})();
/** bề rộng dấu (đơn vị thế giới, khi size = 1) giãn theo độ dài chữ để chữ không bị cắt */
const imprintW = (t: string) => Math.max(2.5, 0.9 + t.length * 0.2);
const imprintDraw = (t: string, color: string): Draw => (g, W, H) => {
  // cỡ chữ: lớn nhất có thể mà khung dấu (chữ + lề) vẫn nằm gọn trong 84% bề rộng
  let px = H * 0.34; g.font = MONO(Math.round(px), 800);
  const tw = g.measureText(t).width;
  px = Math.min(px, (W * 0.84) / (tw / px + 1));
  stamp(g, W / 2, H / 2, t, px, color, -0.03);
  // vài giọt mực bắn ra ở bốn góc, ngoài khung chữ
  const R = (i: number) => { const x = Math.sin(i * 91.7 + t.length) * 43758.5; return x - Math.floor(x); };
  g.fillStyle = color;
  for (let i = 0; i < 6; i++) { const sx = i % 2 ? 1 : -1, sy = i % 3 ? 1 : -1; circ(g, W / 2 + sx * W * (0.43 + R(i) * 0.04), H / 2 + sy * H * (0.36 + R(i + 9) * 0.08), 2 + R(i + 20) * 4); g.fill(); }
};
type StampProps = { at: [number, number]; text: string; on?: boolean; delay?: number; color?: string; size?: number;
  /** sau khi đóng dấu: để con dấu nằm lại bên cạnh (độ lệch x), hoặc nhấc đi hẳn (null) */
  restDx?: number | null };
/** Con dấu cao su hạ xuống, đập mạnh (rung camera), in dấu mực lên trang rồi nhấc ra. */
export function RubberStamp({ at, text: t, on: onProp = true, delay = 0, color = P.red, size = 1, restDx = 1.9 }: StampProps) {
  const live = useLive(), on = onProp && live, shake = useShake();
  const IW = imprintW(t) * size, IH = 1.05 * size, kx = imprintW(t) / 2.5; // kx: đế con dấu giãn theo bề rộng dấu
  const tex = useArt(`imprint-${t}-${color}`, IW, IH, imprintDraw(t, color), true);
  const o = useRef({ vis: 0, x: 0, y: 4, z: 0, tilt: 0, sq: 1, imp: 0 });
  const body = useRef<THREE.Group>(null!), imp = useRef<THREE.Mesh>(null!), impK = useRef(0);
  useEffect(() => {
    const s = o.current;
    if (!on || !tex) { Object.assign(s, { vis: 0, x: 0, y: 4, z: 0, tilt: 0, sq: 1, imp: 0 }); return; }
    const tl = gsap.timeline({ delay });
    tl.set(s, { vis: 1, x: -0.5 * size, y: 3.4, z: 0.4, tilt: 0.4 })
      .to(s, { x: 0, y: 0.8 * size, z: 0, tilt: 0, duration: 0.5, ease: "power2.out" })
      .to(s, { y: 0, duration: 0.1, ease: "power3.in" }, "+=0.18")
      .add(() => { shake(0.16 * size + 0.04); s.imp = 1; })
      .to(s, { sq: 0.8, duration: 0.06, ease: "power1.out", yoyo: true, repeat: 1 });
    if (restDx === null) tl.to(s, { y: 4, duration: 0.55, ease: "power2.in" }, "+=0.3").set(s, { vis: 0 });
    else tl.to(s, { y: 0.9 * size, duration: 0.3, ease: "power2.out" }, "+=0.3")
      .to(s, { x: restDx * size, z: -0.25 * size, tilt: -0.1, duration: 0.45, ease: "power2.inOut" })
      .to(s, { y: 0, tilt: 0, duration: 0.22, ease: "power2.in" });
    return run(tl);
  }, [on, !!tex]); // eslint-disable-line react-hooks/exhaustive-deps
  useFrame((_, rawDt) => {
    const s = o.current, dt = sdt(rawDt);
    body.current.visible = s.vis > 0.5;
    body.current.position.set(s.x, s.y, s.z); body.current.rotation.set(0, 0, s.tilt);
    body.current.scale.set(size * kx, size * s.sq, size);
    impK.current = s.imp ? Math.min(1, impK.current + dt * 9) : 0;
    imp.current.visible = impK.current > 0;
    imp.current.scale.setScalar(1 + (1 - impK.current) * 0.25);
  });
  return <group position={[at[0], PAGE_Y, at[1]]}>
    <mesh ref={imp} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} visible={false}>
      <planeGeometry args={[IW, IH]} /><meshBasicMaterial map={tex} alphaTest={0.4} />
    </mesh>
    <group ref={body} visible={false}>
      <mesh position={[0, 0.04, 0]} castShadow><boxGeometry args={[2.2, 0.08, 0.92]} /><meshStandardMaterial color="#5a1712" roughness={0.9} /></mesh>
      <RoundedBox args={[2.3, 0.3, 1.0]} radius={0.06} smoothness={3} position={[0, 0.23, 0]} castShadow><meshStandardMaterial color={WOOD_D} roughness={0.7} /></RoundedBox>
      <mesh geometry={HANDLE} position={[0, 0.38, 0]} scale={[1.5, 1.4, 1.5]} castShadow><meshStandardMaterial color={WOOD} roughness={0.55} /></mesh>
    </group>
  </group>;
}

/* ---------------- đinh ghim ---------------- */
/** Đinh ghim cắm vào ảnh / bảng: bay tới theo trục z cục bộ rồi cắm phập. `position` trong hệ tọa độ của tấm được ghim. */
export function PushPin({ position, on: onProp = true, delay = 0, color = P.red }: { position: V3; on?: boolean; delay?: number; color?: string }) {
  const live = useLive(), on = onProp && live;
  const ref = useRef<THREE.Group>(null!), st = useRef({ t: 0 });
  useFrame((_, rawDt) => {
    const s = st.current; s.t = on ? s.t + sdt(rawDt) : 0;
    const a = Math.min(1, Math.max(0, (s.t - delay) / 0.28));
    ref.current.visible = on && s.t > delay;
    ref.current.position.set(position[0], position[1], position[2] + (1 - a * a) * 0.9);
  });
  return <group ref={ref} visible={false} rotation={[Math.PI / 2, 0, 0]}>
    <mesh position={[0, 0.08, 0]} castShadow><cylinderGeometry args={[0.012, 0.012, 0.16, 8]} /><meshStandardMaterial color={STEEL} metalness={0.2} roughness={0.35} /></mesh>
    <mesh position={[0, 0.2, 0]} castShadow><cylinderGeometry args={[0.07, 0.09, 0.08, 20]} /><meshStandardMaterial color={color} roughness={0.35} /></mesh>
    <mesh position={[0, 0.28, 0]} castShadow><sphereGeometry args={[0.1, 20, 14]} /><meshStandardMaterial color={color} roughness={0.35} /></mesh>
  </group>;
}

/* ---------------- chỉ đỏ ---------------- */
const THREAD_N = 48;
/** Sợi chỉ căng giữa hai điểm (hơi võng), kéo dần từ a sang b. */
export function Thread({ a, b, on: onProp = true, delay = 0, color = P.red, sag = 0.25 }: { a: V3; b: V3; on?: boolean; delay?: number; color?: string; sag?: number }) {
  const live = useLive(), on = onProp && live;
  const pts = useMemo(() => Array.from({ length: THREAD_N }, (_, i) => {
    const t = i / (THREAD_N - 1);
    return new THREE.Vector3(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - Math.sin(Math.PI * t) * sag, a[2] + (b[2] - a[2]) * t);
  }), [a[0], a[1], a[2], b[0], b[1], b[2], sag]); // eslint-disable-line react-hooks/exhaustive-deps
  const ref = useRef<Line2>(null!), st = useRef({ t: 0, p: 0 });
  useFrame((_, rawDt) => {
    const dt = sdt(rawDt), s = st.current; s.t = on ? s.t + dt : 0;
    s.p = on && s.t > delay ? Math.min(1, s.p + dt * 1.6) : Math.max(0, s.p - dt * 4);
    (ref.current.geometry as THREE.InstancedBufferGeometry).instanceCount = Math.floor((1 - Math.pow(1 - s.p, 2)) * (THREAD_N - 1));
    ref.current.visible = s.p > 0;
  });
  return <Line ref={ref} points={pts} color={color} lineWidth={0.03} worldUnits />;
}

/* ---------------- kính lúp ---------------- */
/** Kính lúp trượt ngang qua một vùng (ví dụ tấm ảnh) rồi dừng lại. Tọa độ trong hệ của vật cha. */
export function Magnifier({ from, to, on: onProp = true, delay = 0, size = 1 }: { from: V3; to: V3; on?: boolean; delay?: number; size?: number }) {
  const live = useLive(), on = onProp && live;
  const ref = useRef<THREE.Group>(null!), o = useRef({ k: 0, vis: 0 });
  useEffect(() => {
    const s = o.current;
    if (!on) { s.k = 0; s.vis = 0; return; }
    const tl = gsap.timeline({ delay }).set(s, { vis: 1, k: 0 }).to(s, { k: 1, duration: 1.6, ease: "power1.inOut" });
    return run(tl);
  }, [on]); // eslint-disable-line react-hooks/exhaustive-deps
  useFrame(({ clock }) => {
    const s = o.current, g = ref.current;
    g.visible = s.vis > 0.5;
    g.position.set(from[0] + (to[0] - from[0]) * s.k, from[1] + (to[1] - from[1]) * s.k + Math.sin(s.k * Math.PI * 2) * 0.12, from[2] + (to[2] - from[2]) * s.k);
    g.rotation.set(0, 0, -0.5 + Math.sin(clock.elapsedTime * 0.8) * 0.03);
  });
  return <group ref={ref} visible={false} scale={size}>
    <mesh castShadow><torusGeometry args={[0.42, 0.055, 14, 48]} /><meshStandardMaterial color="#2f3337" metalness={0.15} roughness={0.4} /></mesh>
    <mesh><circleGeometry args={[0.4, 40]} /><meshStandardMaterial color="#cfe2f0" transparent opacity={0.22} roughness={0.05} depthWrite={false} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, -0.78, 0]} castShadow><cylinderGeometry args={[0.06, 0.07, 0.62, 16]} /><meshStandardMaterial color={WOOD_D} roughness={0.6} /></mesh>
  </group>;
}

/* ---------------- tia va chạm ---------------- */
const SPOKES = 10, SPLATS = 6;
/** Mũi tên đâm vào vật chắn: tia mực bung ra, vài giọt bắn, rung camera nhẹ. Điểm `at` là [x, z, y] trên trang. */
export function Impact({ at, on: onProp = true, delay = 0, color = P.red, size = 1 }: { at: [number, number, number]; on?: boolean; delay?: number; color?: string; size?: number }) {
  const live = useLive(), on = onProp && live, shake = useShake();
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false, side: THREE.DoubleSide }), [color]);
  useEffect(() => () => mat.dispose(), [mat]);
  const grp = useRef<THREE.Group>(null!), spokes = useRef<(THREE.Mesh | null)[]>([]), splats = useRef<(THREE.Mesh | null)[]>([]);
  const st = useRef({ t: 0, fired: false });
  const jit = useMemo(() => Array.from({ length: SPOKES + SPLATS }, (_, i) => { const x = Math.sin(i * 78.233 + at[0]) * 43758.5; return x - Math.floor(x); }), [at[0]]); // eslint-disable-line react-hooks/exhaustive-deps
  useFrame((_, rawDt) => {
    const s = st.current; s.t = on ? s.t + sdt(rawDt) : 0;
    if (!on) s.fired = false;
    const l = s.t - delay, D = 0.6;
    grp.current.visible = on && l > 0 && l < D;
    if (on && l > 0 && !s.fired) { s.fired = true; shake(0.1 * size); }
    if (!grp.current.visible) return;
    const a = l / D, out = 1 - Math.pow(1 - a, 3);
    mat.opacity = 1 - a * a;
    spokes.current.forEach((m, i) => {
      if (!m) return;
      const ang = (i / SPOKES) * Math.PI * 2 + jit[i] * 0.4, r = size * (0.25 + 0.75 * out), len = size * (0.5 * (1 - a) + 0.05) * (0.7 + jit[i] * 0.6);
      m.position.set(Math.cos(ang) * (r + len / 2), Math.sin(ang) * (r + len / 2), 0); m.rotation.z = ang; m.scale.set(len, 1, 1);
    });
    splats.current.forEach((m, i) => {
      if (!m) return;
      const j = jit[SPOKES + i], ang = j * Math.PI * 2, r = size * (0.3 + 1.1 * out * (0.6 + j * 0.5));
      m.position.set(Math.cos(ang) * r, Math.sin(ang) * r - a * a * 0.6 * size, 0.01); m.scale.setScalar(0.5 + j);
    });
  });
  return <group position={[at[0], PAGE_Y + at[2], at[1]]}>
    <Billboard ref={grp} visible={false}>
      {Array.from({ length: SPOKES }, (_, i) => <mesh key={i} ref={el => { spokes.current[i] = el; }} material={mat}><planeGeometry args={[1, 0.07 * size]} /></mesh>)}
      {Array.from({ length: SPLATS }, (_, i) => <mesh key={`s${i}`} ref={el => { splats.current[i] = el; }} material={mat}><circleGeometry args={[0.05 * size, 12]} /></mesh>)}
    </Billboard>
  </group>;
}

/* ---------------- rơi vào chỗ ---------------- */
/** Bọc vật thể: khi `on`, vật rơi từ `from` (lệch vị trí) và xoay `spin` về đúng chỗ, hơi nảy. */
export function DropIn({ on: onProp = true, delay = 0, from = [0, 2, 0.4], spin = 0.25, children }: { on?: boolean; delay?: number; from?: V3; spin?: number; children: React.ReactNode }) {
  const live = useLive(), on = onProp && live;
  const ref = useRef<THREE.Group>(null!), o = useRef({ k: 0 });
  useEffect(() => {
    const s = o.current;
    if (!on) { s.k = 0; return; }
    const tl = gsap.timeline({ delay }).set(s, { k: 0 }).to(s, { k: 1, duration: 0.75, ease: "back.out(1.6)" });
    return run(tl);
  }, [on]); // eslint-disable-line react-hooks/exhaustive-deps
  useFrame(() => {
    const k = o.current.k, r = 1 - k;
    ref.current.position.set(from[0] * r, from[1] * r, from[2] * r); ref.current.rotation.set(0, 0, spin * r);
  });
  return <group ref={ref}>{children}</group>;
}

/* ---------------- giấy tờ trên bảng điều tra ---------------- */
function wrap(g: CanvasRenderingContext2D, t: string, maxW: number) {
  const out: string[] = []; let cur = "";
  for (const w of t.split(" ")) { const nx = cur ? `${cur} ${w}` : w; if (g.measureText(nx).width > maxW && cur) { out.push(cur); cur = w; } else cur = nx; }
  if (cur) out.push(cur); return out;
}
/** Mẩu báo cắt: tiêu đề vụ việc, thời gian, các cột chữ giả. */
export const newsClip = (title: string, period: string): Draw => (g, W, H) => {
  g.beginPath(); g.moveTo(8, 10); for (let x = 8; x <= W - 8; x += 18) g.lineTo(x, 8 + ((x / 18) % 2) * 5); g.lineTo(W - 8, H - 8); g.lineTo(8, H - 10); g.closePath(); shape(g, "#f2ecdc", 4, P.ink2);
  text(g, "TIN VỤ ÁN", 22, H * 0.11, MONO(Math.round(H * 0.06), 800), P.red, "left");
  g.font = SERIF(Math.round(H * 0.11), 800);
  wrap(g, title, W - 50).slice(0, 2).forEach((l, i) => text(g, l, W / 2, H * (0.27 + i * 0.13), SERIF(Math.round(H * 0.11), 800), P.ink, "center", W - 44));
  text(g, period, W / 2, H * 0.53, MONO(Math.round(H * 0.06), 700), P.ink2);
  for (let c = 0; c < 3; c++) lines(g, 24 + c * ((W - 48) / 3), H * 0.62, (W - 48) / 3 - 14, 4, H * 0.075, P.slate2, 5);
};
/** Thẻ ghi chú: một dòng kết luận viết tay. */
export const indexCard = (title: string, note: string): Draw => (g, W, H) => {
  g.beginPath(); g.rect(10, 10, W - 20, H - 20); shape(g, "#fffdf6", 4, P.ink2);
  g.fillStyle = "rgba(176,38,31,.5)"; g.fillRect(10, H * 0.25, W - 20, 3);
  for (let y = H * 0.4; y < H - 18; y += H * 0.15) { g.fillStyle = "rgba(42,79,122,.18)"; g.fillRect(14, y, W - 28, 2); }
  text(g, title, 26, H * 0.16, MONO(Math.round(H * 0.075), 800), P.red, "left");
  g.font = `400 ${Math.round(H * 0.13)}px "Patrick Hand", cursive`;
  wrap(g, note, W - 56).slice(0, 4).forEach((l, i) => text(g, l, 28, H * (0.37 + i * 0.15), `400 ${Math.round(H * 0.13)}px "Patrick Hand", cursive`, P.blue, "left", W - 50));
};
