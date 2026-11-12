"use client";
// "Phòng chuyên án": một canvas duy nhất cho cả 15 trang. Mỗi trang là một trạm trên mặt bàn,
// camera lướt giữa các trạm, dây đỏ tự vẽ dần nối trạm cũ với trạm mới.
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { SLIDES, SEC_OF, TITLES, stepsOf } from "@/content/slides";
import { damp, rng } from "../three/kit";
import { TOTAL, anchorOf, shotFor, stationPos, CENTER } from "./layout";
import { Beam, F, HEX, Pin, canvasTex, feltTexture, useTex } from "./props";
import { CoverStation, TeamStation } from "./stations/Intro";
import { ConceptStation, FeaturesStation, FormsStation, TypesStation } from "./stations/Theory";
import { NetworkStation } from "./stations/Network";
import { CaseStation, StageStation } from "./stations/Cases";
import { ClosingStation } from "./stations/Outro";

type WP = { n: number; step: number };

function Station({ k, n, step }: { k: number } & WP) {
  const s = SLIDES[k - 1], active = k === n, st = active ? step : k < n ? stepsOf(s) : 0;
  switch (s.kind) {
    case "cover": return <CoverStation step={st} active={active} />;
    case "team": return <TeamStation step={st} />;
    case "concept": return <ConceptStation step={st} />;
    case "features": return <FeaturesStation step={st} />;
    case "types": return <TypesStation step={st} />;
    case "case": return <CaseStation d={s.data} step={st} active={active} />;
    case "forms": return <FormsStation step={st} />;
    case "network": return <NetworkStation step={st} />;
    case "stage": return <StageStation s={s} step={st} active={active} />;
    case "conclusion": return <TypesStation step={2} monitor />;
    case "closing": return <ClosingStation step={st} active={active} />;
    default: return null;
  }
}

/* ---------- camera ---------- */
function Rig({ n, step }: WP) {
  const { camera, size } = useThree();
  const target = useMemo(() => {
    const s = shotFor(n, step), o = s.abs ? new THREE.Vector3() : stationPos(n);
    return { pos: new THREE.Vector3(...s.pos).add(o), look: new THREE.Vector3(...s.look).add(o), fov: s.fov ?? 40, shift: s.shift ?? 0.17 };
  }, [n, step]);
  const st = useRef<{ look: THREE.Vector3; fov: number; shift: number; t: number } | null>(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ pointer }, dt) => {
    const cam = camera as THREE.PerspectiveCamera;
    if (!st.current) { cam.position.copy(target.pos); st.current = { look: target.look.clone(), fov: target.fov, shift: target.shift, t: 0 }; }
    const c = st.current, k = 1.6; c.t += dt;
    const far = cam.position.distanceTo(target.pos);
    tmp.copy(target.pos);
    tmp.x += pointer.x * 0.35 + Math.sin(c.t * 0.21) * 0.12; tmp.y += pointer.y * 0.2 + Math.min(far * 0.28, 9); // bay vòng lên khi đi xa
    cam.position.set(damp(cam.position.x, tmp.x, k, dt), damp(cam.position.y, tmp.y, k, dt), damp(cam.position.z, tmp.z, k, dt));
    c.look.set(damp(c.look.x, target.look.x, k * 1.15, dt), damp(c.look.y, target.look.y, k * 1.15, dt), damp(c.look.z, target.look.z, k * 1.15, dt));
    c.fov = damp(c.fov, target.fov, k, dt); c.shift = damp(c.shift, target.shift, k, dt);
    cam.fov = c.fov; cam.setViewOffset(size.width, size.height, -c.shift * size.width, 0, size.width, size.height); cam.updateProjectionMatrix();
    cam.lookAt(c.look);
  });
  return null;
}

