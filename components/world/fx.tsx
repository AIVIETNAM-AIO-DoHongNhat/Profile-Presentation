"use client";
// Bộ công cụ 3D "bên trong hồ sơ": mọi hình vẽ là nét mực trên giấy.
// Nét vẽ dùng hòa trộn trừ (SubtractiveBlending): màu khai báo qua hdr() là "lượng mực", nhân hệ số nhỏ thì nét nhạt đi,
// chồng nhiều nét thì đậm lên, giống mực thấm trên giấy.
import { useFrame, useThree } from "@react-three/fiber";
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Label, rng, useFontsReady } from "../three/kit";

export { rng };
/** false khi camera còn đang bay tới trạm: thẻ, đường mực, chú thích chờ tới nơi mới bật. */
export const LiveCtx = createContext(true);
export const useLive = () => useContext(LiveCtx);
/** `flag` nhưng trễ `sec` giây khi bật (tắt thì tắt ngay): dàn nhịp nhiều cử động trong cùng một bước. */
export function useDelayed(flag: boolean, sec: number) {
  const [v, setV] = useState(false);
  useEffect(() => {
    if (!flag) { setV(false); return; }
    if (SNAP || sec <= 0) { setV(true); return; }
    const id = setTimeout(() => setV(true), sec * 1000); return () => clearTimeout(id);
  }, [flag, sec]);
  return flag && v;
}
/** Gây rung camera (độ mạnh ~0.05–0.3), dùng cho va chạm, con dấu đập xuống. */
export const ShakeCtx = createContext<(strength: number) => void>(() => undefined);
export const useShake = () => useContext(ShakeCtx);
/** Màu mực (màu thật hiện trên giấy). Tên giữ theo vai trò: cyan là nét mạng lưới, red là đối tượng, gold là Nhà nước / giải pháp. */
export const C = {
  bg: "#ece5d6", paper: "#f6f1e6", cyan: "#2c3a4a", red: "#b0261f", gold: "#9c7419", violet: "#4a4775", mint: "#2f6652",
  white: "#3b4048", grey: "#8d9298", amber: "#a45a1c", blue: "#2a4f7a", ink: "#23262b",
};
const INKS = new Set<string>(Object.values(C));
export type V3 = [number, number, number];
const PAPER_S = new THREE.Color(C.paper).convertLinearToSRGB();
/** Đổi màu mực thành "lượng mực" cho hòa trộn trừ. k là độ đậm: 1 là đúng màu mực, nhỏ hơn thì nhạt. */
export const hdr = (c: string, k = 1) => {
  const ink = new THREE.Color(c).convertLinearToSRGB(), kk = k <= 1 ? k : 1 + (k - 1) * 0.12;
  return new THREE.Color(1 - ink.r / PAPER_S.r, 1 - ink.g / PAPER_S.g, 1 - ink.b / PAPER_S.b).convertSRGBToLinear().multiplyScalar(kk);
};
export const INK = THREE.SubtractiveBlending;
export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const ease = (x: number) => { x = clamp01(x); return x * x * (3 - 2 * x); };
/** 0 khi v ≤ a, 1 khi v ≥ b, mượt ở giữa */
export const range = (v: number, a: number, b: number) => ease((v - a) / (b - a));
/** Tiến độ đi tới bước k (0 → 1). Trạm chưa tới có bước -1, nên ph(v, 0) chạy hiệu ứng mở màn. */
export const ph = (v: number, k: number) => range(v, k - 0.85, k);
/** Mức "đang được nói tới" của bước k: 1 khi đang ở đúng bước k, giảm dần khi rời xa. */
export const focus = (v: number, k: number) => 1 - clamp01(Math.abs(v - k));
export const lerp = THREE.MathUtils.lerp;
export const TAU = Math.PI * 2;
/** Chế độ kiểm tra (?snap=1): mọi chuyển động nhảy thẳng tới trạng thái cuối, dùng khi chụp ảnh màn hình trên máy không có GPU. */
export const SNAP = typeof window !== "undefined" && /[?&]snap=1/.test(window.location.search);
/**
 * Chế độ nhẹ cho điện thoại / máy yếu (ép bật bằng ?lite=1, ép tắt bằng ?lite=0): texture nhỏ hơn, tắt hậu kỳ, bóng đổ nhỏ.
 * Điện thoại có giới hạn bộ nhớ đồ họa thấp; vượt giới hạn thì trình duyệt tự tải lại tab (nháy trắng, không hiện gì).
 */
