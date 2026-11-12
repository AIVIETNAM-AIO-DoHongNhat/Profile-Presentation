"use client";
// Trang 4 khái niệm · 5 đặc điểm · 6 ba dạng (và mô hình theo dõi ở trang 14) · 8 ba hình thức.
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Label, damp, dashedLine, circlePoints, rng } from "../../three/kit";
import { Arc, Crowd, Dots, F, GlowGrid, HEX, K, PhotoCard, Rods, Rise, Ripples, Sign, canvasTex, grain, useSince, useTex, type PawnT, type V3 } from "../props";
import { FEAT_X } from "../layout";

const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/* ======================= Trang 4 · Khái niệm ======================= */
const C_N = 44, RECRUITS = [5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38];
const ownerOf = (k: number) => 1 + (k % 2);
function charterTex() {
  return canvasTex(768, 512, (g, W, H) => {
    g.fillStyle = "#f5f1e6"; g.fillRect(0, 0, W, H); grain(g, W, H, 31, 2500);
    g.fillStyle = "#1a1a1a"; g.font = F.serif(74); g.textAlign = "center"; g.fillText("CƯƠNG LĨNH", W / 2, 120);
    g.font = F.mono(30); g.fillStyle = "#4a4a46"; g.fillText("TÊN GỌI · TÔN CHỈ · ĐIỀU LỆ · CƠ CẤU", W / 2, 180);
    g.textAlign = "left"; for (let y = 230; y < 420; y += 34) { g.fillStyle = "rgba(40,40,40,.3)"; g.fillRect(80, y, 400 + (y % 3) * 60, 10); }
    g.save(); g.translate(W - 170, H - 110); g.rotate(-0.18); g.strokeStyle = "rgba(179,32,42,.9)"; g.lineWidth = 8; g.strokeRect(-130, -42, 260, 84);
    g.fillStyle = "rgba(179,32,42,.9)"; g.font = F.mono(36); g.textAlign = "center"; g.fillText("THÀNH LẬP", 0, 12); g.restore();
  });
}
export function ConceptStation({ step }: { step: number }) {
  const r = useMemo(() => rng(5), []);
  const scatter = useMemo(() => Array.from({ length: C_N }, (_, i) => {
    if (i === 0) return v3(0, 0, -0.6); if (i === 1) return v3(-2.6, 0, 0.4); if (i === 2) return v3(2.6, 0, -0.2);
    const a = r() * Math.PI * 2, d = 1.2 + Math.sqrt(r()) * 3.6; return v3(Math.cos(a) * d * 1.25, 0, Math.sin(a) * d * 0.72);
  }), [r]);
  const out = useRef<PawnT[] | null>(null);
  const charter = useTex(charterTex, []);
  const ch = useRef<THREE.Group>(null!), chY = useRef(7);
  useFrame((_, dt) => { chY.current = damp(chY.current, step >= 2 ? 2.5 : 9, 2.4, dt); ch.current.position.y = chY.current; ch.current.visible = chY.current < 8.9; });
  const place = (i: number, o: PawnT, t: number) => {
    const k = RECRUITS.indexOf(i), core = i < 3, base = scatter[i];
    o.p.copy(base); o.c.copy(core ? K.red : K.ivory);
    if (!core && step === 0) { o.p.x += Math.sin(t * 0.4 + i) * 0.15; o.p.z += Math.cos(t * 0.35 + i * 1.7) * 0.15; }
    if (step >= 1 && k < 0 && !core) { o.p.multiplyScalar(step === 2 ? 1.32 : 1.12); o.c.copy(K.dim); o.s = 0.85; }
    if (step === 1 && k >= 0) { const c = scatter[ownerOf(k)], a = (Math.floor(k / 2) / 6) * Math.PI * 2 + t * 0.15; o.p.set(c.x + Math.cos(a) * 1.15, 0, c.z + Math.sin(a) * 0.9); o.c.copy(K.gold); }
    if (step === 2) {
      if (i === 0) { o.p.set(0, 1.2, -2.3); o.s = 1.35; }
      else if (i === 1 || i === 2) { o.p.set(i === 1 ? -2.6 : 2.6, 0.6, -1.1); o.s = 1.15; }
      else if (k >= 0) { const side = ownerOf(k) === 1 ? -1 : 1, j = Math.floor(k / 2); o.p.set(side * (1.3 + (j % 3) * 1.0), 0, 0.7 + Math.floor(j / 3) * 1.1); o.c.copy(K.gold); }
    }
  };
  const fill = (i: number, a: THREE.Vector3, b: THREE.Vector3) => {
    const P = out.current; if (!P || step === 0) return 0;
    if (i < RECRUITS.length) { const k = i; a.copy(P[ownerOf(k)].p).setY(P[ownerOf(k)].p.y + 0.8); b.copy(P[RECRUITS[k]].p).setY(P[RECRUITS[k]].p.y + 0.8); return 1; }
    if (step < 2) return 0; const s = i - RECRUITS.length + 1; a.copy(P[0].p).setY(P[0].p.y + 1.1); b.copy(P[s].p).setY(P[s].p.y + 0.95); return 1.4;
  };
  return (
    <group>
      <GlowGrid w={13} d={8.4} color="#8d7c55" fill={0.05} div={26} />
      <Label text="KHÔNG GIAN MẠNG" position={[-6.1, 0.2, 4.6]} size={0.2} color="#bfae82" font="mono" tracking={0.14} />
      <Crowd count={C_N} place={place} out={out} lambda={2.6} />
      {[0, 1, 2].map(i => <Ripples key={i} position={[scatter[i].x, 0.03, scatter[i].z]} on={step === 0} max={2.6} />)}
      <Rods count={RECRUITS.length + 2} radius={0.025} color={step === 2 ? HEX.ivory : HEX.gold} opacity={0.75} fill={fill} />
      <Rise on={step === 2} size={[1.4, 1.2, 1.4]} position={[0, 0, -2.3]} color="#3a3127" />
      <Rise on={step === 2} size={[1.2, 0.6, 1.2]} position={[-2.6, 0, -1.1]} color="#3a3127" />
      <Rise on={step === 2} size={[1.2, 0.6, 1.2]} position={[2.6, 0, -1.1]} color="#3a3127" />
      <group ref={ch} position={[0, 9, -4.4]}><Sign tex={charter} w={3.6} h={2.4} /></group>
      <Label text="CẦM ĐẦU" position={[1.7, 2.4, -2.3]} size={0.17} color="#ff9a9a" font="mono" tracking={0.12} show={step === 2} />
    </group>
  );
}