/* ---------- ánh sáng, sương ---------- */
function Atmosphere({ n, overview }: { n: number; overview: boolean }) {
  const spot = useRef<THREE.SpotLight>(null!), amb = useRef<THREE.AmbientLight>(null!);
  const { scene } = useThree();
  const tgt = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => { scene.add(tgt); spot.current.target = tgt; return () => { scene.remove(tgt); }; }, [scene, tgt]);
  const ov = useRef(overview ? 1 : 0);
  useFrame(({ clock }, dt) => {
    const p = stationPos(n);
    tgt.position.set(damp(tgt.position.x, p.x, 1.8, dt), 0, damp(tgt.position.z, p.z, 1.8, dt));
    spot.current.position.set(tgt.position.x + 3, 17, tgt.position.z + 8);
    ov.current = damp(ov.current, overview ? 1 : 0, 2, dt);
    spot.current.intensity = (3.6 + Math.sin(clock.elapsedTime * 7) * 0.05) * (1 - ov.current * 0.6);
    amb.current.intensity = 0.32 + ov.current * 1.5;
    // nhìn toàn bàn: dừng cập nhật bản đồ bóng (đắt nhất khi dựng cả 15 trạm), không đổi shader nên không giật
    spot.current.shadow.autoUpdate = ov.current < 0.5;
    const fog = scene.fog as THREE.Fog; fog.near = 15 + ov.current * 170; fog.far = 31 + ov.current * 280;
  });
  return <>
    <fog attach="fog" args={[HEX.night, 15, 31]} />
    <ambientLight ref={amb} intensity={0.32} color="#ffe9c8" />
    <hemisphereLight args={["#5a6a7a", "#1a120a", 0.35]} />
    <spotLight ref={spot} angle={0.62} penumbra={0.75} decay={0} intensity={3.6} color="#ffe2b0" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} shadow-normalBias={0.02} shadow-camera-near={4} shadow-camera-far={45} />
    <directionalLight position={[-20, 10, -10]} intensity={0.25} color="#7f9fc0" />
  </>;
}

function Desk() {
  const felt = useTex(feltTexture, []);
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[CENTER.x, 0, CENTER.z]} receiveShadow><planeGeometry args={[400, 300]} /><meshStandardMaterial map={felt} roughness={1} color="#8a7a66" /></mesh>;
}

/* ---------- dây đỏ nối các trạm ---------- */
function threadCurve(a: number) {
  const A = anchorOf(a), B = anchorOf(a + 1);
  const pts = [A];
  if (Math.abs(A.z - B.z) > 1) { const side = A.x < 1 ? A.x - 3.5 : A.x + 19; pts.push(new THREE.Vector3(side, 0.04, A.z), new THREE.Vector3(side, 0.04, B.z)); }
  else pts.push(A.clone().lerp(B, 0.5).add(new THREE.Vector3(0, 0.03, 0.6)));
  pts.push(B);
  return new THREE.CatmullRomCurve3(pts, false, "centripetal");
}
function Thread({ n }: { n: number }) {
  const SEG = 120;
  const geos = useMemo(() => Array.from({ length: TOTAL - 1 }, (_, j) => new THREE.TubeGeometry(threadCurve(j + 1), SEG, 0.085, 6, false)), []);
  const fr = useRef<number[]>(geos.map((_, j) => (j < n - 1 ? 1 : 0)));
  useFrame((_, dt) => { geos.forEach((g, j) => { const f = (fr.current[j] = damp(fr.current[j], j < n - 1 ? 1 : 0, 1.4, dt)); g.setDrawRange(0, Math.floor(f * SEG) * 36); }); });
  return <group>
    {geos.map((g, j) => <mesh key={j} geometry={g} castShadow><meshStandardMaterial color={HEX.red} emissive={HEX.red} emissiveIntensity={0.35} roughness={0.55} /></mesh>)}
    {Array.from({ length: TOTAL }, (_, i) => <Pin key={i} position={anchorOf(i + 1).toArray()} color={i + 1 <= n ? (i + 1 === n ? HEX.gold : HEX.red) : "#5a5245"} s={2.2} />)}
  </group>;
}

/* ---------- bảng tên trạm (hiện khi nhìn toàn bàn) ---------- */
function plateTex(i: number) {
  return canvasTex(1200, 360, (g, W, H) => {
    g.fillStyle = "#efe8d8"; g.fillRect(0, 0, W, H);
    g.fillStyle = "#b3202a"; g.fillRect(0, 0, 22, H);
    g.fillStyle = "#b3202a"; g.font = F.serif(170); g.fillText(String(i + 1).padStart(2, "0"), 60, 220);
    g.fillStyle = "#7a776f"; g.font = F.mono(46); g.fillText(String(SEC_OF[i + 1]) || "·", 330, 110);
    g.fillStyle = "#1a1a1a"; g.font = F.sans(70, 700);
    const words = TITLES[i].split(" · "); g.fillText(words[0], 330, 210); if (words[1]) { g.font = F.serif(56, 400, true); g.fillStyle = "#4a4a46"; g.fillText(words[1], 330, 290); }
  });
}
function Plate({ i, overview, hot }: { i: number; overview: boolean; hot: boolean }) {
  const tex = useTex(() => plateTex(i), [i]);
  const m = useRef<THREE.MeshBasicMaterial>(null!), mesh = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => { m.current.opacity = damp(m.current.opacity, overview ? (hot ? 1 : 0.92) : 0, 2.5, dt); mesh.current.visible = m.current.opacity > 0.01; });
  const p = stationPos(i + 1);
  return <mesh ref={mesh} position={[p.x - 0.5, 0.3, p.z + 6.6]} rotation={[-Math.PI / 2.6, 0, 0]}><planeGeometry args={[11, 3.3]} /><meshBasicMaterial ref={m} map={tex} transparent opacity={0} depthWrite={false} toneMapped={false} /></mesh>;
}

