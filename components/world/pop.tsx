"use client";
// Cơ chế "sách pop-up": tấm bìa cắt rời dựng đứng lên khỏi trang hồ sơ, đường chỉ mực vẽ dần trên trang.
// Chuyển động được "nói rõ" bằng ngôn ngữ bút mực: thẻ đổi chỗ thì để lại vệt chì nét đứt, mũi tên có chấm mực chạy theo hướng,
// vật quan trọng được khoanh bút đỏ, phần không liên quan nhạt đi như bị tẩy.
import { Billboard, Line } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Line2 } from "three-stdlib";
import { useFontsReady } from "../three/kit";
import { LITE, SNAP, clamp01, sdt, useLive } from "./fx";
import { P } from "./art";

export const PAGE_Y = -1.55;
export type Draw = (g: CanvasRenderingContext2D, W: number, H: number) => void;
type At = [number, number] | [number, number, number];
const PX = 260; // điểm ảnh trên một đơn vị
const UP = new THREE.Vector3(0, 1, 0);

/* ---------------- texture bìa cắt rời ---------------- */
// Vẽ một tấm bìa tốn vài ms (3 canvas, 20 lần vẽ chồng để làm viền giấy). Cả trăm tấm vẽ trong một khung hình là đứng hình,
// nên mọi tấm đều xếp vào hàng đợi và được `ArtBaker` vẽ dần, mỗi khung hình chỉ tiêu ~6 ms, xong tấm nào tải lên GPU ngay tấm đó.
/** Mức ưu tiên vẽ: "now" cho trạm đang / sắp xem, "bg" cho phần làm sẵn. */
export const BakeCtx = createContext<"now" | "bg">("now");
/** Độ phân giải texture (1 = đầy đủ). Trạm chỉ thấy từ xa dùng mức thấp. */
export const ArtResCtx = createContext(LITE ? 0.6 : 1);
const MAX_PX = LITE ? 900 : 1500, ANISO = LITE ? 2 : 8;
type Entry = { tex: THREE.Texture | null; users: number; job: (() => THREE.Texture) | null; prio: 0 | 1; wake: Set<() => void> };
const cache = new Map<string, Entry>();
const queue: [string[], string[]] = [[], []];
const BUDGET_MS = 6;
function enqueue(e: Entry, key: string, prio: 0 | 1) { if (e.tex || !e.job) return; if (prio < e.prio || !queue[prio].includes(key)) { e.prio = Math.min(e.prio, prio) as 0 | 1; queue[prio].push(key); } }
function release(key: string) {
  const e = cache.get(key); if (!e || --e.users > 0) return;
  e.tex?.dispose(); e.job = null; e.wake.clear(); cache.delete(key);
  // trả bộ nhớ canvas sau một nhịp, khi chắc chắn không còn khung hình nào vẽ bằng texture cũ
  const c = e.tex?.image as HTMLCanvasElement | undefined; if (c) setTimeout(() => { c.width = 0; c.height = 0; }, 2000);
}
/** Vẽ dần hàng đợi texture, trong giới hạn thời gian mỗi khung hình. Đặt một lần trong cảnh. */
export function ArtBaker() {
  const gl = useThree(s => s.gl);
  useFrame(() => {
    const t0 = performance.now();
    for (;;) {
      const key = queue[0].shift() ?? queue[1].shift(); if (key === undefined) break;
      const e = cache.get(key); if (!e || e.tex || !e.job) continue;
      e.tex = e.job(); e.job = null; gl.initTexture(e.tex);
      e.wake.forEach(f => f()); e.wake.clear();
      if (!SNAP && performance.now() - t0 > BUDGET_MS) break;
    }
  });
  return null;
}
function dieCut(draw: Draw, w: number, h: number, res = 1, plain = false) {
  const k = Math.min(1, MAX_PX / (Math.max(w, h) * PX)) * res, W = Math.max(2, Math.round(w * PX * k)), H = Math.max(2, Math.round(h * PX * k)), pad = Math.max(2, Math.round(14 * k + 4 * res));
  const A = document.createElement("canvas"); A.width = W; A.height = H;
  const ga = A.getContext("2d")!; ga.save(); ga.scale(k, k); draw(ga, W / k, H / k); ga.restore();
  if (plain) { const t = new THREE.CanvasTexture(A); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO; return t; } // mực in thẳng lên giấy, không viền

  // bóng trắng của hình, để làm viền giấy cắt
  const S = document.createElement("canvas"); S.width = W; S.height = H; const gs = S.getContext("2d")!;
  gs.drawImage(A, 0, 0); gs.globalCompositeOperation = "source-in"; gs.fillStyle = P.paper; gs.fillRect(0, 0, W, H);
  const F = document.createElement("canvas"); F.width = W; F.height = H; const gf = F.getContext("2d")!;
  for (let i = 0; i < 20; i++) { const a = (i / 20) * Math.PI * 2; gf.drawImage(S, Math.cos(a) * pad, Math.sin(a) * pad); }
  gf.globalCompositeOperation = "source-atop"; gf.fillStyle = "rgba(120,100,70,.10)"; gf.fillRect(0, H * 0.92, W, H); // mép giấy hơi sẫm ở chân
  gf.globalCompositeOperation = "source-over"; gf.drawImage(A, 0, 0);
  A.width = A.height = S.width = S.height = 0; // trả bộ nhớ của canvas trung gian ngay (Safari iOS giới hạn tổng bộ nhớ canvas)
  const t = new THREE.CanvasTexture(F); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = ANISO; return t;
}
/**
 * Texture của một hình minh họa, dùng chung theo `id`. Trả về `null` tới khi vẽ xong.
 * Khi đổi độ phân giải, texture cũ vẫn được giữ và hiển thị cho tới khi bản mới sẵn sàng. `draw = null` thì không vẽ gì.
 */