/* ======================= Trang 5 · Ba đặc điểm ======================= */
function Globe({ on, done }: { on: boolean; done: boolean }) {
  const g = useRef<THREE.Group>(null!);
  useFrame((_, dt) => { g.current.rotation.y += dt * 0.12; });
  const R = 1.7, C: V3 = [0, 2.5, -0.4];
  const onSphere = (lat: number, lon: number): V3 => [C[0] + R * Math.cos(lat) * Math.sin(lon), C[1] + R * Math.sin(lat), C[2] + R * Math.cos(lat) * Math.cos(lon)];
  const user: V3 = [-2.6, 0.5, 1.8], s1 = onSphere(0.5, -0.9), s2 = onSphere(0.9, 0.4), s3 = onSphere(0.2, 1.1), boss: V3 = [2.7, 0.9, 0.4];
  const hops = [user, s1, s2, s3, boss];
  const curves = useMemo(() => hops.slice(0, -1).map((a, i) => { const b = hops[i + 1]; const m = new THREE.Vector3(...a).add(new THREE.Vector3(...b)).multiplyScalar(0.5); m.multiplyScalar(1).add(new THREE.Vector3(0, 0.9, 0.6)); return new THREE.QuadraticBezierCurve3(new THREE.Vector3(...a), m, new THREE.Vector3(...b)); }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);
  return (
    <group>
      <group ref={g} position={C}>
        <mesh><sphereGeometry args={[R * 0.98, 40, 40]} /><meshStandardMaterial color="#1b2a26" roughness={0.7} transparent opacity={0.85} /></mesh>
        <mesh><icosahedronGeometry args={[R, 3]} /><meshBasicMaterial color={HEX.gold} wireframe transparent opacity={0.28} /></mesh>
      </group>
      <mesh position={[0, 0.4, -0.4]} castShadow><cylinderGeometry args={[0.18, 0.5, 0.8, 24]} /><meshStandardMaterial color="#2a251d" metalness={0.4} /></mesh>
      {[s1, s2, s3].map((p, i) => <mesh key={i} position={p} castShadow><boxGeometry args={[0.32, 0.42, 0.32]} /><meshStandardMaterial color="#2c2c2c" emissive={HEX.gold} emissiveIntensity={done ? 0.6 : 0.05} /></mesh>)}
      <mesh position={[user[0], 0.25, user[2]]} castShadow><boxGeometry args={[0.9, 0.5, 0.6]} /><meshStandardMaterial color="#3a3a3a" emissive="#7fb6c9" emissiveIntensity={0.4} /></mesh>
      {curves.map((c, i) => <Arc key={i} points={c.getPoints(24).map(p => [p.x, p.y, p.z] as V3)} on={done} color={i === 3 ? HEX.red : HEX.gold} r={0.025} speed={1.6 - i * 0.25} />)}
      <Dots count={1} color="#fff1c8" fill={(_, p, t) => { if (!done) return 0; const u = (t * 0.32) % 1, seg = Math.min(Math.floor(u * 4), 3); p.copy(curves[seg].getPoint(u * 4 - seg)); return 0.09; }} />
      <Label text="TÀI KHOẢN ẢO" position={[user[0], 1.1, user[2]]} size={0.15} color="#9fd2e3" font="mono" show={on} />
      <Label text="3 MÁY CHỦ NƯỚC NGOÀI" position={[0, 4.75, -0.4]} size={0.15} color={HEX.gold} font="mono" show={on} />
      <Label text="TỔ CHỨC LƯU VONG" position={[boss[0], 1.6, boss[2]]} size={0.15} color="#ff9a9a" font="mono" show={on} />
      <mesh position={[boss[0], 0.35, boss[2]]} castShadow><boxGeometry args={[0.7, 0.7, 0.7]} /><meshStandardMaterial color={HEX.redDeep} emissive={HEX.red} emissiveIntensity={0.4} /></mesh>
    </group>
  );
}
function facadeTex(back: boolean) {
  return canvasTex(768, 512, (g, W, H) => {
    if (back) { g.fillStyle = "#3b0b10"; g.fillRect(0, 0, W, H); g.fillStyle = "#ff8a8a"; g.font = F.mono(40); g.textAlign = "center"; g.fillText("BẢN CHẤT", W / 2, 200); g.font = F.serif(50); g.fillStyle = "#fff"; g.fillText("TỔ CHỨC", W / 2, 285); g.fillText("PHẢN ĐỘNG", W / 2, 350); return; }
    g.fillStyle = "#eef3ea"; g.fillRect(0, 0, W, H); g.fillStyle = "#2f7a52"; g.fillRect(0, 0, W, 90);
    g.fillStyle = "#fff"; g.font = F.mono(34); g.fillText("WEBSITE · FANPAGE", 40, 58);
    g.strokeStyle = "#2f7a52"; g.lineWidth = 10; g.beginPath(); g.arc(150, 270, 80, 0, Math.PI * 2); g.stroke();
    g.fillStyle = "#1d4d33"; g.font = F.serif(56); g.fillText("Hội Dân sự", 270, 245); g.font = F.sans(38, 600); g.fillStyle = "#3e6b52"; g.fillText("Dân chủ · Nhân quyền", 272, 305);
    g.fillStyle = "rgba(30,60,40,.25)"; for (let y = 380; y < 470; y += 30) g.fillRect(40, y, W - 80 - (y % 4) * 40, 12);
  });
}
/** Biển mặt tiền "Hội Dân sự" ban đầu đứng che kín tổ chức phía sau. Khi lộ bản chất, biển vẫn đứng (vẫn đọc được)
 *  nhưng trượt sang trái và xoay nghiêng: vỏ bọc bên trái, bản chất bên phải, hai khối tách hẳn, không đâm vào nhau. */
const FX = 1.3; // tâm khối "bản chất" (biển đỏ + quân cờ)
function Facade({ on, done }: { on: boolean; done: boolean }) {
  const front = useTex(() => facadeTex(false), []), back = useTex(() => facadeTex(true), []);
  const mask = useRef<THREE.Group>(null!), a = useRef(0);
  useFrame((_, dt) => {
    a.current = damp(a.current, done ? 1 : 0, 2.4, dt); const k = a.current;
    mask.current.position.set(FX - k * 3.0, Math.sin(k * Math.PI) * 0.35, 1.0 + k * 0.3);
    mask.current.rotation.y = k * 0.62; mask.current.scale.setScalar(1 - k * 0.18);
  });
  const place = (i: number, o: PawnT, t: number) => { const ang = (i / 6) * Math.PI * 2; o.p.set(FX + Math.cos(ang) * 0.95, 0, -0.7 + Math.sin(ang) * 0.42); o.c.copy(K.red); o.p.y = Math.max(0, Math.sin(t * 2 + i)) * 0.04; };
  return (
    <group>
      <Crowd count={6} place={place} />
      <group position={[FX, 1.05, -1.9]}><Sign tex={back} w={2.8} h={1.6} glow={done ? 1 : 0.4} /></group>
      <mesh position={[FX - 1.2, 0.53, -1.95]}><boxGeometry args={[0.07, 1.06, 0.07]} /><meshStandardMaterial color="#2a251d" /></mesh><mesh position={[FX + 1.2, 0.53, -1.95]}><boxGeometry args={[0.07, 1.06, 0.07]} /><meshStandardMaterial color="#2a251d" /></mesh>
      <group ref={mask} position={[FX, 0, 1.0]}><Sign tex={front} w={3.6} h={2.9} /></group>
      <Label text="VỎ BỌC HỢP PHÁP" position={[FX - 2.5, 3.5, 1.3]} size={0.16} color="#9fe0b8" font="mono" show={on} />
    </group>
  );
}
function Spread({ on, done }: { on: boolean; done: boolean }) {
  const since = useSince(on);
  const N = 30, clusters = useMemo(() => [[-2, -1.2], [0, -1.8], [2.1, -1], [-1.8, 1.2], [0.2, 1.4], [2.2, 1.3]] as [number, number][], []);
  const big = useMemo(() => Array.from({ length: N }, (_, i) => v3((i % 6 - 2.5) * 0.55, 0, (Math.floor(i / 6) - 2) * 0.55)), []);
  const place = (i: number, o: PawnT, t: number) => {
    const c = clusters[i % 6], j = Math.floor(i / 6), a = (j / 5) * Math.PI * 2;
    o.p.set(c[0] + Math.cos(a) * 0.38, 0, c[1] + Math.sin(a) * 0.38); o.c.copy(K.ivory); o.s = 0.8;
    if (!done) return;
    const el = on ? t - since.current : 99, dist = Math.hypot(c[0] + 2, c[1] + 1.2);
    if (el * 1.8 > dist) o.c.copy(K.red);
    if (el > 2.6) { o.p.copy(big[i]); o.s = 0.85; }
  };
  return (
    <group>
      <Crowd count={N} place={place} lambda={2.2} />
      <Ripples position={[-2, 0.03, -1.2]} on={on} max={5} />
    </group>
  );
}
export function FeaturesStation({ step }: { step: number }) {
  return (
    <group>
      {FEAT_X.map((x, k) => <mesh key={x} position={[x, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[3.3, 64]} /><meshStandardMaterial color={step === k ? "#2a241b" : "#1b1712"} roughness={1} /></mesh>)}
      <group position={[FEAT_X[0], 0, 0]}><Globe on={step === 0} done={step >= 0} /></group>
      <group position={[0, 0, 0]}><Facade on={step === 1} done={step >= 1} /></group>
      <group position={[FEAT_X[2], 0, 0]}><Spread on={step === 2} done={step >= 2} /></group>
      {["01", "02", "03"].map((t, k) => <Label key={t} text={t} position={[FEAT_X[k] + 2.4, 0.3, 2.8]} size={0.34} color={step === k ? HEX.red : "#5a5245"} font="serif" weight={800} />)}
    </group>
  );
}

/* ======================= Trang 6 · Ba dạng (và trang 14) ======================= */
const M = 8, TOP = 3.2;
const BASE = (() => { const r = rng(11); return Array.from({ length: M }, (_, i) => { const a = (i / M) * Math.PI * 2 + (r() - 0.5) * 0.5, d = 0.9 + r() * 0.6; return [Math.cos(a) * d * 1.2, Math.sin(a) * d * 0.85] as const; }); })();
function House({ p, s = 1 }: { p: V3; s?: number }) {
  return <group position={p} scale={s}><mesh position={[0, 0.3, 0]} castShadow><boxGeometry args={[0.6, 0.6, 0.6]} /><meshStandardMaterial color="#8c7a5c" /></mesh><mesh position={[0, 0.78, 0]} rotation={[0, Math.PI / 4, 0]} castShadow><coneGeometry args={[0.52, 0.42, 4]} /><meshStandardMaterial color="#6a2a22" /></mesh></group>;
}
export function TypesStation({ step, monitor = false }: { step: number; monitor?: boolean }) {
  const L = monitor ? { onX: -2.4, reX: 2.4, real: 1, beams: [0, 3, 5], ring: false, mirror: -1 }
    : step === 0 ? { onX: 0, reX: 0, real: 0, beams: [] as number[], ring: true, mirror: -1 }
    : step === 1 ? { onX: -2.4, reX: 2.4, real: 1, beams: [0, 3, 5], ring: false, mirror: -1 }
    : { onX: 0, reX: 0, real: 1, beams: [0, 1, 2, 3, 4, 5, 6, 7], ring: false, mirror: 1 };
  const onOut = useRef<PawnT[] | null>(null), reOut = useRef<PawnT[] | null>(null);
  const w = useRef(new Array(M).fill(0) as number[]);
  const ring = useMemo(() => dashedLine(circlePoints(1.6, 96), "#d8cba8", 0.2, 0.14, 0.9), []);
  const scan = useRef<THREE.Mesh>(null!), ringA = useRef(0);
  useFrame(({ clock }, dt) => {
    for (let i = 0; i < M; i++) w.current[i] = damp(w.current[i], L.beams.includes(i) ? 1 : 0, 3, dt);
    ringA.current = damp(ringA.current, L.ring ? 1 : 0, 4, dt); (ring.material as THREE.LineDashedMaterial).opacity = 0.9 * ringA.current; ring.visible = ringA.current > 0.02;
    const k = (Math.sin(clock.elapsedTime * 0.9) + 1) / 2; scan.current.position.y = 0.05 + k * (TOP - 0.1); (scan.current.material as THREE.MeshBasicMaterial).opacity = monitor ? 0.16 : 0;
  });
  const placeOn = (i: number, o: PawnT, t: number) => { const [bx, bz] = BASE[i]; o.p.set(L.onX + bx, TOP + Math.max(0, Math.sin(t * 1.4 + i)) * 0.05, bz); o.c.copy(K.red); };
  const placeRe = (i: number, o: PawnT) => { const [bx, bz] = BASE[i]; o.p.set(L.reX + bx * (L.mirror > 0 ? 1 : 0.9), 0.22, bz * L.mirror); o.c.copy(K.ivory); o.s = L.real; };
  const fillBeam = (i: number, a: THREE.Vector3, b: THREE.Vector3) => { const P = onOut.current, Q = reOut.current; if (!P || !Q) return 0; a.copy(P[i].p).setY(TOP); b.copy(Q[i].p).setY(Q[i].p.y + 0.94 * Q[i].s); return w.current[i] * Q[i].s; };
  const fillDot = (i: number, p: THREE.Vector3, t: number) => { const P = onOut.current, Q = reOut.current; if (!P || !Q) return 0; const f = (t * 0.5 + i * 0.37) % 1; p.lerpVectors(P[i].p.clone().setY(TOP), Q[i].p.clone().setY(Q[i].p.y + 0.94), monitor && i % 2 ? 1 - f : f); return 0.07 * w.current[i] * Q[i].s; };
  const edges: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0], [0, 4], [2, 6]];
  const fillEdge = (out: React.MutableRefObject<PawnT[] | null>, y: number) => (i: number, a: THREE.Vector3, b: THREE.Vector3) => { const P = out.current; if (!P) return 0; const [x, z] = edges[i]; a.copy(P[x].p).setY(P[x].p.y + y * P[x].s); b.copy(P[z].p).setY(P[z].p.y + y * P[z].s); return Math.min(P[x].s, P[z].s); };
  return (
    <group>
      {/* tầng thực tế: sa bàn */}
      <mesh position={[0, 0.11, 0]} receiveShadow castShadow><boxGeometry args={[11, 0.22, 6.6]} /><meshStandardMaterial color="#3a3226" roughness={1} /></mesh>
      <House p={[-4.6, 0.22, -2.6]} /><House p={[4.7, 0.22, -2.5]} s={0.8} /><House p={[-4.8, 0.22, 2.5]} s={0.9} /><House p={[5.0, 0.22, 0.3]} s={0.85} />
      <primitive object={ring} position={[0, 0.24, 0]} />
      {/* tầng mạng: màn lưới lơ lửng */}
      <GlowGrid w={11} d={6.6} color={HEX.red} y={TOP} fill={0.1} div={24} />
      {[[-5.5, -3.3], [5.5, -3.3], [-5.5, 3.3], [5.5, 3.3]].map(([x, z]) => <mesh key={`${x}${z}`} position={[x, TOP / 2 + 0.11, z]}><cylinderGeometry args={[0.03, 0.03, TOP - 0.2]} /><meshStandardMaterial color="#5a4a3a" /></mesh>)}
      <Label text="KHÔNG GIAN MẠNG" position={[3.4, TOP + 0.35, -3.3]} size={0.24} color="#ff8a8a" font="mono" tracking={0.14} />
      <Label text="THỰC TẾ" position={[-3.4, 0.5, 3.8]} size={0.24} color="#e3d3a8" font="mono" tracking={0.14} />
      <Crowd count={M} place={placeOn} out={onOut} />
      <Crowd count={M} place={placeRe} out={reOut} />
      <Rods count={edges.length} radius={0.02} color={HEX.red} opacity={0.8} fill={fillEdge(onOut, 0.5)} />
      <Rods count={edges.length} radius={0.02} color={HEX.ivory} opacity={0.5} fill={fillEdge(reOut, 0.5)} />
      <Rods count={M} radius={0.045} color={monitor ? HEX.gold : "#ffd9a8"} opacity={0.75} fill={fillBeam} />
      <Dots count={M} color={monitor ? HEX.gold : "#fff1c8"} fill={fillDot} />
      <mesh ref={scan} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[11, 6.6]} /><meshBasicMaterial color={HEX.gold} transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} /></mesh>
      {!monitor && <>
        <Label text="KHÔNG CÓ NHÓM THỰC TẾ" position={[0, 0.7, 2.2]} size={0.17} color="#e3d3a8" font="mono" show={step === 0} />
        <Label text="KÊNH TRUYỀN THÔNG" position={[0, TOP * 0.5, 0.6]} size={0.17} color="#1a1a1a" bg="#ffd9a8" font="mono" show={step === 1} />
        <Label text="THÀNH VIÊN TRÙNG NHAU" position={[4.1, TOP * 0.5, 0.6]} size={0.17} color="#1a1a1a" bg="#ffd9a8" font="mono" show={step === 2} />
      </>}
      {!monitor && <>
        <group visible={step === 1}><PhotoCard url="/images/vv03.jpg" caption="Dạng 02 · Hội nhà báo độc lập Việt Nam · Ảnh: TTXVN" position={[4.1, 0.24, 2.25]} rot={-0.08} w={2.0} pin={false} /></group>
        <group visible={step === 2}><PhotoCard url="/images/vv01.jpg" caption="Dạng 03 · Hội anh em dân chủ · Ảnh: TTXVN" position={[4.1, 0.24, 2.25]} rot={-0.08} w={2.0} pin={false} /></group>
      </>}
      {monitor && <Label text="MỐI LIÊN HỆ CẦN XÁC ĐỊNH SỚM" position={[-0.9, TOP * 0.5 + 0.2, 2.6]} size={0.18} color="#1a1a1a" bg={HEX.gold} font="mono" />}
    </group>
  );
}