export const LITE = typeof window !== "undefined" && (() => {
  const q = window.location.search.match(/[?&]lite=([01])/);
  if (q) return q[1] === "1";
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  return window.matchMedia("(pointer: coarse)").matches || mem <= 4 || Math.min(screen.width, screen.height) < 700;
})();
/** Bước thời gian dùng cho các hàm làm mượt. */
export const sdt = (dt: number) => (SNAP ? 5 : Math.min(dt, 0.1));

/** Bước đang trình chiếu, làm mượt theo thời gian. Các cảnh lấy `v` để nội suy chuyển động giữa hai nhịp. */
export function useStepValue(step: number, lambda = 2.2) {
  const r = useRef({ v: -1 });
  useFrame((_, dt) => { r.current.v = THREE.MathUtils.damp(r.current.v, step, lambda, sdt(dt)); });
  return r;
}

/* ---------------- nút phát sáng (instanced) ---------------- */
export type NodeOut = { p: THREE.Vector3; c: THREE.Color; s: number };
type SwarmProps = {
  count: number; update: (i: number, o: NodeOut, t: number) => void;
  size?: number; shape?: "ico" | "oct" | "box" | "tet"; wire?: boolean; spin?: number;
};
export function Swarm({ count, update, size = 0.12, shape = "ico", wire = false, spin = 0 }: SwarmProps) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const geo = useMemo(() => {
    if (shape === "oct") return new THREE.OctahedronGeometry(size, 0);
    if (shape === "box") return new THREE.BoxGeometry(size, size, size);
    if (shape === "tet") return new THREE.TetrahedronGeometry(size, 0);
    return new THREE.IcosahedronGeometry(size, 1);
  }, [shape, size]);
  useEffect(() => () => geo.dispose(), [geo]);
  const o = useMemo<NodeOut>(() => ({ p: new THREE.Vector3(), c: new THREE.Color(), s: 1 }), []);
  const m = useMemo(() => ({ m: new THREE.Matrix4(), q: new THREE.Quaternion(), e: new THREE.Euler(), sc: new THREE.Vector3() }), []);
  useLayoutEffect(() => {
    const mesh = ref.current;
    mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);
  }, [count]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime, mesh = ref.current;
    for (let i = 0; i < count; i++) {
      o.s = 1; o.c.setRGB(1, 1, 1); update(i, o, t);
      m.e.set(t * spin + i, t * spin * 0.7 + i * 2, 0); m.q.setFromEuler(m.e); m.sc.setScalar(Math.max(o.s, 0.0001));
      m.m.compose(o.p, m.q, m.sc); mesh.setMatrixAt(i, m.m); mesh.setColorAt(i, o.c);
    }
    mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geo, undefined, count]} frustumCulled={false} castShadow={!wire}>
    <meshBasicMaterial toneMapped={false} wireframe={wire} transparent blending={INK} premultipliedAlpha depthWrite={false} />
  </instancedMesh>;
}

