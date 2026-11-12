"use client";
// Trang 15 · Tổng hợp và lời cảm ơn: hồ sơ HS-01 khép lại giữa ảnh nhóm và ảnh các vụ việc, dây đỏ buộc, dấu "Hoàn thành" đóng xuống.
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { COVER, SLIDES, TEAM_PHOTO, type CaseData } from "@/content/slides";
import { damp } from "../../three/kit";
import { Folder, HEX, PhotoCard, useTex } from "../props";
import { Stamp } from "./Cases";
import { contentsTex, coverTex } from "./Intro";

const CASES = SLIDES.flatMap(s => (s.kind === "case" || s.kind === "stage" ? [s.data] : [])) as CaseData[];
/** Ảnh vụ việc rải quanh hồ sơ: [vị trí, góc xoay] theo thứ tự vụ 01..05 */
const SPOTS: [[number, number, number], number][] = [
  [[2.2, 0.02, -4.4], -0.12], [[2.8, 0.025, -3.7], 0.14], [[-3.9, 0.03, -6.1], -0.1], [[-1.6, 0.02, -6.4], 0.08], [[1.2, 0.03, -6.9], -0.05],
];

/** Dây đỏ buộc ngang dọc qua bìa hồ sơ sau khi khép. */
function Tie({ on, w, d }: { on: boolean; w: number; d: number }) {
  const g = useRef<THREE.Group>(null!), a = useRef(0);
  useFrame((_, dt) => { a.current = damp(a.current, on ? 1 : 0, 5, dt); const k = Math.max(a.current, 1e-3); g.current.scale.set(k, 1, k); g.current.visible = a.current > 0.02; });
  const mat = <meshStandardMaterial color={HEX.red} emissive={HEX.red} emissiveIntensity={0.3} roughness={0.5} />;
  return (
    <group ref={g} position={[0, 0.17, 0.2]}>
      <mesh position={[0, 0, 0.75]} castShadow><boxGeometry args={[w + 0.12, 0.025, 0.07]} />{mat}</mesh>
      <mesh position={[1.7, 0, 0]} castShadow><boxGeometry args={[0.07, 0.025, d + 0.12]} />{mat}</mesh>
      <mesh position={[1.7, 0.02, 0.75]} castShadow><cylinderGeometry args={[0.16, 0.16, 0.05, 20]} />{mat}</mesh>
    </group>
  );
}

export function ClosingStation({ step, active }: { step: number; active: boolean }) {
  const cover = useTex(coverTex, []), inside = useTex(contentsTex, []);
  // 0: hồ sơ đang mở · 1: vừa khép, buộc dây · 2: đóng dấu
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!(active && step >= 1)) { setPhase(0); return; }
    const a = setTimeout(() => setPhase(1), 900), b = setTimeout(() => setPhase(2), 1900);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [active, step]);
  const W = 6, D = 4.25;
  return (
    <group>
      <PhotoCard url={TEAM_PHOTO} caption={`${COVER[0]?.[1] ?? "Nhóm"} · Nhóm thực hiện chuyên đề`} position={[-1.0, 0.02, -3.9]} rot={0.06} w={3.2} pin={false} />
      {CASES.map((c, i) => SPOTS[i] && <PhotoCard key={c.num} url={`/images/${c.image}`} caption={`Vụ việc ${c.num} · ${c.name}`} position={SPOTS[i][0]} rot={SPOTS[i][1]} w={2.3} pin={false} />)}
      <Folder open={phase === 0} w={W} d={D} cover={cover} inside={inside} position={[0, 0, 0.2]} />
      <Tie on={phase >= 1} w={W} d={D} />
      <Stamp text="Hoàn thành" on={phase >= 2} position={[-0.7, 0.2, 1.45]} rot={-0.16} />
    </group>
  );
}