export function useArt(id: string, w: number, h: number, draw: Draw | null, plain = false) {
  const f = useFontsReady(), res = useContext(ArtResCtx), prio: 0 | 1 = useContext(BakeCtx) === "now" ? 0 : 1;
  const key = draw ? `${id}|${w}|${h}|${f}|${res}${plain ? "|plain" : ""}` : "";
  const drawRef = useRef(draw); drawRef.current = draw;
  const [tex, setTex] = useState<THREE.Texture | null>(() => (key && cache.get(key)?.tex) || null);
  const held = useRef<string[]>([]); // các key cũ đang giữ, trả lại khi bản mới đã hiện
  useEffect(() => {
    if (!key) return;
    // phần làm sẵn chờ phông chữ nạp xong rồi mới vẽ, khỏi phải vẽ hai lần
    if (prio === 1 && f === 0) return;
    let e = cache.get(key);
    if (!e) { e = { tex: null, users: 0, job: () => dieCut(drawRef.current!, w, h, res, plain), prio, wake: new Set() }; cache.set(key, e); }
    e.users++;
    const ent = e;
    const take = () => { setTex(ent.tex); held.current.forEach(release); held.current = []; };
    if (ent.tex) take(); else { ent.wake.add(take); enqueue(ent, key, prio); }
    return () => { ent.wake.delete(take); held.current.push(key); };
  }, [key, prio === 1 && f === 0]); // eslint-disable-line react-hooks/exhaustive-deps
  // trạm đổi từ "làm sẵn" sang "đang xem": đẩy lên đầu hàng
  useEffect(() => { const e = key ? cache.get(key) : undefined; if (e && prio === 0) enqueue(e, key, 0); }, [key, prio]);
  useEffect(() => () => { held.current.forEach(release); held.current = []; }, []);
  return draw ? tex : null;
}