/* ---------------- dây nối (line segments) ---------------- */
type WireFn = (i: number, a: THREE.Vector3, b: THREE.Vector3, c: THREE.Color, c2: THREE.Color, t: number) => boolean | void;
/** `update` đặt hai đầu a, b và màu (c ở đầu a, c2 ở đầu b nếu đặt). Trả về false để ẩn dây. */
export function Wires({ count, update }: { count: number; update: WireFn }) {
  const s = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 6), 3));
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(count * 6), 3));
    return { g, a: new THREE.Vector3(), b: new THREE.Vector3(), c: new THREE.Color(), c2: new THREE.Color() };
  }, [count]);
  useEffect(() => () => s.g.dispose(), [s]);
  useFrame(({ clock }) => {
    const P = s.g.attributes.position.array as Float32Array, Q = s.g.attributes.color.array as Float32Array, t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      s.c.setRGB(0, 0, 0); s.c2.setRGB(-1, 0, 0);
      const ok = update(i, s.a, s.b, s.c, s.c2, t) !== false;
      if (s.c2.r < 0) s.c2.copy(s.c);
      if (!ok) { s.c.setRGB(0, 0, 0); s.c2.setRGB(0, 0, 0); }
      const o = i * 6;
      P[o] = s.a.x; P[o + 1] = s.a.y; P[o + 2] = s.a.z; P[o + 3] = s.b.x; P[o + 4] = s.b.y; P[o + 5] = s.b.z;
      Q[o] = s.c.r; Q[o + 1] = s.c.g; Q[o + 2] = s.c.b; Q[o + 3] = s.c2.r; Q[o + 4] = s.c2.g; Q[o + 5] = s.c2.b;
    }
    s.g.attributes.position.needsUpdate = true; s.g.attributes.color.needsUpdate = true;
  });
  return <lineSegments geometry={s.g} frustumCulled={false}><lineBasicMaterial vertexColors transparent blending={THREE.SubtractiveBlending} premultipliedAlpha depthWrite={false} toneMapped={false} /></lineSegments>;
}

/* ---------------- đường cong / vòng tròn ---------------- */
export function lineObj(points: THREE.Vector3[], color: THREE.Color, opacity = 1) {
  const g = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity, blending: THREE.SubtractiveBlending, premultipliedAlpha: true, depthWrite: false, toneMapped: false }));
}
export const circle = (r: number, n = 128) => Array.from({ length: n + 1 }, (_, i) => { const a = (i / n) * TAU; return new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r); });
type RingProps = { r: number; color: string; k?: number; opacity?: number; position?: V3; rotation?: V3; dash?: number };
/** Vòng sáng phẳng (nằm ngang theo mặc định). `opacity` có thể đổi mỗi lần render, chuyển mượt. */
export function Ring({ r, color, k = 2, opacity = 1, position, rotation, dash = 0 }: RingProps) {
  const obj = useMemo(() => {
    const pts = circle(r, dash ? dash * 2 : 160);
    if (!dash) return lineObj(pts, hdr(color, k));
    const g = new THREE.BufferGeometry().setFromPoints(pts.slice(0, -1));
    return new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: hdr(color, k), transparent: true, blending: THREE.SubtractiveBlending, premultipliedAlpha: true, depthWrite: false, toneMapped: false }));
  }, [r, color, k, dash]);
  useEffect(() => () => { obj.geometry.dispose(); (obj.material as THREE.Material).dispose(); }, [obj]);
  useFrame((_, dt) => {
    const m = obj.material as THREE.LineBasicMaterial;
    m.opacity = THREE.MathUtils.damp(m.opacity, opacity, 3, sdt(dt)); obj.visible = m.opacity > 0.005;
  });
  return <primitive object={obj} position={position} rotation={rotation} />;
}

