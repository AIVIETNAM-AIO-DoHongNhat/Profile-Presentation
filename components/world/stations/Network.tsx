"use client";
// Trang 10 · Từ đám đông đến tổ đơn tuyến. Ẩn dụ: quảng trường → đèn rọi chấm chọn → phòng kín có khóa
// → vách ngăn chia tổ → người điều hành bên kia bức tường biên giới giật dây rối từng tổ.
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Label, damp, rng } from "../../three/kit";
import { Beam, Crowd, Dots, GlowGrid, HEX, K, PhotoCard, Rise, Rods, type PawnT } from "../props";

const N = 46, CHOSEN = [3, 9, 14, 22, 30, 41];
const PLAZA = new THREE.Vector3(-5.6, 0, 0), ROOM = new THREE.Vector3(1.8, 0, 0), WALL_X = 5.4, BOSS = new THREE.Vector3(8.6, 0.9, 0);
const BAR = new THREE.Vector3(7.0, 4.7, 0);

export function NetworkStation({ step }: { step: number }) {
  const r = useMemo(() => rng(7), []);
  const crowd = useMemo(() => Array.from({ length: N }, () => { const a = r() * Math.PI * 2, d = Math.sqrt(r()); return new THREE.Vector3(PLAZA.x + Math.cos(a) * d * 3.1, 0.02, Math.sin(a) * d * 2.5); }), [r]);
  const out = useRef<PawnT[] | null>(null);
  const cellZ = [-1.15, 0, 1.15];
  const place = (i: number, o: PawnT, t: number) => {
    const ci = CHOSEN.indexOf(i), base = crowd[i];
    o.p.set(base.x + Math.sin(t * 0.5 + i) * 0.18, 0.02, base.z + Math.cos(t * 0.45 + i * 1.3) * 0.18);
    o.c.copy(step >= 2 && ci < 0 ? K.dim : K.ivory);
    if (ci < 0) return;
    if (step >= 1) o.c.copy(K.red);
    if (step === 1) o.p.copy(base);
    if (step === 2) { const a = (ci / 6) * Math.PI * 2 + t * 0.2; o.p.set(ROOM.x + Math.cos(a) * 0.95, 0.02, Math.sin(a) * 0.95); }
    if (step >= 3) { o.p.set(ROOM.x + (ci % 2 ? 0.45 : -0.45), 0.02, cellZ[Math.floor(ci / 2)]); }
    if (step >= 4) o.p.y = 0.02 + Math.max(0, Math.sin(t * 3 + ci * 1.7)) * 0.22; // giật dây
  };
  const boss = (i: number, o: PawnT, t: number) => { o.p.set(BOSS.x, BOSS.y, 0); o.c.copy(K.red); o.s = step >= 4 ? 2.4 : 0; o.p.y += Math.sin(t) * 0.02; };

  // thanh điều khiển con rối
  const bar = useRef<THREE.Group>(null!), barA = useRef(0);
  useFrame(({ clock }, dt) => { barA.current = damp(barA.current, step >= 4 ? 1 : 0, 2.5, dt); bar.current.scale.setScalar(Math.max(barA.current, 1e-3)); bar.current.rotation.x = Math.sin(clock.elapsedTime * 1.5) * 0.12; bar.current.rotation.z = Math.sin(clock.elapsedTime * 1.1) * 0.05; });
  const tip = useMemo(() => new THREE.Vector3(), []);
  const fillString = (i: number, a: THREE.Vector3, b: THREE.Vector3) => {
    const P = out.current; if (!P || step < 4) return 0;
    const p = P[CHOSEN[i]].p; tip.set(0, 0, cellZ[Math.floor(i / 2)] * 1.0 + (i % 2 ? 0.18 : -0.18)); tip.applyEuler(bar.current.rotation).add(BAR);
    a.copy(tip); b.set(p.x, p.y + 0.94, p.z); return barA.current;
  };
  const fillHand = (i: number, a: THREE.Vector3, b: THREE.Vector3) => { if (step < 4) return 0; a.set(BOSS.x - 0.3, BOSS.y + 1.9, 0); b.copy(BAR).add(new THREE.Vector3(0.1, 0, i ? 0.2 : -0.2)); return barA.current; };
  const fillPulse = (i: number, p: THREE.Vector3, t: number) => { if (step < 4) return 0; const s = i % 6, f = (t * 0.6 + Math.floor(i / 6) * 0.5) % 1; const P = out.current; if (!P) return 0; const q = P[CHOSEN[s]].p; p.lerpVectors(BAR, new THREE.Vector3(q.x, q.y + 0.94, q.z), f); return 0.06; };
  const fillLink = (i: number, a: THREE.Vector3, b: THREE.Vector3) => { const P = out.current; if (!P || step !== 2) return 0; const x = CHOSEN[i], y = CHOSEN[(i + 1) % 6]; a.copy(P[x].p).setY(0.6); b.copy(P[y].p).setY(0.6); return 1; };

  return (
    <group>
      {/* quảng trường công khai */}
      <mesh position={[PLAZA.x, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[3.6, 64]} /><meshStandardMaterial color="#2b261d" roughness={1} /></mesh>
      <mesh position={[PLAZA.x, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[3.55, 3.65, 96]} /><meshBasicMaterial color="#d8cba8" transparent opacity={0.5} /></mesh>
      <Label text="HỘI NHÓM CÔNG KHAI" position={[PLAZA.x, 0.3, 3.9]} size={0.22} color="#e3d3a8" font="mono" tracking={0.12} />
      <Crowd count={N} place={place} out={out} lambda={2.4} />
      {CHOSEN.map(i => <Beam key={i} position={[crowd[i].x, 0, crowd[i].z]} on={step === 1} r={0.55} h={6} />)}

      {/* phòng kín, mã hóa */}
      <group position={[ROOM.x, 0, 0]}><GlowGrid w={3.4} d={3.6} color={HEX.green} y={0.02} fill={0.12} div={8} /></group>
      <Rise on={step >= 2} size={[3.4, 1.4, 0.06]} position={[ROOM.x, 0, -1.8]} color={HEX.green} opacity={0.32} />
      <Rise on={step >= 2} size={[3.4, 1.4, 0.06]} position={[ROOM.x, 0, 1.8]} color={HEX.green} opacity={0.32} />
      <Rise on={step >= 2} size={[0.06, 1.4, 3.6]} position={[ROOM.x - 1.7, 0, 0]} color={HEX.green} opacity={0.32} />
      <Rise on={step >= 2} size={[0.06, 1.4, 3.6]} position={[ROOM.x + 1.7, 0, 0]} color={HEX.green} opacity={0.32} />
      <Lock on={step === 2} />
      <Rods count={6} radius={0.02} color="#9fe0b8" opacity={0.8} fill={fillLink} />
      <Label text="NHÓM KÍN · MÃ HÓA" position={[ROOM.x, 2.9, 0]} size={0.2} color="#1a1a1a" bg="#9fe0b8" font="mono" show={step === 2} />
      {/* vách ngăn chia tổ */}
      <Rise on={step >= 3} size={[3.4, 1.4, 0.12]} position={[ROOM.x, 0, -0.58]} color="#1f2d24" lambda={2.4} />
      <Rise on={step >= 3} size={[3.4, 1.4, 0.12]} position={[ROOM.x, 0, 0.58]} color="#1f2d24" lambda={2.4} />
      <Label text="TỔ 2–3 NGƯỜI · KHÔNG BIẾT NHAU" position={[ROOM.x, 2.3, 0]} size={0.18} color="#1a1a1a" bg="#9fe0b8" font="mono" show={step === 3} />

      {/* biên giới và người điều hành */}
      <Rise on={step >= 4} size={[0.14, 3.4, 9]} position={[WALL_X, 0, 0]} color={HEX.red} opacity={0.3} lambda={2} />
      <Label text="BIÊN GIỚI" position={[WALL_X, 3.8, -3.6]} size={0.22} color="#ff8a8a" font="mono" tracking={0.2} show={step >= 4} />
      <Label text="TRONG NƯỚC" position={[WALL_X - 1.2, 0.3, 4.2]} size={0.2} color="#bfb6a3" font="mono" tracking={0.16} show={step >= 4} />
      <Label text="NƯỚC NGOÀI" position={[WALL_X + 1.6, 0.3, 4.2]} size={0.2} color="#ff9a9a" font="mono" tracking={0.16} show={step >= 4} />
      <Rise on={step >= 4} size={[2.2, 0.9, 2.2]} position={[BOSS.x, 0, 0]} color="#2a1214" />
      <Crowd count={1} place={boss} />
      <group ref={bar} position={BAR.toArray()}>
        <mesh castShadow><boxGeometry args={[0.12, 0.12, 3.0]} /><meshStandardMaterial color="#5a3a22" /></mesh>
        <mesh castShadow><boxGeometry args={[1.0, 0.1, 0.1]} /><meshStandardMaterial color="#5a3a22" /></mesh>
      </group>
      <Rods count={6} radius={0.012} color="#ffd0c8" opacity={0.9} additive={false} fill={fillString} />
      <Rods count={2} radius={0.05} color={HEX.redDeep} opacity={1} additive={false} fill={fillHand} />
      <Dots count={12} color="#ff9a9a" fill={fillPulse} />
      <group visible={step >= 4}><PhotoCard url="/images/vv04.jpg" caption="Đào Minh Quân, Phạm Lisa: điều hành từ Mỹ · Ảnh: Báo Tiền Phong" position={[BOSS.x - 0.7, 0.03, 2.5]} rot={-0.08} w={2.4} pin={false} /></group>
      <Label text={"NGƯỜI ĐIỀU HÀNH\nỞ NƯỚC NGOÀI"} position={[BOSS.x, 4.3, 0]} size={0.18} color="#1a1a1a" bg="#ff8a8a" font="mono" show={step >= 4} />
    </group>
  );
}

function Lock({ on }: { on: boolean }) {
  const g = useRef<THREE.Group>(null!), a = useRef(0);
  useFrame(({ clock }, dt) => { a.current = damp(a.current, on ? 1 : 0, 3, dt); g.current.scale.setScalar(Math.max(a.current, 1e-3)); g.current.rotation.y = clock.elapsedTime * 0.6; });
  return <group ref={g} position={[ROOM.x, 2.1, 0]}>
    <mesh castShadow><boxGeometry args={[0.6, 0.5, 0.25]} /><meshStandardMaterial color={HEX.gold} metalness={0.7} roughness={0.3} /></mesh>
    <mesh position={[0, 0.35, 0]}><torusGeometry args={[0.2, 0.05, 10, 24, Math.PI]} /><meshStandardMaterial color={HEX.gold} metalness={0.7} roughness={0.3} /></mesh>
  </group>;
}