const backOut = (x: number) => { const c = 1.5; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const inOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const outCubic = (x: number) => 1 - Math.pow(1 - x, 3);

/* ---------------- vật liệu thẻ: có thể "tẩy nhạt" về màu giấy ---------------- */
const PAPER_LIN = new THREE.Color(P.paper);
function cardMat(map: THREE.Texture | null, side: THREE.Side, fade: { value: number }) {
  const m = new THREE.MeshBasicMaterial({ map, alphaTest: 0.5, side });
  m.onBeforeCompile = sh => {
    sh.uniforms.uFade = fade; sh.uniforms.uPaper = { value: PAPER_LIN };
    sh.fragmentShader = "uniform float uFade; uniform vec3 uPaper;\n" + sh.fragmentShader.replace(
      "#include <opaque_fragment>", "outgoingLight = mix(outgoingLight, uPaper, uFade);\n#include <opaque_fragment>");
  };
  m.customProgramCacheKey = () => "card-fade";
  return m;
}

type Move = { from: THREE.Vector3; to: THREE.Vector3; t: number; dur: number; wait: number; k: number };

type CardProps = {
  id: string; w: number; h: number; draw: Draw;
  /** vị trí chân tấm bìa trên trang: x, z (và độ nhấc lên y nếu có) */
  at: At;
  on?: boolean; delay?: number; rotY?: number;
  /** nằm phẳng trên trang thay vì dựng đứng */
  flat?: boolean;
  /** mặt sau: lật tấm bìa để lộ hình khác */
  back?: { id: string; draw: Draw }; flipped?: boolean;
  /** tốc độ di chuyển khi `at` thay đổi (lớn hơn là nhanh hơn) */
  speed?: number;
  /** nhạt đi (không thuộc nhịp đang nói tới) */
  dim?: boolean;
  /** khoanh bút quanh chân thẻ; chuỗi là màu bút */
  ring?: boolean | string;
  /** để lại vệt nét đứt khi đổi chỗ (mặc định bật) */
  trail?: boolean;
  /** rung lắc như bị va chạm, `joltDelay` giây sau khi `jolt` chuyển sang true */
  jolt?: boolean; joltDelay?: number;
};
/** Tấm bìa minh họa: gập phẳng khi chưa tới nhịp, bật dựng lên (hơi nảy) khi `on`. Đổi `at` thì bay theo cung tới chỗ mới. */
export function Card({ id, w, h, draw, at, on: onProp = true, delay = 0, rotY = 0, flat = false, back, flipped = false, speed = 2.6, dim = false, ring, trail = true, jolt = false, joltDelay = 0 }: CardProps) {
  const front = useArt(id, w, h, draw);
  const backTex = useArt(back?.id ?? "", w, h, back?.draw ?? null);
  const ready = !!front && (!back || !!backTex);
  const live = useLive(), on = onProp && live && ready;
  const fade = useMemo(() => ({ value: 0 }), []);
  const mats = useMemo(() => ({ front: cardMat(null, back ? THREE.FrontSide : THREE.DoubleSide, fade), back: cardMat(null, THREE.FrontSide, fade) }), [!!back, fade]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { mats.front.dispose(); mats.back.dispose(); }, [mats]);
  useEffect(() => { mats.front.map = front; mats.front.needsUpdate = true; }, [mats, front]);
  useEffect(() => { mats.back.map = backTex; mats.back.needsUpdate = true; }, [mats, backTex]);

  const outer = useRef<THREE.Group>(null!), lean = useRef<THREE.Group>(null!), hinge = useRef<THREE.Group>(null!), flip = useRef<THREE.Group>(null!);
  const st = useRef({ p: 0, wait: 0, f: flipped ? 1 : 0, init: false, base: new THREE.Vector3(), mv: null as Move | null, jt: -1 });
  const [trailMv, setTrailMv] = useState<{ key: number; mv: Move } | null>(null);
  // Lệch z rất nhỏ theo id: hai thẻ cùng mặt phẳng chồng lên nhau sẽ không tranh độ sâu (nháy).
  const nudge = useMemo(() => { let x = 0; for (const c of id) x = (x * 31 + c.charCodeAt(0)) >>> 0; return (x % 97) / 97 * 0.04; }, [id]);
  const target = useMemo(() => new THREE.Vector3(at[0], PAGE_Y + (at[2] ?? 0), at[1] + nudge), [at[0], at[1], at[2], nudge]); // eslint-disable-line react-hooks/exhaustive-deps

  // Đổi chỗ: lên lịch một chuyến bay có thời lượng, bắt đầu sau `delay` (để các thẻ đi so le).
  useEffect(() => {
    const s = st.current; if (!s.init) return;
    const from = s.base.clone(), d0 = from.distanceTo(target);
    if (d0 < 0.02) return;
    const dur = Math.min(2.2, Math.max(0.55, (0.5 + d0 * 0.1) * (2.4 / speed)));
    s.mv = { from, to: target.clone(), t: 0, dur, wait: s.mv ? 0 : delay * 0.8, k: 0 };
    if (trail && on && d0 > 0.6) setTrailMv({ key: Date.now(), mv: s.mv });
  }, [target]); // eslint-disable-line react-hooks/exhaustive-deps

  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, rawDt) => {
    const dt = sdt(rawDt), s = st.current;
    if (!s.init) { s.base.copy(target); s.init = true; }
    s.wait = on ? s.wait + dt : 0;
    const goal = on && s.wait >= delay ? 1 : 0;
    s.p = goal ? Math.min(1, s.p + dt * 1.9) : Math.max(0, s.p - dt * 3);
    s.f = THREE.MathUtils.damp(s.f, flipped ? 1 : 0, 4, dt);
    fade.value = THREE.MathUtils.damp(fade.value, dim ? 0.62 : 0, 3.5, dt);

    // di chuyển theo cung: nhấc lên giữa đường, nghiêng về hướng đi
    let lift = 0, lx = 0, lz = 0;
    const m = s.mv;
    if (m) {
      if (m.wait > 0) m.wait -= dt;
      else {
        m.t += dt; m.k = clamp01(m.t / m.dur);
        s.base.lerpVectors(m.from, m.to, inOut(m.k));
        const d0 = m.from.distanceTo(m.to), arc = Math.sin(Math.PI * m.k);
        lift = arc * Math.min(1.1, 0.32 * Math.sqrt(d0));
        tmp.subVectors(m.to, m.from).setY(0).normalize().applyAxisAngle(UP, -rotY);
        lx = tmp.x * arc * 0.2; lz = tmp.z * arc * 0.2;
        if (m.k >= 1) { s.base.copy(m.to); s.mv = null; }
      }
    }
    // va chạm: lắc qua lại, tắt dần
    s.jt = jolt && on ? (s.jt < 0 ? 0 : s.jt + dt) : -1;
    const jt = s.jt - joltDelay, wob = jt > 0 && jt < 1.2 ? Math.sin(jt * 34) * Math.exp(-jt * 5.5) : 0;
    outer.current.position.copy(s.base); outer.current.position.y += lift;
    lean.current.rotation.set(flat ? 0 : lz - Math.abs(wob) * 0.12, 0, flat ? 0 : -lx + wob * 0.1);
    outer.current.visible = s.p > 0.002;
    if (flat) { hinge.current.rotation.x = -Math.PI / 2; const k = backOut(s.p); hinge.current.scale.setScalar(Math.max(0.001, k)); }
    else hinge.current.rotation.x = -Math.PI / 2 * (1 - backOut(s.p));
    // lật mặt: nhấc lên, phóng nhẹ, xoay — khoảnh khắc "biến chất" dễ thấy
    const pop = Math.sin(Math.PI * clamp01(s.f));
    flip.current.rotation.y = s.f * Math.PI;
    flip.current.position.y = flat ? 0 : h / 2 + pop * 0.45;
    flip.current.scale.setScalar(1 + pop * 0.08);
  });

  const ringColor = typeof ring === "string" ? ring : P.red;
  const rx = flat ? w / 2 + 0.3 : w / 2 + 0.35, rz = flat ? h / 2 + 0.3 : 0.5 + w * 0.08;
  return <>
    <group ref={outer} rotation={[0, rotY, 0]}>
      <group ref={lean}>
        <group ref={hinge}>
          <group ref={flip} position={[0, flat ? 0 : h / 2, flat ? 0.01 : 0]}>
            <mesh castShadow={!flat} material={mats.front}><planeGeometry args={[w, h]} /></mesh>
            {back && <mesh rotation={[0, Math.PI, 0]} castShadow material={mats.back}><planeGeometry args={[w, h]} /></mesh>}
          </group>
        </group>
      </group>
    </group>
    {trailMv && <MotionTrail key={trailMv.key} mv={trailMv.mv} />}
    {ring !== undefined && <PenCircle at={[target.x, target.z, target.y - PAGE_Y]} rx={rx} rz={rz} rotY={rotY} on={on && !!ring} delay={delay + 0.55} color={ringColor} seed={nudge * 100} />}
  </>;
}