/* ---------------- chấm sáng (points) ---------------- */
const DOT_VS = `attribute float aS; attribute vec3 aC; varying vec3 vC; uniform float uSize; uniform float uPx;
void main(){ vC = aC; vec4 mv = modelViewMatrix * vec4(position, 1.); gl_Position = projectionMatrix * mv; gl_PointSize = max(uSize * aS * uPx / -mv.z, 1.0); }`;
const DOT_FS = `varying vec3 vC; uniform vec3 uColor; uniform float uOpacity;
void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, .3, d); gl_FragColor = vec4(uColor * vC * a * uOpacity, 1.);
  #include <colorspace_fragment>
}`;
export function useDotMaterial(size: number, color: THREE.Color, opacity = 1) {
  const { size: vp, camera, gl } = useThree();
  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uSize: { value: size }, uPx: { value: 1000 }, uColor: { value: color }, uOpacity: { value: opacity } },
    vertexShader: DOT_VS, fragmentShader: DOT_FS, transparent: true, depthWrite: false, blending: THREE.SubtractiveBlending, premultipliedAlpha: true,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);
  useEffect(() => () => mat.dispose(), [mat]);
  useEffect(() => { mat.uniforms.uSize.value = size; mat.uniforms.uColor.value = color; }, [mat, size, color]);
  useFrame(() => { const fov = (camera as THREE.PerspectiveCamera).fov ?? 40; mat.uniforms.uPx.value = (vp.height * gl.getPixelRatio() * 0.5) / Math.tan(THREE.MathUtils.degToRad(fov / 2)); });
  return mat;
}
/** Đám chấm sáng tĩnh. `pos` là mảng x,y,z; `scale` và `tint` (0..1) tùy chọn cho từng chấm. */
export function Dots({ pos, scale, tint, size = 0.05, color = C.cyan, k = 1.6, opacity = 1 }: { pos: Float32Array; scale?: Float32Array; tint?: Float32Array; size?: number; color?: string; k?: number; opacity?: number }) {
  const col = useMemo(() => hdr(color, k), [color, k]);
  const mat = useDotMaterial(size, col, opacity);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry(), n = pos.length / 3;
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aS", new THREE.BufferAttribute(scale ?? new Float32Array(n).fill(1), 1));
    g.setAttribute("aC", new THREE.BufferAttribute(tint ?? new Float32Array(n * 3).fill(1), 3));
    return g;
  }, [pos, scale, tint]);
  useEffect(() => () => geo.dispose(), [geo]);
  useFrame((_, dt) => { mat.uniforms.uOpacity.value = THREE.MathUtils.damp(mat.uniforms.uOpacity.value, opacity, 3, sdt(dt)); });
  return <points geometry={geo} material={mat} frustumCulled={false} />;
}

