"use client";
// "Bên trong hồ sơ": một canvas duy nhất cho cả 14 trang. Mỗi trang là một tờ giấy trải trong bìa hồ sơ,
// sơ đồ dựng đứng lên khỏi tờ giấy như sách pop-up, sợi chỉ đỏ nối tờ trước với tờ sau.
import { PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, N8AO, SMAA } from "@react-three/postprocessing";
import gsap from "gsap";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { SLIDES, stepsOf } from "@/content/slides";
import { damp } from "../three/kit";
import { C, INK, LiveCtx, SNAP, ShakeCtx, Swarm, hdr, rng, sdt, useCanvasTex } from "./fx";
import { CENTER, TOTAL, anchorOf, shotFor, stationPos } from "./layout";
import { ArtBaker, BakeCtx } from "./pop";
import { ClosingStation, CoverStation, TeamStation } from "./stations/Intro";
import { ConceptStation, FeaturesStation, FormsStation, TypesStation } from "./stations/Theory";
import { MethodStation } from "./stations/Methods";
import { SolutionsStation } from "./stations/Solutions";
import { TocStation } from "./stations/Toc";

type WP = { n: number; step: number };

/** memo: đổi bước ở trạm này không làm các trạm khác render lại. */
const Station = memo(function Station({ k, step }: { k: number; step: number }) {
  const s = SLIDES[k - 1];
  switch (s.kind) {
    case "cover": return <CoverStation />;
    case "team": return <TeamStation step={step} />;
    case "toc": return <TocStation />;
    case "concept": return <ConceptStation step={step} />;
    case "features": return <FeaturesStation step={step} />;
    case "types": return <TypesStation step={step} />;
    case "forms": return <FormsStation step={step} />;
    case "method": return <MethodStation m={s.m} step={step} />;
    case "solutions": return <SolutionsStation step={step} />;
    case "closing": return <ClosingStation />;
    default: return null;
  }
});

/* ---------- camera: mỗi lần đổi góc máy là một cú máy GSAP ---------- */
// Hai kiểu cú máy:
// · "cut" (sang trang khác): màn giấy mờ dần che khung hình, camera đặt thẳng vào trang mới trong lúc bị che,
//   rồi màn giấy tan ra và camera đẩy vào nhẹ để ổn định. Không bay qua mặt bàn nên không gây chóng mặt.
// · "arc" (đổi nhịp trong cùng trang): bay ngắn theo đường cong Bézier, vồng lên rất ít.
// Khi cảnh mới bắt đầu hiện ra, báo `onArrive` để các thẻ của trạm mới bật dựng đúng lúc người xem nhìn thấy.
type Flight =
  | { kind: "arc"; pos: THREE.Vector3; ctrl: THREE.Vector3; look: THREE.Vector3; fov: number; shift: number }
  | { kind: "cut"; pos: THREE.Vector3; look: THREE.Vector3; fov: number; shift: number; from: THREE.Vector3 };
