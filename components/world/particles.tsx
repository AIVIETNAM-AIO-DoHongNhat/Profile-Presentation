"use client";
// Hạt chuyển động "có nghĩa": không phải bụi sáng trang trí, mà là thứ đang thực sự di chuyển trong câu chuyện —
// lượt thích, chia sẻ tuôn ra từ tài khoản ảo, dấu "!" bất mãn, tin nhắn đang gõ, tin giả loang ra như vết mực.
import { Billboard } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { MONO, P, SANS, circ, doc, envelope, heart, line, money, rr, shape, text } from "./art";
import { sdt, useLive } from "./fx";
import { PAGE_Y, useArt, type CarrierSpec, type Draw } from "./pop";

type At = [number, number] | [number, number, number];
const TAU = Math.PI * 2;
/** số ngẫu nhiên cố định theo (i, j): mỗi lần trình chiếu giống hệt nhau */
const hash = (i: number, j: number) => { const x = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return x - Math.floor(x); };

/* ---------------- biểu tượng (vẽ một lần, dùng chung) ---------------- */
const badge = (fill: string, mark: (g: CanvasRenderingContext2D, cx: number, cy: number, r: number) => void): Draw => (g, W, H) => {
  const r = Math.min(W, H) / 2 - 8; circ(g, W / 2, H / 2, r); shape(g, fill, 6); mark(g, W / 2, H / 2, r);
};
export const ICONS = {
  heart: ((g, W, H) => heart(g, W / 2, H / 2 + H * 0.06, Math.min(W, H) * 0.9)) as Draw,
  like: badge(P.blue, (g, cx, cy, r) => text(g, "+1", cx, cy + 2, SANS(Math.round(r * 0.95), 800), P.paper)),
  share: badge(P.paper, (g, cx, cy, r) => {
    g.beginPath(); g.arc(cx - r * 0.1, cy + r * 0.25, r * 0.45, Math.PI * 1.05, Math.PI * 1.75); g.lineWidth = r * 0.16; g.strokeStyle = P.ink; g.lineCap = "round"; g.stroke();
    g.beginPath(); g.moveTo(cx + r * 0.42, cy - r * 0.22); g.lineTo(cx + r * 0.05, cy - r * 0.52); g.lineTo(cx + r * 0.08, cy + r * 0.05); g.closePath(); g.fillStyle = P.ink; g.fill();
  }),
  angry: badge(P.red, (g, cx, cy, r) => text(g, "!", cx, cy + 2, SANS(Math.round(r * 1.3), 800), P.paper)),
  plus: badge(P.paper, (g, cx, cy, r) => { line(g, [[cx - r * 0.5, cy], [cx + r * 0.5, cy]], r * 0.22, P.red); line(g, [[cx, cy - r * 0.5], [cx, cy + r * 0.5]], r * 0.22, P.red); }),
} satisfies Record<string, Draw>;
export type IconName = keyof typeof ICONS;

/** Vật chở dùng cho InkPath (`carrier`). */
export const CARRY = {
  envelope: { id: "cr-env", w: 0.7, h: 0.5, draw: (g, W, H) => envelope(g, 6, 6, W - 12, H - 12) },
  money: { id: "cr-money", w: 0.8, h: 0.55, draw: (g, W, H) => money(g, 8, H * 0.28, W - 36, H * 0.6) },
  doc: { id: "cr-doc", w: 0.55, h: 0.7, draw: (g, W, H) => doc(g, 6, 6, W - 12, H - 12, { lines: 3, stamp: "LỆNH" }) },
  fake: { id: "cr-fake", w: 0.6, h: 0.72, draw: (g, W, H) => doc(g, 6, 6, W - 12, H - 12, { lines: 3, stamp: "TIN GIẢ" }) },
  chat: { id: "cr-chat", w: 0.66, h: 0.48, draw: (g, W, H) => {
    rr(g, 6, 6, W - 12, H * 0.66, H * 0.2); shape(g, P.blueSoft, 6);
    for (let i = 0; i < 3; i++) { circ(g, W * (0.32 + i * 0.18), 6 + H * 0.33, H * 0.07); shape(g, P.ink, 0); }
    g.beginPath(); g.moveTo(W * 0.22, H * 0.66); g.lineTo(W * 0.16, H * 0.92); g.lineTo(W * 0.4, H * 0.66); shape(g, P.blueSoft, 5);
  } },
  notify: { id: "cr-notify", w: 0.5, h: 0.5, draw: badge(P.red, (g, cx, cy, r) => text(g, "1", cx, cy + 2, MONO(Math.round(r * 1.1), 800), P.paper)) },
} satisfies Record<string, CarrierSpec>;