/* ---------------- vệt chì khi thẻ đổi chỗ ---------------- */
const TRAIL_N = 40;
function MotionTrail({ mv }: { mv: Move }) {
  const pts = useMemo(() => {
    const a = mv.from, b = mv.to, d = a.distanceTo(b);
    const side = new THREE.Vector3(b.z - a.z, 0, a.x - b.x).normalize().multiplyScalar(d * 0.12);
    const c = a.clone().lerp(b, 0.5).add(side);
    const q = new THREE.QuadraticBezierCurve3(a.clone().setY(PAGE_Y + 0.03), c.setY(PAGE_Y + 0.03), b.clone().setY(PAGE_Y + 0.03));
    return q.getPoints(TRAIL_N - 1);
  }, [mv]);
  const origin = useMemo(() => circlePts(0.2, 0.14, 28).map(p => p.add(mv.from).setY(PAGE_Y + 0.03)), [mv]);
  const line = useRef<Line2>(null!), dot = useRef<Line2>(null!), age = useRef(0);
  useFrame((_, rawDt) => {
    const dt = sdt(rawDt), k = mv.k;
    if (k >= 1) age.current += dt;
    const op = 1 - clamp01((age.current - 1.2) / 0.9);
    const g = line.current.geometry as THREE.InstancedBufferGeometry;
    g.instanceCount = Math.max(0, Math.floor(inOut(k) * (TRAIL_N - 1)));
    for (const l of [line.current, dot.current]) { l.visible = op > 0.01 && k > 0; (l.material as THREE.Material).opacity = op * 0.85; }
  });
  return <>
    <Line ref={line} points={pts} color={P.ink2} lineWidth={0.035} worldUnits dashed dashSize={0.16} gapSize={0.11} transparent opacity={0} />
    <Line ref={dot} points={origin} color={P.ink2} lineWidth={0.03} worldUnits dashed dashSize={0.08} gapSize={0.07} transparent opacity={0} />
  </>;
}
const circlePts = (rx: number, rz: number, n: number) => Array.from({ length: n + 1 }, (_, i) => { const a = (i / n) * Math.PI * 2; return new THREE.Vector3(Math.cos(a) * rx, 0, Math.sin(a) * rz); });