/* ---------------- viền phát sáng theo góc nhìn (fresnel) ---------------- */
export function fresnelMat(color: THREE.Color, power = 2.4, opacity = 1, side: THREE.Side = THREE.FrontSide) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: color }, uPow: { value: power }, uOpacity: { value: opacity } },
    vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying vec3 vN; varying vec3 vV; uniform vec3 uColor; uniform float uPow; uniform float uOpacity; void main(){ float f = pow(1. - abs(dot(normalize(vN), normalize(vV))), uPow); gl_FragColor = vec4(uColor * f * uOpacity, 1.);
    #include <colorspace_fragment>
    }`,
    transparent: true, depthWrite: false, blending: THREE.SubtractiveBlending, premultipliedAlpha: true, side,
  });
}
export function Shell({ r, color, k = 1.4, power = 2.6, opacity = 1, position, detail = 48 }: { r: number; color: string; k?: number; power?: number; opacity?: number; position?: V3; detail?: number }) {
  const mat = useMemo(() => fresnelMat(hdr(color, k), power, opacity), [color, k, power]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => mat.dispose(), [mat]);
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => { const u = mat.uniforms.uOpacity; u.value = THREE.MathUtils.damp(u.value, opacity, 3, sdt(dt)); ref.current.visible = u.value > 0.005; });
  return <mesh ref={ref} position={position} material={mat}><sphereGeometry args={[r, detail, detail / 2]} /></mesh>;
}

/* ---------------- quả cầu dữ liệu ---------------- */
type GlobeProps = { r?: number; color?: string; arcColor?: string; arcs?: number; seed?: number; spin?: number; density?: number; nodeColor?: string; opacity?: number; tilt?: number };
/** Quả cầu làm bằng chấm sáng, mảng "lục địa" sáng hơn, các cung bay vượt biên giới. */
export function DataGlobe({ r = 3, color = C.cyan, arcColor = C.red, arcs = 14, seed = 3, spin = 0.06, density = 2600, nodeColor, opacity = 1, tilt = 0.35 }: GlobeProps) {
  const data = useMemo(() => {
    const n = density, pos = new Float32Array(n * 3), sc = new Float32Array(n), tint = new Float32Array(n * 3), land: THREE.Vector3[] = [];
    const ga = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2, rad = Math.sqrt(1 - y * y), th = ga * i, x = Math.cos(th) * rad, z = Math.sin(th) * rad;
      const noise = Math.sin(x * 3.1 + 1.3) * Math.sin(y * 2.6 + 0.4) * Math.sin(z * 3.3 + 2.1) + 0.45 * Math.sin(x * 7.3 + seed) * Math.sin(z * 6.1 + y * 2);
      const isLand = noise > 0.08;
      pos.set([x * r, y * r, z * r], i * 3);
      sc[i] = isLand ? 1 : 0.5; const b = isLand ? 1 : 0.28; tint.set([b, b, b], i * 3);
      if (isLand) land.push(new THREE.Vector3(x, y, z));
    }
    const R = rng(seed), arcList = Array.from({ length: arcs }, () => {
      const a = land[Math.floor(R() * land.length)], b = land[Math.floor(R() * land.length)];
      const ang = a.angleTo(b), h = 0.25 + ang * 0.55, pts: THREE.Vector3[] = [];
      for (let k = 0; k <= 64; k++) {
        const t = k / 64, s = Math.sin(ang) || 1;
        const v = a.clone().multiplyScalar(Math.sin((1 - t) * ang) / s).add(b.clone().multiplyScalar(Math.sin(t * ang) / s)).normalize();
        pts.push(v.multiplyScalar(r * (1 + h * Math.sin(Math.PI * t) * 0.6)));
      }
      return { pts, phase: R() * 2, speed: 0.22 + R() * 0.18 };
    });
    return { pos, sc, tint, arcList };
  }, [r, density, arcs, seed]);
  const arcObjs = useMemo(() => data.arcList.map(a => lineObj(a.pts, hdr(arcColor, 3))), [data, arcColor]);
  useEffect(() => () => arcObjs.forEach(o => { o.geometry.dispose(); (o.material as THREE.Material).dispose(); }), [arcObjs]);
  const grp = useRef<THREE.Group>(null!);
  const op = useRef(opacity);
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime; grp.current.rotation.y += dt * spin;
    op.current = THREE.MathUtils.damp(op.current, opacity, 3, sdt(dt));
    data.arcList.forEach((a, i) => {
      const f = ((t * a.speed + a.phase) % 1.7), head = clamp01(f) * 64, tail = clamp01(f - 0.55) * 64;
      arcObjs[i].geometry.setDrawRange(Math.floor(tail), Math.max(0, Math.floor(head - tail)) + 1);
      (arcObjs[i].material as THREE.LineBasicMaterial).opacity = op.current;
    });
  });
  const headCol = useMemo(() => hdr(nodeColor ?? arcColor, 5), [nodeColor, arcColor]);
  return (
    <group rotation={[tilt, 0, 0.18]}>
      <group ref={grp}>
        <Dots pos={data.pos} scale={data.sc} tint={data.tint} size={0.055 * (r / 3)} color={color} k={1.5} opacity={opacity} />
        <mesh><sphereGeometry args={[r * 0.985, 48, 32]} /><meshBasicMaterial color={C.paper} transparent opacity={opacity * 0.94} depthWrite={opacity > 0.5} /></mesh>
        {arcObjs.map((o, i) => <primitive key={i} object={o} />)}
        <Swarm count={data.arcList.length} size={0.05 * (r / 3) + 0.03} update={(i, o, t) => {
          const a = data.arcList[i], f = ((t * a.speed + a.phase) % 1.7), k = Math.min(64, Math.floor(clamp01(f) * 64));
          o.p.copy(a.pts[k]); o.c.copy(headCol); o.s = f < 1.05 ? op.current : 0;
        }} />
      </group>
      <Shell r={r * 1.005} color={color} k={0.35} power={3.5} opacity={opacity} />
    </group>
  );
}

/* ---------------- ảnh hologram ---------------- */
export function useImage(src?: string) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const gl = useThree(s => s.gl);
  useEffect(() => {
    if (!src) return;
    let alive = true, t: THREE.Texture | null = null;
    // tải lên GPU ngay khi ảnh về, không đợi lần vẽ đầu tiên (tránh khựng khi camera tới)
    new THREE.TextureLoader().load(src, x => { if (!alive) { x.dispose(); return; } x.colorSpace = THREE.SRGBColorSpace; x.anisotropy = 8; t = x; gl.initTexture(x); setTex(x); }, undefined, () => null);
    return () => { alive = false; t?.dispose(); };
  }, [src, gl]);
  return tex;
}
const PRINT_FS = `uniform sampler2D uMap; uniform float uHas; uniform float uReveal; uniform vec2 uB; varying vec2 vUv;
void main(){
  if (vUv.x > uReveal * 1.02) discard;
  vec2 inner = (vUv - uB) / (1. - 2. * uB);
  bool inImg = inner.x >= 0. && inner.y >= 0. && inner.x <= 1. && inner.y <= 1.;
  vec3 paper = vec3(.96, .945, .915);
  vec3 img = uHas > .5 ? texture2D(uMap, inner).rgb : vec3(.78, .75, .7);
  vec3 c = inImg ? img : paper;
  vec2 e = min(vUv, 1. - vUv);
  c = mix(c, vec3(.62, .58, .52), step(min(e.x, e.y), .003));
  gl_FragColor = vec4(c, 1.);
  #include <colorspace_fragment>
}`;
type HoloProps = { src?: string; w: number; h: number; on: boolean; tint?: string; position?: V3; rotation?: V3; delay?: number; pad?: number;
  /** vật gắn lên ảnh (ghim, chỉ đỏ…), nhận kích thước thật của tấm ảnh in sau khi co theo tỉ lệ */
  children?: (pw: number, ph: number) => React.ReactNode };
/** Ảnh in kẹp vào hồ sơ: viền giấy trắng, hiện ra bằng một nét lật từ trái sang phải. Ảnh co vừa khung w × h, giữ tỉ lệ. Thiếu ảnh thì hiện ô xám. */
export function Holo({ src, w, h, on: onProp, position, rotation, delay = 0, pad = 0.16, children }: HoloProps) {
  const live = useLive(), on = onProp && live;
  const tex = useImage(src);
  const img = tex?.image as { width: number; height: number } | undefined;
  const a = img ? img.width / img.height : w / h;
  const iw = a > w / h ? w : h * a, ih = a > w / h ? w / a : h;
  const pw = iw + pad * 2, ph = ih + pad * 2;
  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uMap: { value: null }, uHas: { value: 0 }, uReveal: { value: 0 }, uB: { value: new THREE.Vector2() } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
    fragmentShader: PRINT_FS, side: THREE.DoubleSide,
  }), []);
  useEffect(() => () => mat.dispose(), [mat]);
  useEffect(() => { mat.uniforms.uMap.value = tex; mat.uniforms.uHas.value = tex ? 1 : 0; }, [mat, tex]);
  useEffect(() => { mat.uniforms.uB.value.set(pad / pw, pad / ph); }, [mat, pw, ph]);
  const since = useRef(0), mesh = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => {
    since.current = on ? since.current + dt : 0;
    const u = mat.uniforms.uReveal;
    u.value = on ? (since.current > delay ? Math.min(1, u.value + sdt(dt) * 1.4) : u.value) : THREE.MathUtils.damp(u.value, 0, 6, dt);
    mesh.current.visible = u.value > 0.001;
  });
  return <group position={position} rotation={rotation}>
    <mesh ref={mesh} material={mat} castShadow><planeGeometry args={[pw, ph]} /></mesh>
    {children?.(pw, ph)}
  </group>;
}

/* ---------------- nhãn chữ ---------------- */
type TagProps = { text: string; position?: V3; size?: number; show?: boolean; color?: string; border?: string; bg?: string | false; font?: "sans" | "mono" | "serif"; weight?: number; opacity?: number };
/** Chú thích đánh máy, mực trực tiếp trên không gian (không khung, không nền). Màu ngoài bảng mực được quy về mực đen. */
export function Tag({ text, position, size = 0.2, show = true, color = C.ink, font = "mono", weight = 600, opacity = 1 }: TagProps) {
  const ink = INKS.has(color) && color !== C.bg && color !== C.paper ? color : C.ink;
  const live = useLive();
  return <Label text={text} position={position} size={size * 0.92} show={show && live} opacity={opacity} color={ink} font={font} weight={weight} tracking={font === "mono" ? 0.04 : 0} />;
}

/* ---------------- texture vẽ bằng canvas ---------------- */
export const FONT = {
  sans: (px: number, w = 700) => `${w} ${px}px "Be Vietnam Pro", system-ui, sans-serif`,
  mono: (px: number, w = 700) => `${w} ${px}px "JetBrains Mono", monospace`,
};
/** Texture vẽ tay, tự vẽ lại khi phông chữ web nạp xong. */
export function useCanvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, deps: unknown[]) {
  const f = useFontsReady();
  const t = useMemo(() => {
    const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d")!, w, h);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = LITE ? 2 : 8; return tex;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, f, w, h]);
  // giải phóng cả canvas (Safari iOS giữ bộ nhớ canvas tới khi bị thu dọn, dễ vượt giới hạn)
  useEffect(() => () => { t.dispose(); const c = t.image as HTMLCanvasElement | undefined; if (c) { c.width = 0; c.height = 0; } }, [t]);
  return t;
}

/* ---------------- tiện ích hình học ---------------- */
/** n điểm phân bố đều trên mặt cầu bán kính r */
export function fibSphere(n: number, r: number) {
  const ga = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: n }, (_, i) => { const y = 1 - ((i + 0.5) / n) * 2, rad = Math.sqrt(1 - y * y), th = ga * i; return new THREE.Vector3(Math.cos(th) * rad * r, y * r, Math.sin(th) * rad * r); });
}
/** điểm ngẫu nhiên trong hình đĩa / khối cầu, có hạt giống */
export function scatter(n: number, seed: number, rx: number, ry: number, rz: number, cy = 0) {
  const R = rng(seed);
  return Array.from({ length: n }, () => { let x = 0, y = 0, z = 0; do { x = R() * 2 - 1; y = R() * 2 - 1; z = R() * 2 - 1; } while (x * x + y * y + z * z > 1); return new THREE.Vector3(x * rx, y * ry + cy, z * rz); });
}
/** nối mỗi điểm với k điểm gần nhất (không lặp) */
export function knn(pts: THREE.Vector3[], k = 2, maxD = Infinity) {
  const set = new Set<string>(), out: [number, number][] = [];
  pts.forEach((p, i) => {
    pts.map((q, j) => [j, p.distanceTo(q)] as const).filter(([j, d]) => j !== i && d < maxD).sort((a, b) => a[1] - b[1]).slice(0, k)
      .forEach(([j]) => { const key = i < j ? `${i}-${j}` : `${j}-${i}`; if (!set.has(key)) { set.add(key); out.push(i < j ? [i, j] : [j, i]); } });
  });
  return out;
}
export const v3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