/* ---------------- bộ phun biểu tượng ---------------- */
type EmitterProps = {
  at: At; icons: IconName[]; on?: boolean; delay?: number;
  /** số hạt cùng lúc */
  count?: number; size?: number;
  /** độ cao bay lên, độ tỏa ngang */
  rise?: number; spread?: number;
};
/** Biểu tượng bật ra, bay lên, trôi ngang, mờ dần; lặp lại khi `on`. Mỗi loại biểu tượng là một InstancedMesh. */
export function Emitter({ at, icons, on: onProp = true, delay = 0, count = 8, size = 0.42, rise = 1.8, spread = 0.7 }: EmitterProps) {
  const live = useLive(), on = onProp && live;
  return <group position={[at[0], PAGE_Y + (at[2] ?? 0), at[1]]}>
    {icons.map((name, k) => <IconSwarm key={name} name={name} on={on} delay={delay} count={Math.max(1, Math.round(count / icons.length))} offset={k / icons.length} size={size} rise={rise} spread={spread} seed={k * 17 + 3} />)}
  </group>;
}
function IconSwarm({ name, on, delay, count, offset, size, rise, spread, seed }: { name: IconName; on: boolean; delay: number; count: number; offset: number; size: number; rise: number; spread: number; seed: number }) {
  const tex = useArt(`ico-${name}`, 0.6, 0.6, ICONS[name]);
  const ref = useRef<THREE.InstancedMesh>(null!);
  const camera = useThree(s => s.camera);
  const st = useRef({ t: 0, amp: 0 });
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), q: new THREE.Quaternion(), r: new THREE.Quaternion(), p: new THREE.Vector3(), s: new THREE.Vector3(), z: new THREE.Vector3(0, 0, 1) }), []);
  const LIFE = 1.9;
  useFrame((_, rawDt) => {
    const dt = sdt(rawDt), s = st.current, mesh = ref.current;
    s.t = on ? s.t + dt : 0;
    s.amp = THREE.MathUtils.damp(s.amp, on && s.t > delay ? 1 : 0, 4, dt);
    mesh.visible = !!tex && s.amp > 0.01;
    if (!mesh.visible) return;
    const t = s.t - delay;
    for (let i = 0; i < count; i++) {
      const local = t - ((i + offset) / count) * LIFE;
      if (local < 0) { tmp.m.makeScale(0, 0, 0); mesh.setMatrixAt(i, tmp.m); continue; }
      const cyc = Math.floor(local / LIFE), a = (local % LIFE) / LIFE;
      const j0 = hash(i + seed, cyc), j1 = hash(i + seed, cyc + 50), j2 = hash(i + seed, cyc + 99);
      const ang = j0 * TAU, rad = spread * Math.sqrt(j1);
      tmp.p.set(Math.cos(ang) * rad + (j2 - 0.5) * 0.8 * a, rise * (1 - Math.pow(1 - a, 2)), Math.sin(ang) * rad * 0.6);
      const pop = a < 0.12 ? a / 0.12 : a > 0.72 ? (1 - a) / 0.28 : 1;
      const sc = size * (0.75 + j2 * 0.5) * Math.min(1.15, pop * 1.15) * s.amp;
      tmp.r.setFromAxisAngle(tmp.z, Math.sin(local * 3 + j0 * 6) * 0.3);
      tmp.q.copy(camera.quaternion).multiply(tmp.r);
      tmp.m.compose(tmp.p, tmp.q, tmp.s.setScalar(Math.max(0.0001, sc))); mesh.setMatrixAt(i, tmp.m);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false} visible={false}>
    <planeGeometry args={[1, 1]} />
    <meshBasicMaterial map={tex} alphaTest={0.5} side={THREE.DoubleSide} />
  </instancedMesh>;
}

/* ---------------- đang gõ ---------------- */
const typingBubble: Draw = (g, W, H) => {
  rr(g, 6, 6, W - 12, H * 0.72, H * 0.3); shape(g, P.paper, 6);
  g.beginPath(); g.moveTo(W * 0.2, H * 0.72 + 3); g.lineTo(W * 0.14, H - 6); g.lineTo(W * 0.36, H * 0.72 + 3); shape(g, P.paper, 5);
};
/** Bong bóng có ba chấm nảy lần lượt: ai đó đang soạn tin. Điểm `at` là [x, z, y]. */
export function Typing({ at, on: onProp = true, delay = 0, scale = 1 }: { at: At; on?: boolean; delay?: number; scale?: number }) {
  const live = useLive(), on = onProp && live;
  const tex = useArt("typing", 0.9, 0.55, typingBubble);
  const grp = useRef<THREE.Group>(null!), dots = useRef<(THREE.Mesh | null)[]>([]), st = useRef({ t: 0, amp: 0 });
  useFrame((_, rawDt) => {
    const dt = sdt(rawDt), s = st.current;
    s.t = on ? s.t + dt : 0;
    s.amp = THREE.MathUtils.damp(s.amp, on && s.t > delay && tex ? 1 : 0, 6, dt);
    grp.current.visible = s.amp > 0.01;
    grp.current.scale.setScalar(Math.max(0.001, scale * (s.amp < 0.99 ? s.amp * (1 + 0.25 * Math.sin(s.amp * Math.PI)) : 1)));
    dots.current.forEach((d, i) => { if (d) d.position.y = 0.06 + Math.max(0, Math.sin(s.t * 9 - i * 0.9)) * 0.07; });
  });
  return <group position={[at[0], PAGE_Y + (at[2] ?? 0), at[1]]}>
    <Billboard ref={grp} visible={false}>
      <mesh><planeGeometry args={[0.9, 0.55]} /><meshBasicMaterial map={tex} alphaTest={0.5} /></mesh>
      {[-0.17, 0, 0.17].map((x, i) => <mesh key={i} ref={el => { dots.current[i] = el; }} position={[x, 0.06, 0.02]}><circleGeometry args={[0.045, 16]} /><meshBasicMaterial color={P.ink} /></mesh>)}
    </Billboard>
  </group>;
}

/* ---------------- vết mực loang ---------------- */
/** Vòng mực nở ra trên trang rồi nhạt dần, nối tiếp nhau: tin lan ra xung quanh. */
export function Ripple({ at, r = 1.6, on: onProp = true, delay = 0, color = P.red, rings = 3 }: { at: At; r?: number; on?: boolean; delay?: number; color?: string; rings?: number }) {
  const live = useLive(), on = onProp && live;
  const mats = useMemo(() => Array.from({ length: rings }, () => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false })), [rings, color]);
  useEffect(() => () => mats.forEach(m => m.dispose()), [mats]);
  const refs = useRef<(THREE.Mesh | null)[]>([]), st = useRef({ t: 0, amp: 0 });
  const PERIOD = 2.1;
  useFrame((_, rawDt) => {
    const dt = sdt(rawDt), s = st.current;
    s.t = on ? s.t + dt : 0;
    s.amp = THREE.MathUtils.damp(s.amp, on && s.t > delay ? 1 : 0, 4, dt);
    for (let i = 0; i < rings; i++) {
      const m = refs.current[i]; if (!m) continue;
      const local = s.t - delay - (i / rings) * PERIOD, a = local < 0 ? 0 : (local % PERIOD) / PERIOD;
      m.visible = local > 0 && s.amp > 0.01;
      m.scale.setScalar(Math.max(0.001, 0.25 + a * r));
      mats[i].opacity = (1 - a) * 0.55 * s.amp;
    }
  });
  return <group position={[at[0], PAGE_Y + 0.025 + (at[2] ?? 0), at[1]]} rotation={[-Math.PI / 2, 0, 0]}>
    {mats.map((m, i) => <mesh key={i} ref={el => { refs.current[i] = el; }} material={m} visible={false}><ringGeometry args={[0.93, 1, 64]} /></mesh>)}
  </group>;
}