/* ---------------- bút khoanh tròn ---------------- */
const PEN_N = 160;
// Nét bút dạ: mép mềm, vệt khô chạy dọc nét (đầu bút hết mực), hạt mực li ti, đầu nét đậm hơn chỗ nhấc bút.
const PEN_FS = `varying vec2 vUv; uniform float uProg; uniform vec3 uCol; uniform float uSeed;
float h1(float x){ return fract(sin(x * 127.1 + uSeed) * 43758.5453); }
float n1(float x){ float i = floor(x), f = fract(x); return mix(h1(i), h1(i + 1.), f * f * (3. - 2. * f)); }
void main(){
  if (vUv.x > uProg) discard;
  float edge = smoothstep(0., .2, vUv.y) * smoothstep(1., .8, vUv.y);
  float dry = .62 + .38 * n1(vUv.y * 11. + vUv.x * 2.3);                         // vệt khô dọc theo nét
  float lift = 1. - .45 * smoothstep(.8, 1., vUv.x);                            // cuối nét nhấc bút, mực nhạt dần
  float grain = .88 + .12 * n1(vUv.x * 260. + vUv.y * 5.);
  float a = edge * mix(dry, 1., .35) * lift * grain;
  if (a < .04) discard;
  gl_FragColor = vec4(uCol, a * .95);
  #include <colorspace_fragment>
}`;
type PenProps = { at: At; rx: number; rz: number; on?: boolean; delay?: number; color?: string; width?: number; rotY?: number; seed?: number };
/**
 * Vòng khoanh tay bằng bút dạ, vẽ dần trên trang: hơi méo, vẽ quá điểm đầu một đoạn rồi hất nhẹ ra ngoài,
 * nét to ở thân và thon ở hai đầu, chỗ hai nét chồng nhau mực đậm hơn. Điểm `at` là [x, z] hoặc [x, z, y].
 */