const VEIL_IN = 0.28, VEIL_OUT = 0.62; // tiến độ cú máy: che kín ở VEIL_IN, tan hết ở VEIL_OUT
function Rig({ n, step, onArrive, shake, veil }: WP & { onArrive: (n: number) => void; shake: React.MutableRefObject<number>; veil: React.RefObject<HTMLDivElement | null> }) {
  const { camera, size } = useThree();
  const shot = shotFor(n, step), off = shot.abs ? [0, 0, 0] : stationPos(n).toArray();
  const key = [...shot.pos.map((v, i) => v + off[i]), ...shot.look.map((v, i) => v + off[i]), shot.fov ?? 40, shot.shift ?? 0.17].join(",");
  const target = useMemo(() => {
    const k = key.split(",").map(Number);
    return { pos: new THREE.Vector3(k[0], k[1], k[2]), look: new THREE.Vector3(k[3], k[4], k[5]), fov: k[6], shift: k[7] };
  }, [key]);
  const st = useRef<{ base: THREE.Vector3; look: THREE.Vector3; fov: number; shift: number; t: number; px: number; py: number } | null>(null);
  const prog = useRef({ v: 1 }), flight = useRef<Flight | null>(null), tween = useRef<gsap.core.Tween | null>(null), arrive = useRef<number | null>(null);
  const lastN = useRef(n);

  useEffect(() => { arrive.current = n; }, [n]);
  useEffect(() => {
    const c = st.current; if (!c) return; // khung hình đầu: đặt thẳng camera vào chỗ
    const from = lastN.current; lastN.current = n;
    const busy = !!tween.current?.isActive();
    tween.current?.kill(); prog.current.v = 0;
    let duration: number, ease: string;
    if (n !== from) {
      // điểm bắt đầu đẩy máy: lùi ra sau và cao hơn góc máy đích một chút
      const back = target.pos.clone().sub(target.look).normalize().multiplyScalar(2.2).add(new THREE.Vector3(0, 0.5, 0)).add(target.pos);
      flight.current = { kind: "cut", pos: c.base.clone(), look: c.look.clone(), fov: c.fov, shift: c.shift, from: back };
      duration = 1.5; ease = "none";
    } else {
      const pos = c.base.clone(), dist = pos.distanceTo(target.pos);
      const ctrl = pos.clone().lerp(target.pos, 0.5); ctrl.y += Math.min(dist * 0.15, 2.5);
      flight.current = { kind: "arc", pos, ctrl, look: c.look.clone(), fov: c.fov, shift: c.shift };
      // đang bay dở mà đổi đích: rẽ ngay (không tăng tốc lại từ 0)
      duration = Math.min(1.8, Math.max(0.9, 0.9 + dist * 0.04)); ease = busy ? "power2.out" : "sine.inOut";
    }
    tween.current = gsap.to(prog.current, { v: 1, duration, ease });
    if (SNAP) tween.current.progress(1);
  }, [target]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { tween.current?.kill(); }, []);

  useFrame(({ pointer }, rawDt) => {
    const dt = sdt(rawDt), cam = camera as THREE.PerspectiveCamera;
    if (!st.current) st.current = { base: target.pos.clone(), look: target.look.clone(), fov: target.fov, shift: target.shift, t: 0, px: 0, py: 0 };
    const c = st.current, f = flight.current, v = prog.current.v; c.t += dt;
    const L = THREE.MathUtils.lerp;
    let veilA = 0;
    if (f?.kind === "arc") {
      const a = 1 - v;
      c.base.set(0, 0, 0).addScaledVector(f.pos, a * a).addScaledVector(f.ctrl, 2 * a * v).addScaledVector(target.pos, v * v);
      c.look.lerpVectors(f.look, target.look, Math.min(1, v * 1.12));
      c.fov = L(f.fov, target.fov, v); c.shift = L(f.shift, target.shift, v);
    } else if (f?.kind === "cut") {
      if (v < VEIL_IN) { // màn giấy che dần, camera đứng yên ở trang cũ
        const u = v / VEIL_IN; veilA = u * u * (3 - 2 * u);
        c.base.copy(f.pos); c.look.copy(f.look); c.fov = f.fov; c.shift = f.shift;
      } else { // đã ở trang mới: màn giấy tan, camera đẩy vào nhẹ rồi dừng hẳn
        const u = (v - VEIL_IN) / (1 - VEIL_IN), e = 1 - Math.pow(1 - u, 3);
        veilA = 1 - Math.min(1, (v - VEIL_IN) / (VEIL_OUT - VEIL_IN)); veilA = veilA * veilA * (3 - 2 * veilA);
        c.base.lerpVectors(f.from, target.pos, e); c.look.copy(target.look); c.fov = target.fov; c.shift = target.shift;
      }
    }
    if (veil.current) veil.current.style.opacity = veilA > 0.001 ? veilA.toFixed(3) : "0";
    if (arrive.current !== null && v >= (f?.kind === "cut" ? VEIL_IN + 0.05 : 0.72)) { onArrive(arrive.current); arrive.current = null; }
    // rung nhẹ theo chuột và "thở" chậm, cộng sau cú máy
    c.px = damp(c.px, pointer.x, 2, dt); c.py = damp(c.py, pointer.y, 2, dt);
    cam.position.copy(c.base); cam.position.x += c.px * 0.4 + Math.sin(c.t * 0.21) * 0.15; cam.position.y += c.py * 0.25;
    // rung khi có va chạm / con dấu đập xuống: dao động nhanh, tắt dần
    const sh = shake.current; shake.current = sh * Math.exp(-dt * 9);
    if (sh > 0.002) { cam.position.x += Math.sin(c.t * 61) * sh; cam.position.y += Math.sin(c.t * 47 + 1) * sh * 0.8; }
    cam.fov = c.fov; cam.setViewOffset(size.width, size.height, -c.shift * size.width, 0, size.width, size.height); cam.updateProjectionMatrix();
    cam.lookAt(c.look);
  });
  return null;
}

