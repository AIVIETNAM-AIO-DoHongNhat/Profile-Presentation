"use client";
// Trang 7, 9: hồ sơ vụ việc mở trên bàn, vật chứng trượt ra, dấu đóng xuống.
// Trang 11–13: ba bậc thềm của ba giai đoạn, mỗi thủ đoạn một vật tượng trưng; trang 13 thêm đường cột mốc MSFJ.
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { CaseData, Slide } from "@/content/slides";
import { Label, damp } from "../../three/kit";
import { STAGE_H, TL_X } from "../layout";
import { Arc, Beam, Crowd, F, Folder, HEX, K, PhotoCard, Ripples, Rise, Sheet, Sign, canvasTex, grain, paperTexture, useTex, wrapFill, type PaperKind, type PawnT, type V3 } from "../props";

/* ---------- texture hồ sơ vụ việc ---------- */
export function caseCover(d: CaseData) {
  return canvasTex(1024, 726, (g, W, H) => {
    g.fillStyle = "#d4b277"; g.fillRect(0, 0, W, H); grain(g, W, H, Number(d.num) + 40, 5000);
    g.fillStyle = "#b3202a"; g.fillRect(0, 0, W, 26);
    g.fillStyle = "#f4efe2"; g.fillRect(80, 120, W - 160, 330);
    g.fillStyle = "#b3202a"; g.font = F.mono(34); g.fillText(`HỒ SƠ VỤ VIỆC ${d.num}`, 120, 190);
    g.fillStyle = "#1a1a1a"; g.font = F.serif(64); wrapFill(g, d.name, 120, 290, W - 260, 78);
    g.fillStyle = "rgba(26,26,26,.6)"; g.font = F.mono(26); g.fillText(`HS-${d.num}/KGM`, 100, H - 80);
  });
}
export function caseInside(d: CaseData) {
  return canvasTex(1024, 726, (g, W, H) => {
    g.fillStyle = "#f5f1e6"; g.fillRect(0, 0, W, H); grain(g, W, H, Number(d.num) + 50, 3000);
    g.fillStyle = "#b3202a"; g.font = F.mono(30); g.fillText("TRÍCH YẾU", 70, 84);
    g.fillStyle = "#1a1a1a"; g.font = F.serif(52); g.fillText(d.name, 70, 156);
    g.fillRect(70, 182, W - 140, 3);
    d.meta.forEach(([k, v], i) => {
      const y = 250 + i * 86;
      g.fillStyle = "#7a776f"; g.font = F.mono(26, 400); g.fillText(k.toUpperCase(), 70, y);
      g.fillStyle = "#1a1a1a"; g.font = F.sans(36, 600); g.fillText(v, 330, y);
      g.fillStyle = "rgba(26,26,26,.2)"; for (let x = 70; x < W - 70; x += 14) g.fillRect(x, y + 28, 7, 2);
    });
  });
}
function stampTex(text: string) {
  return canvasTex(768, 220, (g, W, H) => {
    g.strokeStyle = "rgba(200,40,48,.95)"; g.lineWidth = 12; g.strokeRect(14, 14, W - 28, H - 28);
    g.fillStyle = "rgba(200,40,48,.95)"; g.font = F.mono(80); g.textAlign = "center"; g.fillText(text.toUpperCase(), W / 2, H / 2 + 28);
    g.globalCompositeOperation = "destination-out"; for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.6})`; g.fillRect(Math.random() * W, Math.random() * H, 3, 3); }
  });
}
export function Stamp({ text, on, position, rot = -0.2 }: { text: string; on: boolean; position: V3; rot?: number }) {
  const tex = useTex(() => stampTex(text), [text]);
  const g = useRef<THREE.Group>(null!), a = useRef(0);
  useFrame((_, dt) => { a.current = damp(a.current, on ? 1 : 0, 7, dt); const k = a.current; g.current.position.y = position[1] + (1 - k) * 3; g.current.scale.setScalar(1 + (1 - k) * 0.8); g.current.visible = k > 0.02; });
  return <group ref={g} position={position}><mesh rotation={[-Math.PI / 2, 0, rot]}><planeGeometry args={[3.2, 0.92]} /><meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} /></mesh></group>;
}
/** Vật chứng (tờ giấy hoặc ảnh thật) trượt từ dưới hồ sơ ra vị trí. */
function SlideOut({ on, to, rot, children, from = [-1.4, 0] }: { on: boolean; to: V3; rot: number; children: React.ReactNode; from?: [number, number] }) {
  const g = useRef<THREE.Group>(null!), a = useRef(0);
  useFrame((_, dt) => { a.current = damp(a.current, on ? 1 : 0, 3.2, dt); const k = a.current; g.current.position.set(THREE.MathUtils.lerp(from[0], to[0], k), 0.02 + k * 0.03 + to[1], THREE.MathUtils.lerp(from[1], to[2], k)); g.current.rotation.y = rot * k; g.current.visible = k > 0.02; });
  return <group ref={g}>{children}</group>;
}
function Evidence({ kind, tag, seed }: { kind: PaperKind; tag: string; seed: number }) {
  const tex = useTex(() => paperTexture(kind, seed, tag), [kind, seed, tag]);
  return <><Sheet tex={tex} w={2.1} h={2.62} position={[0, 0, 0]} />
    <mesh position={[0, 0.16, -1.05]} castShadow><sphereGeometry args={[0.08, 14, 14]} /><meshStandardMaterial color={HEX.red} roughness={0.3} /></mesh></>;
}
const EVIDENCE: Record<string, PaperKind[]> = { "01": ["web", "doc", "net"], "02": ["doc", "money", "web"] };

export function CaseStation({ d, step, active }: { d: CaseData; step: number; active: boolean }) {
  const cover = useTex(() => caseCover(d), [d.num]), inside = useTex(() => caseInside(d), [d.num]);
  const kinds = EVIDENCE[d.num] ?? ["doc", "web", "net"];
  const spots: [V3, number][] = [[[1.4, 0.01, 2.9], -0.1], [[4.0, 0.02, 2.7], 0.08], [[5.9, 0.03, 0.3], -0.06]];
  const last = d.findings.length + 1, n = d.findings.length;
  return (
    <group>
      <Folder open={active} w={5.2} d={3.7} cover={cover} inside={inside} position={[-2.0, 0, 0.2]} />
      {/* ảnh thật của vụ việc: nằm cạnh hồ sơ ngay khi mở bìa */}
      <SlideOut on={active} to={[3.4, 0.02, -1.0]} rot={-0.05}><PhotoCard url={`/images/${d.image}`} caption={d.imageHint} position={[0, 0, 0]} w={3.4} /></SlideOut>
      {d.findings.map((_, i) => (
        <SlideOut key={i} on={active && step >= i + 1} to={spots[i][0]} rot={spots[i][1]}>
          {i === n - 1 && d.extra
            ? <PhotoCard url={`/images/${d.extra[0]}`} caption={d.extra[1]} position={[0, 0, 0]} w={2.8} />
            : <Evidence kind={kinds[i]} tag={`TÌNH TIẾT 0${i + 1}`} seed={Number(d.num) * 10 + i} />}
        </SlideOut>
      ))}
      <Stamp text={d.stamp} on={active && step >= last} position={[-1.6, 0.12, 1.1]} />
    </group>
  );
}

/* ---------- ba giai đoạn ---------- */
function plinthTex(kicker: string) {
  return canvasTex(1024, 160, (g, W, H) => {
    g.fillStyle = "#2b2620"; g.fillRect(0, 0, W, H); grain(g, W, H, 77, 1500);
    g.fillStyle = HEX.gold; g.font = F.mono(64); g.textAlign = "center"; g.fillText(kicker.toUpperCase(), W / 2, H / 2 + 22);
  });
}
/** Vật tượng trưng cho từng thủ đoạn. */
function Symbol({ sec, k, lit }: { sec: string; k: number; lit: boolean }) {
  const web = useTex(() => paperTexture("web", 60 + k), [k]), money = useTex(() => paperTexture("money", 70 + k), [k]);
  const pawns = (n: number, color: THREE.Color, s = 0.8, rad = 0.6) => (i: number, o: PawnT, t: number) => { const a = (i / n) * Math.PI * 2 + t * 0.1; o.p.set(Math.cos(a) * rad, 0, Math.sin(a) * rad * 0.7 + 0.4); o.c.copy(color); o.s = s; };
  const key = `${sec}-${k}`;
  switch (key) {
    case "V.1-0": return <group><Sign tex={web} w={1.5} h={1.15} position={[0, 0, -0.5]} /><Crowd count={4} place={pawns(4, K.ivory)} /></group>;
    case "V.1-1": return <group><mesh position={[0, 0.9, 0]} rotation={[0, 0, -Math.PI / 2.4]} castShadow><coneGeometry args={[0.55, 1.3, 24, 1, true]} /><meshStandardMaterial color={HEX.red} side={THREE.DoubleSide} /></mesh><mesh position={[0, 0.35, 0]}><cylinderGeometry args={[0.07, 0.07, 0.7]} /><meshStandardMaterial color="#444" /></mesh><Ripples position={[0.7, 0.05, 0]} on={lit} max={1.6} /></group>;
    case "V.1-2": return <group><mesh position={[0, 0.7, 0]} castShadow><octahedronGeometry args={[0.6, 0]} /><meshStandardMaterial color="#ff5a3a" emissive="#ff3a1a" emissiveIntensity={lit ? 1.2 : 0.2} /></mesh><Ripples position={[0, 0.05, 0]} on={lit} color="#ff7a3a" max={1.8} /></group>;
    case "V.1-3": return <group><mesh position={[0, 0.15, 0]} castShadow><boxGeometry args={[0.8, 0.3, 0.6]} /><meshStandardMaterial color="#6a5a3a" /></mesh><Crowd count={5} place={pawns(5, K.gold, 0.6, 0.75)} /></group>;
    case "V.2-0": return <group><mesh position={[0, 0.5, 0]} castShadow><boxGeometry args={[0.9, 0.75, 0.35]} /><meshStandardMaterial color={HEX.gold} metalness={0.7} roughness={0.3} /></mesh><mesh position={[0, 1.0, 0]}><torusGeometry args={[0.3, 0.07, 10, 24, Math.PI]} /><meshStandardMaterial color={HEX.gold} metalness={0.7} roughness={0.3} /></mesh></group>;
    case "V.2-1": return <group><Sign tex={web} w={1.5} h={1.15} position={[0, 0, -0.4]} /><Crowd count={1} place={(_, o) => { o.p.set(0.6, 0, 0.5); o.c.copy(K.red); }} /></group>;
    case "V.2-2": return <group><Rise on size={[1.2, 0.9, 0.04]} position={[0, 0, -0.5]} color={HEX.green} opacity={0.35} /><Rise on size={[1.2, 0.9, 0.04]} position={[0, 0, 0.5]} color={HEX.green} opacity={0.35} /><Crowd count={2} place={(i, o) => { o.p.set(i ? 0.25 : -0.25, 0, 0); o.c.copy(K.red); o.s = 0.85; }} /></group>;
    case "V.2-3": return <group><Crowd count={1} place={(_, o) => { o.p.set(0, 0, 0); o.c.copy(K.ivory); }} /><mesh position={[0, 0.6, 0]}><boxGeometry args={[1.0, 1.2, 1.0]} /><meshBasicMaterial color={HEX.red} wireframe /></mesh></group>;
    case "V.2-4": return <group><Crowd count={1} place={(_, o) => { o.p.set(0, 0, 0); o.c.copy(K.red); }} /><mesh position={[0.35, 0.25, 0.2]} castShadow><boxGeometry args={[0.45, 0.32, 0.14]} /><meshStandardMaterial color="#5a3a22" /></mesh><Arc points={[[0, 0.05, 2.2], [0, 0.6, 1.2], [0, 0.05, 0.35]]} on={lit} color={HEX.gold} r={0.025} /></group>;
    case "V.3-0": return <group>{[0, 1, 2, 3].map(j => <mesh key={j} position={[0, 0.06 + j * 0.12, 0]} rotation={[0, j * 0.2, 0]} castShadow><boxGeometry args={[1.1, 0.1, 0.6]} /><meshStandardMaterial color="#a8c4a0" /></mesh>)}<Sheet tex={money} w={0.9} h={1.1} position={[0.9, 0.02, 0.3]} rot={0.4} /></group>;
    case "V.3-1": return <group><mesh position={[0, 0.85, 0]}><icosahedronGeometry args={[0.65, 2]} /><meshBasicMaterial color={HEX.gold} wireframe /></mesh><mesh position={[0, 0.85, 0]}><sphereGeometry args={[0.6, 24, 24]} /><meshStandardMaterial color="#1b2a26" /></mesh></group>;
    case "V.3-2": return <group><mesh position={[0, 0.12, 0]} castShadow><boxGeometry args={[1.1, 0.16, 1.1]} /><meshStandardMaterial color="#1a1a1a" emissive="#3a8ab0" emissiveIntensity={lit ? 0.6 : 0.1} /></mesh>{[-0.4, -0.13, 0.13, 0.4].map(x => <mesh key={x} position={[x, 0.08, 0.62]}><boxGeometry args={[0.08, 0.06, 0.2]} /><meshStandardMaterial color={HEX.gold} metalness={0.8} /></mesh>)}</group>;
    default: return null;
  }
}
function Appear({ on, children, position }: { on: boolean; children: React.ReactNode; position: V3 }) {
  const g = useRef<THREE.Group>(null!), a = useRef(0);
  useFrame((_, dt) => { a.current = damp(a.current, on ? 1 : 0, 3.5, dt); g.current.scale.setScalar(Math.max(a.current, 1e-3)); g.current.visible = a.current > 0.01; });
  return <group ref={g} position={position}>{children}</group>;
}
function milestoneTex(year: string, text: string, hot: boolean) {
  return canvasTex(640, 360, (g, W, H) => {
    g.fillStyle = hot ? "#3b0b10" : "#f3eee2"; g.fillRect(0, 0, W, H); if (!hot) grain(g, W, H, 91, 1500);
    g.fillStyle = hot ? "#ff8a8a" : "#b3202a"; g.font = F.serif(84); g.fillText(year, 40, 116);
    g.fillStyle = hot ? "#fff" : "#1a1a1a"; g.font = F.sans(38, 600); wrapFill(g, text, 40, 190, W - 80, 50);
  });
}
function Milestone({ i, item, on, current, hot }: { i: number; item: [string, string]; on: boolean; current: boolean; hot: boolean }) {
  const tex = useTex(() => milestoneTex(item[0], item[1], hot), [item[0], hot]);
  return <group position={[TL_X(i), 0, 4.4]}>
    <Appear on={on} position={[0, 0, 0]}>
      <mesh position={[0, 0.7, 0]} castShadow><boxGeometry args={[0.08, 1.4, 0.08]} /><meshStandardMaterial color={hot ? HEX.red : HEX.gold} /></mesh>
      <Sign tex={tex} w={2.5} h={1.4} position={[0, 1.4, 0]} glow={current ? 1 : 0.55} />
    </Appear>
    <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.25, 32]} /><meshStandardMaterial color={on ? (hot ? HEX.red : HEX.gold) : "#3c3830"} emissive={on ? (hot ? HEX.red : HEX.gold) : "#000"} emissiveIntensity={current ? 1 : 0.3} /></mesh>
    {hot && <Ripples position={[0, 0.04, 0]} on={current} max={2.2} />}
  </group>;
}

export function StageStation({ s, step, active }: { s: Extract<Slide, { kind: "stage" }>; step: number; active: boolean }) {
  const h = STAGE_H[s.sec] ?? 0.6, n = s.rows.length;
  const plate = useTex(() => plinthTex(s.kicker), [s.sec]);
  const cover = useTex(() => caseCover(s.data), [s.data.num]), inside = useTex(() => caseInside(s.data), [s.data.num]);
  const xs = useMemo(() => s.rows.map((_, k) => (n === 1 ? 0 : -4.2 + (8.4 * k) / (n - 1))), [s.rows, n]);
  const rowStep = Math.min(step, n - 1);
  const tl = s.timeline, tk = tl ? step - n : -1; // mốc đang xem (−1: chưa tới)
  return (
    <group>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow><boxGeometry args={[11, h, 4.4]} /><meshStandardMaterial color="#2b2620" roughness={0.9} /></mesh>
      <mesh position={[0, h / 2, 2.201]}><planeGeometry args={[Math.min(0.5, h * 0.8) * 6.4, Math.min(0.5, h * 0.8)]} /><meshStandardMaterial map={plate} roughness={0.9} /></mesh>
      <mesh position={[0, h + 0.005, 2.18]}><boxGeometry args={[11, 0.02, 0.04]} /><meshBasicMaterial color={HEX.gold} /></mesh>
      {s.rows.map(([letter], k) => (
        <group key={k} position={[xs[k], h, -0.3]}>
          <Appear on={step >= k} position={[0, 0, 0]}><Symbol sec={s.sec} k={k} lit={rowStep === k && !(tl && tk >= 0)} /></Appear>
          <Label text={letter} position={[0, 0.25, 1.9]} size={0.36} color={step >= k ? HEX.gold : "#5a5245"} font="serif" weight={800} />
          <Beam position={[0, 0, 0]} on={active && rowStep === k && step < n && !(tl && tk >= 0)} r={0.9} h={5} />
        </group>
      ))}
      {!tl && <>
        {/* bìa vụ việc để đóng (nắp mở sẽ dựng đứng che các vật trên bục), ảnh thật trượt ra bên cạnh */}
        <Folder open={false} w={3.6} d={2.5} cover={cover} inside={inside} position={[-1.6, 0, 3.6]} />
        <SlideOut on={active && step >= n} to={[2.7, 0.03, 3.7]} rot={-0.06} from={[-1.6, 3.6]}><PhotoCard url={`/images/${s.data.image}`} caption={s.data.imageHint} position={[0, 0, 0]} w={3.1} /></SlideOut>
        <Beam position={[0.5, 0, 3.6]} on={active && step >= n} r={2.6} h={6} />
      </>}
      {tl && <>
        <mesh position={[0, 0.02, 4.4]} receiveShadow><boxGeometry args={[15.6, 0.04, 0.5]} /><meshStandardMaterial color="#1a1712" /></mesh>
        {tl.map((it, i) => <Milestone key={i} i={i} item={it} on={tk >= i} current={tk === i} hot={i === 2} />)}
        {/* dây đỏ đi tiếp từ đinh ghim đầu trạm qua từng cột mốc */}
        {tl.map((_, i) => <Arc key={`th${i}`} on={tk >= i} r={0.085} glow={0.35} speed={2.6}
          points={i === 0 ? [[-6.5, 0.04, 6.2], [(-6.5 + TL_X(0)) / 2, 0.06, 5.6], [TL_X(0), 0.06, 4.4]] : [[TL_X(i - 1), 0.06, 4.4], [(TL_X(i - 1) + TL_X(i)) / 2, 0.08, 4.62], [TL_X(i), 0.06, 4.4]]} />)}
        {/* ảnh hiện trường 11/6/2023 nằm trước mốc tương ứng */}
        {s.data.extra && <SlideOut on={active && tk >= 2} to={[TL_X(2) - 0.4, 0.03, 6.6]} rot={-0.05} from={[TL_X(2), 4.4]}><PhotoCard url={`/images/${s.data.extra[0]}`} caption={s.data.extra[1]} position={[0, 0, 0]} w={2.8} /></SlideOut>}
        {/* ảnh phiên tòa 1/2024 nằm trước mốc tương ứng */}
        <SlideOut on={active && tk >= 3} to={[TL_X(3) + 0.6, 0.03, 6.4]} rot={0.05} from={[TL_X(3), 4.4]}><PhotoCard url={`/images/${s.data.image}`} caption={s.data.imageHint} position={[0, 0, 0]} w={2.8} /></SlideOut>
      </>}
    </group>
  );
}