export function PenCircle({ at, rx, rz, on: onProp = true, delay = 0, color = P.red, width = 0.11, rotY = 0, seed = 1 }: PenProps) {
  const live = useLive(), on = onProp && live;
  const { geo, mat } = useMemo(() => {
    // đường tâm của nét
    const turn = 1.16, a0 = -2.35 + seed * 0.37;
    const c: THREE.Vector2[] = [];
    for (let i = 0; i < PEN_N; i++) {
      const t = i / (PEN_N - 1), a = a0 + t * Math.PI * 2 * turn;
      const wob = 1 + 0.035 * Math.sin(2 * a + seed) + 0.02 * Math.sin(5 * a + seed * 2.3);
      const sp = 1.06 - 0.1 * t + 0.07 * Math.pow(Math.max(0, t - 0.9) / 0.1, 2); // xoắn vào dần, cuối nét hất ra
      c.push(new THREE.Vector2(Math.cos(a) * rx * wob * sp, Math.sin(a) * rz * wob * sp));
    }
    // độ dài cộng dồn, để nét vẽ ra đều tay
    const L = [0]; for (let i = 1; i < c.length; i++) L.push(L[i - 1] + c[i].distanceTo(c[i - 1]));
    const total = L[L.length - 1];
    const pos: number[] = [], uv: number[] = [], idx: number[] = [];
    for (let i = 0; i < c.length; i++) {
      const p = c[i], q = c[Math.min(i + 1, c.length - 1)], o = c[Math.max(i - 1, 0)];
      const tx = q.x - o.x, tz = q.y - o.y, tl = Math.hypot(tx, tz) || 1, nx = -tz / tl, nz = tx / tl;
      const u = L[i] / total;
      // lực tay: đặt bút nhẹ, thân nét đầy, cuối nét thon
      const press = (0.45 + 0.55 * THREE.MathUtils.smoothstep(u, 0, 0.07)) * (0.3 + 0.7 * THREE.MathUtils.smoothstep(1 - u, 0, 0.14)) * (0.9 + 0.1 * Math.sin(u * 17 + seed));
      const hw = (width / 2) * press;
      pos.push(p.x + nx * hw, 0, p.y + nz * hw, p.x - nx * hw, 0, p.y - nz * hw);
      uv.push(u, 0, u, 1);
      if (i < c.length - 1) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    const mat = new THREE.ShaderMaterial({
      uniforms: { uProg: { value: 0 }, uCol: { value: new THREE.Color(color) }, uSeed: { value: seed * 13.7 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
      fragmentShader: PEN_FS, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    });
    return { geo, mat };
  }, [rx, rz, seed, width, color]);
  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);
  const mesh = useRef<THREE.Mesh>(null!), st = useRef({ p: 0, wait: 0 });
  useFrame((_, rawDt) => {
    const dt = sdt(rawDt), s = st.current;
    s.wait = on ? s.wait + dt : 0;
    // khoanh một nét nhanh, dứt khoát (chậm ở đầu, nhanh ở giữa, chậm lại khi nhấc bút)
    s.p = on && s.wait >= delay ? Math.min(1, s.p + dt * 1.25) : Math.max(0, s.p - dt * 3);
    mat.uniforms.uProg.value = s.p >= 1 ? 1.001 : inOut(s.p);
    mesh.current.visible = s.p > 0.001;
  });
  return <group position={[at[0], PAGE_Y + 0.035 + (at[2] ?? 0), at[1]]} rotation={[0, rotY, 0]}>
    <mesh ref={mesh} geometry={geo} material={mat} renderOrder={2} frustumCulled={false} />
  </group>;
}

/* ---------------- đường chỉ mực trên trang ---------------- */
const PATH_FS = `varying vec2 vUv; uniform float uProg; uniform float uLen; uniform float uDash; uniform float uShift; uniform vec3 uCol;
void main(){
  if (vUv.x > uProg) discard;
  if (uDash > 0. && fract(vUv.x * uLen / uDash - uShift) > .55) discard;
  gl_FragColor = vec4(uCol, 1.);
  #include <colorspace_fragment>
}`;
/** Vật chở chạy dọc đường mực: phong bì, tiền, tin nhắn… (tấm bìa nhỏ luôn quay về phía camera). */
export type CarrierSpec = { id: string; draw: Draw; w?: number; h?: number; count?: number };
type FlowState = { drawn: boolean; clock: number };
function Carriers({ spec, path, len, flow }: { spec: CarrierSpec; path: THREE.Curve<THREE.Vector3>; len: number; flow: React.MutableRefObject<FlowState> }) {
  const w = spec.w ?? 0.7, h = spec.h ?? 0.55, count = spec.count ?? 2;
  const tex = useArt(spec.id, w, h, spec.draw);
  const refs = useRef<(THREE.Group | null)[]>([]);
  const period = Math.max(1.8, len / 1.7);
  useFrame(() => {
    const { drawn, clock } = flow.current;
    for (let i = 0; i < count; i++) {
      const g = refs.current[i]; if (!g) continue;
      const f = ((clock / period) + i / count) % 1;
      g.visible = drawn && !!tex && clock > (i / count) * period * 0.5;
      if (!g.visible) continue;
      g.position.copy(path.getPointAt(f)); g.position.y += h / 2 + 0.06 + Math.sin(clock * 7 + i * 2) * 0.04;
      g.scale.setScalar(Math.max(0.001, Math.pow(Math.sin(Math.PI * f), 0.35)));
    }
  });
  return <>{Array.from({ length: count }, (_, i) => (
    <Billboard key={i} ref={el => { refs.current[i] = el; }} visible={false}>
      <mesh><planeGeometry args={[w, h]} /><meshBasicMaterial map={tex} alphaTest={0.5} side={THREE.DoubleSide} /></mesh>
    </Billboard>
  ))}</>;
}

type PathProps = { pts: At[]; on?: boolean; delay?: number; color?: string; width?: number; dash?: number; arrow?: boolean; curve?: number; speed?: number;
  /** nét đứt trôi và chấm mực chạy theo hướng đi (mặc định bật khi có mũi tên hoặc vật chở) */
  flow?: boolean;
  /** thay chấm mực bằng vật chở (phong bì, tiền, tin nhắn…) */
  carrier?: CarrierSpec };
/** Đường kẻ bằng mực (chỉ đỏ, mũi tên, nét đứt) tự vẽ dần. Điểm là [x, z] trên trang hoặc [x, z, y] nếu nhấc lên khỏi trang. */
export function InkPath({ pts, on: onProp = true, delay = 0, color = P.red, width = 0.05, dash = 0, arrow = false, curve = 0, speed = 1.4, carrier, flow = arrow || !!carrier }: PathProps) {
  const live = useLive(), on = onProp && live;
  const { geo, len, end, dir, path } = useMemo(() => {
    const v = pts.map(p => new THREE.Vector3(p[0], PAGE_Y + 0.03 + (p[2] ?? 0), p[1]));
    if (curve && v.length === 2) { const m = v[0].clone().lerp(v[1], 0.5); m.y += curve; v.splice(1, 0, m); }
    const c = (v.length > 2 ? new THREE.CatmullRomCurve3(v, false, "centripetal") : new THREE.LineCurve3(v[0], v[1])) as THREE.Curve<THREE.Vector3>;
    const len = c.getLength(), end = c.getPoint(1), dir = c.getTangent(1);
    return { geo: new THREE.TubeGeometry(c, Math.max(16, Math.round(len * 12)), width, 6, false), len, end, dir, path: c };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(pts), width, curve]);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uProg: { value: 0 }, uLen: { value: 1 }, uDash: { value: 0 }, uShift: { value: 0 }, uCol: { value: new THREE.Color(color) } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`, fragmentShader: PATH_FS,
  }), [color]);
  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);
  useEffect(() => { mat.uniforms.uLen.value = len; mat.uniforms.uDash.value = dash; }, [mat, len, dash]);
  const head = useRef<THREE.Mesh>(null!), runner = useRef<THREE.Mesh>(null!), wait = useRef(0), fl = useRef<FlowState>({ drawn: false, clock: 0 });
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir), [dir]);
  const period = Math.max(1.1, len / 2.6);
  useFrame((_, rawDt) => {
    const dt = sdt(rawDt), u = mat.uniforms.uProg; wait.current = on ? wait.current + dt : 0;
    u.value = on && wait.current >= delay ? Math.min(1.001, u.value + (dt * speed * 6) / Math.max(len, 2)) : Math.max(0, u.value - dt * 3);
    const drawn = u.value >= 1;
    if (head.current) head.current.visible = drawn;
    if (!flow) return;
    const c = fl.current; c.drawn = drawn; c.clock = drawn ? c.clock + rawDt : 0;
    if (dash) mat.uniforms.uShift.value = c.clock * (1.0 / dash);
    if (runner.current) {
      const f = (c.clock % (period + 0.6)) / period; // chạy hết đường rồi nghỉ một nhịp ngắn
      runner.current.visible = drawn && f <= 1;
      if (f <= 1) { runner.current.position.copy(path.getPointAt(f)); runner.current.scale.setScalar(Math.pow(Math.sin(Math.PI * f), 0.4)); }
    }
  });
  return <group>
    <mesh geometry={geo} material={mat} />
    {arrow && <mesh ref={head} position={end} quaternion={q}><coneGeometry args={[width * 4, width * 9, 12]} /><meshBasicMaterial color={color} /></mesh>}
    {flow && !carrier && <mesh ref={runner} visible={false}><sphereGeometry args={[width * 2.4, 14, 10]} /><meshBasicMaterial color={color} /></mesh>}
    {flow && carrier && <Carriers spec={carrier} path={path} len={len} flow={fl} />}
  </group>;
}