/* ---------- bìa hồ sơ và các tờ giấy ---------- */
const SHEET_W = 30, SHEET_D = 20, SHEET_Y = -1.55;
function sheetDraw(k: number) {
  return (g: CanvasRenderingContext2D, W: number, H: number) => {
    const R = rng(100 + k), u = W / SHEET_W;
    g.fillStyle = "#f6f1e6"; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(90,70,40,${R() * 0.05})`; g.fillRect(R() * W, R() * H, 2, 2); } // hạt giấy
    g.strokeStyle = "rgba(60,80,100,.08)"; g.lineWidth = 1.5; // giấy kẻ ô mờ
    for (let x = 2 * u; x < W - u; x += u) { g.beginPath(); g.moveTo(x, 1.6 * u); g.lineTo(x, H - u); g.stroke(); }
    for (let y = 1.6 * u; y < H - u; y += u) { g.beginPath(); g.moveTo(2 * u, y); g.lineTo(W - u, y); g.stroke(); }
    g.strokeStyle = "rgba(176,38,31,.55)"; g.lineWidth = 3; g.beginPath(); g.moveTo(2 * u, 0); g.lineTo(2 * u, H); g.stroke(); // lề đỏ
    g.fillStyle = "rgba(0,0,0,.12)"; [0.25, 0.5, 0.75].forEach(f => { g.beginPath(); g.arc(0.9 * u, H * f, 0.28 * u, 0, Math.PI * 2); g.fill(); }); // lỗ bấm
  };
}
function Sheet({ k }: { k: number }) {
  const tex = useCanvasTex(2400, 1600, sheetDraw(k), [k]);
  const p = stationPos(k), rot = (rng(k * 7)() - 0.5) * 0.03;
  return <mesh rotation={[-Math.PI / 2, 0, rot]} position={[p.x, SHEET_Y, p.z + 0.5]}><planeGeometry args={[SHEET_W, SHEET_D]} /><meshBasicMaterial map={tex} /></mesh>;
}
function Folder() {
  const tex = useCanvasTex(1024, 1024, (g, W, H) => {
    const R = rng(5); g.fillStyle = "#d9c7a0"; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 26000; i++) { g.fillStyle = `rgba(${R() < 0.5 ? "120,90,50" : "255,250,235"},${R() * 0.08})`; g.fillRect(R() * W, R() * H, 2, 2); }
  }, []);
  useEffect(() => { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(14, 10); tex.needsUpdate = true; }, [tex]);
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[CENTER.x, SHEET_Y - 0.03, CENTER.z]}><planeGeometry args={[260, 190]} /><meshBasicMaterial map={tex} /></mesh>;
}
/** Đèn bàn: chỉ để đổ bóng mềm của sơ đồ xuống tờ giấy. */
function Lamp({ n }: { n: number }) {
  const light = useRef<THREE.DirectionalLight>(null!), recv = useRef<THREE.Mesh>(null!);
  const { scene } = useThree();
  useEffect(() => { scene.add(light.current.target); }, [scene]);
  useFrame((_, dt) => {
    const p = stationPos(n), t = light.current.target.position;
    t.set(damp(t.x, p.x, 3, sdt(dt)), 0, damp(t.z, p.z, 3, sdt(dt)));
    light.current.position.set(t.x - 6, 22, t.z + 9); recv.current.position.set(t.x, SHEET_Y + 0.01, t.z + 0.5);
  });
  return <>
    <directionalLight ref={light} intensity={1} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-17} shadow-camera-right={17} shadow-camera-top={13} shadow-camera-bottom={-13} shadow-camera-near={2} shadow-camera-far={50} shadow-radius={6} shadow-bias={-0.0005} />
    <mesh ref={recv} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[SHEET_W, SHEET_D]} /><shadowMaterial transparent opacity={0.1} /></mesh>
  </>;
}

/* ---------- chỉ đỏ nối các tờ ---------- */
function fiberCurve(a: number) {
  const A = anchorOf(a), B = anchorOf(a + 1), pts = [A];
  if (Math.abs(A.z - B.z) > 1) { const side = A.x < 1 ? A.x - 19 : A.x + 19; pts.push(new THREE.Vector3(side, -1.5, A.z), new THREE.Vector3(side, -1.5, B.z)); }
  else pts.push(A.clone().lerp(B, 0.5).add(new THREE.Vector3(0, 0.05, 0.8)));
  pts.push(B);
  return new THREE.CatmullRomCurve3(pts, false, "centripetal");
}
const FIBER_FS = `varying vec2 vUv; uniform float uProg; uniform vec3 uCol;
void main(){
  if (vUv.x > uProg) discard;
  gl_FragColor = vec4(uCol, 1.);
  #include <colorspace_fragment>
}`;
function Fibers({ n }: { n: number }) {
  const items = useMemo(() => Array.from({ length: TOTAL - 1 }, (_, j) => {
    const geo = new THREE.TubeGeometry(fiberCurve(j + 1), 160, 0.045, 6, false);
    const mat = new THREE.ShaderMaterial({
      uniforms: { uProg: { value: 1.001 }, uCol: { value: hdr(C.red, 1) } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
      fragmentShader: FIBER_FS, transparent: true, blending: INK, depthWrite: false,
    });
    return { geo, mat };
  }), []);
  useEffect(() => () => items.forEach(i => { i.geo.dispose(); i.mat.dispose(); }), [items]);
  const pins = useMemo(() => ({ cur: hdr(C.red, 1.2), past: hdr(C.red, 0.8), future: hdr(C.grey, 0.5) }), []);
  return <group>
    {items.map((it, j) => <mesh key={j} geometry={it.geo} material={it.mat} frustumCulled={false} />)}
    <Swarm count={TOTAL} size={0.2} update={(i, o) => { o.p.copy(anchorOf(i + 1)); o.c.copy(i + 1 === n ? pins.cur : i + 1 < n ? pins.past : pins.future); }} />
  </group>;
}

/* ---------- hậu kỳ: bóng tiếp xúc, khử răng cưa ---------- */
// Bộ đệm 8 bit (sRGB) để hòa trộn trừ của nét mực cho ra đúng màu như khi vẽ thẳng ra màn hình.
function Post({ enabled, hq }: { enabled: boolean; hq: boolean }) {
  return (
    <EffectComposer key={hq ? "hq" : "lq"} enabled={enabled} multisampling={0} frameBufferType={THREE.UnsignedByteType}>
      {hq ? <N8AO halfRes aoRadius={1.1} distanceFalloff={0.6} intensity={1.6} color="#4a3a24" /> : <></>}
      <SMAA />
    </EffectComposer>
  );
}

function Scene({ n, step, veil }: WP & { veil: React.RefObject<HTMLDivElement | null> }) {
  // Chỉ dựng trạm đang xem, trạm vừa rời và dựng sẵn (ẩn) trạm kế tiếp. Texture vẽ dần qua ArtBaker, mỗi khung hình
  // chỉ tiêu vài ms, nên không bao giờ phải tạo hàng trăm texture cùng lúc.
  const last = useRef(n), prev = useRef(n);
  if (last.current !== n) { prev.current = last.current; last.current = n; }
  const [ready, setReady] = useState(n);
  const [hq, setHq] = useState(true);
  const mounted = (k: number) => k === n || k === n + 1 || k === prev.current;
  const stepOf = (k: number) => (k === n ? step : k < n ? stepsOf(SLIDES[k - 1]) : -1);
  // trạm mới chỉ "sống" (bật thẻ) khi camera đã gần tới; trạm vừa rời giữ nguyên cho tới khi khuất
  const live = (k: number) => (k === n ? ready === n : k === prev.current);
  const shakeAmt = useRef(0);
  const shake = useCallback((s: number) => { if (!SNAP) shakeAmt.current = Math.max(shakeAmt.current, s); }, []);
  return <ShakeCtx.Provider value={shake}>
    <color attach="background" args={[C.bg]} />
    {/* ánh sáng chỉ tác động lên đồ vật 3D (con dấu, ghim, kính lúp); thẻ giấy và nét mực không dùng ánh sáng */}
    <hemisphereLight args={["#fff6e6", "#b8a684", 1.3]} />
    <PerformanceMonitor onDecline={() => setHq(false)} onIncline={() => setHq(true)} flipflops={3} onFallback={() => setHq(false)} />
    <Folder />
    {Array.from({ length: TOTAL }, (_, i) => <Sheet key={i} k={i + 1} />)}
    <Lamp n={n} />
    <Fibers n={n} />
    <ArtBaker />
    {Array.from({ length: TOTAL }, (_, i) => i + 1).filter(mounted).map(k => (
      <group key={k} position={stationPos(k).toArray()} visible={k === n || k === prev.current}>
        <BakeCtx.Provider value={k === n + 1 && k !== prev.current ? "bg" : "now"}>
          <LiveCtx.Provider value={live(k)}><Station k={k} step={stepOf(k)} /></LiveCtx.Provider>
        </BakeCtx.Provider>
      </group>
    ))}
    <Rig n={n} step={step} onArrive={setReady} shake={shakeAmt} veil={veil} />
    <Post enabled={!SNAP} hq={hq} />
  </ShakeCtx.Provider>;
}

export default function World({ n, step }: WP) {
  // màn giấy dùng cho chuyển cảnh giữa các trang (độ mờ do camera điều khiển từng khung hình)
  const veil = useRef<HTMLDivElement>(null);
  return <>
    <Canvas flat shadows="soft" resize={{ scroll: false, offsetSize: true }} dpr={[1, 1.5]} camera={{ fov: 40, near: 0.1, far: 900, position: [0, 10, 10] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}>
      <Scene n={n} step={step} veil={veil} />
    </Canvas>
    <div ref={veil} className="veil" aria-hidden />
  </>;
}