/* ---------- bụi bay trong luồng đèn ---------- */
function Dust({ n }: { n: number }) {
  const pts = useRef<THREE.Points>(null!);
  const { geo, base } = useMemo(() => {
    const r = rng(9), c = 300, arr = new Float32Array(c * 3);
    for (let i = 0; i < c; i++) { arr[i * 3] = (r() - 0.5) * 18; arr[i * 3 + 1] = r() * 9; arr[i * 3 + 2] = (r() - 0.5) * 12; }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(arr, 3)); return { geo: g, base: arr.slice() };
  }, []);
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime, a = geo.getAttribute("position") as THREE.BufferAttribute, arr = a.array as Float32Array;
    for (let i = 0; i < arr.length; i += 3) { arr[i] = base[i] + Math.sin(t * 0.13 + i) * 0.3; arr[i + 1] = (base[i + 1] + t * 0.08) % 9; }
    a.needsUpdate = true;
    const p = stationPos(n); pts.current.position.set(damp(pts.current.position.x, p.x, 1.6, dt), 0, damp(pts.current.position.z, p.z, 1.6, dt));
  });
  return <points ref={pts} geometry={geo} frustumCulled={false}><pointsMaterial size={0.035} color="#ffe6b8" transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} /></points>;
}

/* ---------- trang 14: soi lại các trạm minh chứng cho từng nhận xét ---------- */
const PROOF: number[][] = [[11, 12, 13], [10], [6]];
function Proofs({ n, step }: WP) {
  const on = SLIDES[n - 1].kind === "conclusion";
  return <>{[6, 10, 11, 12, 13].map(k => { const p = stationPos(k); return <Beam key={k} position={[p.x + 1, 0, p.z + 1]} on={on && (PROOF[step] ?? []).includes(k)} r={8} h={34} color={HEX.gold} />; })}</>;
}

/* ---------- trang 15, nhịp tổng hợp: đèn vàng lần lượt soi lại toàn bộ 14 trạm ---------- */
function Recap({ n, step }: WP) {
  const on = SLIDES[n - 1].kind === "closing" && step === 0;
  const [k, setK] = useState(0);
  useEffect(() => {
    if (!on) { setK(0); return; }
    let i = 0; const id = setInterval(() => { i += 1; setK(i); if (i >= TOTAL - 1) clearInterval(id); }, 220);
    return () => clearInterval(id);
  }, [on]);
  return <>{Array.from({ length: TOTAL - 1 }, (_, i) => { const p = stationPos(i + 1); return <Beam key={i} position={[p.x + 1, 0, p.z + 1]} on={on && i < k} r={7} h={34} color={HEX.gold} />; })}</>;
}

function Scene({ n, step }: WP) {
  const overview = !!shotFor(n, step).overview;
  const conclusion = SLIDES[n - 1].kind === "conclusion";
  // Chỉ dựng trạm hiện tại và trạm vừa rời (để camera rời đi không thấy trạm biến mất đột ngột).
  const last = useRef(n), prev = useRef(n);
  if (last.current !== n) { prev.current = last.current; last.current = n; }
  // dựng sẵn cả trạm kế tiếp để texture được tạo trước khi camera bay tới (bớt giật lúc chuyển trang)
  const mounted = (k: number) => overview || k === n || k === n + 1 || k === prev.current;
  return <>
    <color attach="background" args={[HEX.night]} />
    <Atmosphere n={n} overview={overview} />
    <Desk />
    <Thread n={n} />
    {TITLES.map((_, i) => <Plate key={i} i={i} overview={overview} hot={conclusion && (PROOF[step] ?? []).includes(i + 1)} />)}
    {Array.from({ length: TOTAL }, (_, i) => i + 1).filter(mounted).map(k => (
      // trạm kế tiếp chỉ dựng sẵn (tạo texture trước), ẩn đi để không lọt vào khung hình
      <group key={k} position={stationPos(k).toArray()} visible={overview || k === n || k === prev.current}><Station k={k} n={n} step={step} /></group>
    ))}
    <Proofs n={n} step={step} />
    <Recap n={n} step={step} />
    <Dust n={n} />
    <Rig n={n} step={step} />
  </>;
}

export default function World({ n, step }: WP) {
  return (
    <Canvas resize={{ scroll: false, offsetSize: true }} shadows dpr={[1, 1.25]} camera={{ fov: 40, near: 0.1, far: 600, position: [0, 10, 10] }} gl={{ antialias: true, powerPreference: "high-performance" }}>
      <Scene n={n} step={step} />
    </Canvas>
  );
}