/* ======================= Trang 8 · Ba hình thức ======================= */
function FormNew({ on, done }: { on: boolean; done: boolean }) {
  const place = (i: number, o: PawnT) => { const a = (i / 5) * Math.PI * 2 + 0.6; if (done) o.p.set(Math.cos(a) * 1.0, 0.2, Math.sin(a) * 0.8 + 0.2); else o.p.set(Math.cos(a) * 4, 0, Math.sin(a) * 3); o.c.copy(K.red); o.s = done ? 0.9 : 0; };
  return <group>
    <Crowd count={5} place={place} lambda={2} />
    <Rise on={done} size={[0.06, 2.4, 0.06]} position={[0, 0.2, -0.3]} color="#bbb" lambda={2.5} />
    <Rise on={done} size={[0.9, 0.55, 0.03]} position={[0.46, 2.05, -0.3]} color={HEX.red} lambda={1.6} />
    <Ripples position={[0, 0.25, 0]} on={on} max={2} />
  </group>;
}
function FormRevive({ on, done }: { on: boolean; done: boolean }) {
  const r = useMemo(() => rng(17), []);
  const scattered = useMemo(() => Array.from({ length: 6 }, () => { const a = r() * Math.PI * 2, d = 2.1 + r() * 0.8; return v3(Math.cos(a) * d, 0, Math.sin(a) * d * 0.8); }), [r]);
  const place = (i: number, o: PawnT) => { const a = (i / 6) * Math.PI * 2; if (done) { o.p.set(Math.cos(a) * 1.05, 0.2, Math.sin(a) * 0.8 + 0.2); o.c.copy(K.red); } else { o.p.copy(scattered[i]); o.c.copy(K.dim); o.s = 0.8; } };
  const shards = useRef<THREE.Group>(null!), a = useRef(0);
  const starts = useMemo(() => Array.from({ length: 4 }, () => [(r() - 0.5) * 4, 0.1, (r() - 0.5) * 3, r() * 3] as const), [r]);
  useFrame((_, dt) => {
    a.current = damp(a.current, done ? 1 : 0, 1.8, dt);
    shards.current.children.forEach((m, j) => { const s = starts[j]; m.position.set(THREE.MathUtils.lerp(s[0], 0, a.current), THREE.MathUtils.lerp(s[1], 0.35 + j * 0.42, a.current), THREE.MathUtils.lerp(s[2], -0.2, a.current)); m.rotation.set(0, (1 - a.current) * s[3], (1 - a.current) * s[3] * 0.5); });
  });
  return <group>
    <Crowd count={6} place={place} lambda={2} />
    <group ref={shards}>{[0, 1, 2, 3].map(j => <mesh key={j} castShadow><boxGeometry args={[0.7, 0.4, 0.7]} /><meshStandardMaterial color={done ? "#7a1218" : "#4a463e"} roughness={0.8} /></mesh>)}</group>
    <Ripples position={[0, 0.25, 0]} on={on} max={2} />
  </group>;
}
function FormCorrupt({ on, done }: { on: boolean; done: boolean }) {
  const since = useSince(on);
  const place = (i: number, o: PawnT, t: number) => {
    const el = done ? (on ? t - since.current : 99) : -1;
    if (i < 7) { const a = (i / 7) * Math.PI * 2; o.p.set(Math.cos(a) * 1.15, 0.2, Math.sin(a) * 0.85 + 0.2); o.c.copy(el > 1.4 + i * 0.25 ? K.red : K.green); return; }
    if (i === 7) { o.p.set(el > 0.2 ? 3.4 : 0, el > 0.2 ? 0 : 0.55, el > 0.2 ? 1.4 : 0.2); o.c.copy(K.green); o.s = 1.1; return; } // quản trị viên cũ bị gạt ra
    o.p.set(el > 0.8 ? 0 : 3.6, el > 0.8 ? 0.55 : 0, el > 0.8 ? 0.2 : -2.2); o.c.copy(K.red); o.s = el > 0 ? 1.1 : 0; // người được cài vào
  };
  return <group>
    <mesh position={[0, 0.38, 0.2]} castShadow><cylinderGeometry args={[0.38, 0.42, 0.36, 24]} /><meshStandardMaterial color="#3a3127" /></mesh>
    <Crowd count={9} place={place} lambda={2.4} />
    <Ripples position={[0, 0.25, 0.2]} on={on} color={HEX.gold} max={2} />
  </group>;
}
export function FormsStation({ step }: { step: number }) {
  const xs = [-4.4, 0, 4.4], names = ["MỚI", "PHỤC HỒI", "BIẾN CHẤT"];
  return (
    <group>
      {xs.map((x, k) => <group key={x} position={[x, 0, 0]}>
        <mesh position={[0, 0.1, 0]} receiveShadow castShadow><cylinderGeometry args={[1.9, 2.0, 0.2, 64]} /><meshStandardMaterial color={step === k ? "#3a3022" : "#241f18"} roughness={0.9} /></mesh>
        <Label text={`0${k + 1} · ${names[k]}`} position={[0, 0.3, 2.45]} size={0.22} color={step >= k ? "#f0d48a" : "#6a6152"} font="mono" weight={700} />
      </group>)}
      <group position={[xs[0], 0, 0]}><FormNew on={step === 0} done={step >= 0} /></group>
      <group position={[xs[1], 0, 0]}><FormRevive on={step === 1} done={step >= 1} /></group>
      <group position={[xs[2], 0, 0]}><FormCorrupt on={step === 2} done={step >= 2} /></group>
    </group>
  );
}
