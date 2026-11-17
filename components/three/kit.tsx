"use client";
// Bộ công cụ dùng chung cho các cảnh 3D: nhãn chữ (sprite), làm mượt giá trị, bảng màu.
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const SNAP_LABEL = typeof window !== "undefined" && /[?&]snap=1/.test(window.location.search);
export const COL = {
  bg: "#12100d", paper: "#efe7d6", ink: "#1a1a1a", red: "#d33a3f", redDeep: "#9e1b24",
  gold: "#d8b250", green: "#4f9e6c", greenDeep: "#2a5a3c", dim: "#4d483f", cyan: "#7fb6c9",
};

/** Đợi font web nạp xong để chữ vẽ trên canvas đúng phông. */
export function useFontsReady() {
  const [ready, setReady] = useState(0);
  useEffect(() => {
    let alive = true;
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (!fonts) return;
    // nạp cả bộ chữ tiếng Việt (phông chia theo unicode-range; mặc định chỉ nạp phần Latin)
    const VI = "Aa ạảãắằẳẵặấầẩẫậđẹẻẽếềểễệịỉĩọỏõốồổỗộớờởỡợụủũứừửữựỳỷỹỵ";
    Promise.all([
      fonts.load('600 48px "Be Vietnam Pro"', VI), fonts.load('700 48px "Be Vietnam Pro"', VI),
      fonts.load('700 48px "JetBrains Mono"', VI), fonts.load('800 48px "Noto Serif"', VI), fonts.load('400 48px "Patrick Hand"', VI),
    ]).catch(() => null).then(() => fonts.ready).then(() => { if (alive) setReady(r => r + 1); });
    return () => { alive = false; };
  }, []);
  return ready;
}

type LabelStyle = { color?: string; bg?: string; border?: string; font?: "sans" | "mono" | "serif"; weight?: number; tracking?: number };

function drawLabel(text: string, s: LabelStyle) {
  const size = 72;
  const fam = s.font === "mono" ? '"JetBrains Mono", monospace' : s.font === "serif" ? '"Noto Serif", Georgia, serif' : '"Be Vietnam Pro", system-ui, sans-serif';
  const font = `${s.weight ?? 700} ${size}px ${fam}`;
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d")!;
  ctx.font = font;
  const track = (s.tracking ?? 0) * size;
  const lines = text.split("\n");
  const widthOf = (l: string) => ctx.measureText(l).width + track * Math.max(l.length - 1, 0);
  const w = Math.max(...lines.map(widthOf));
  const lh = size * 1.28, px = s.bg || s.border ? size * 0.5 : size * 0.12, py = s.bg || s.border ? size * 0.32 : size * 0.1;
  c.width = Math.ceil(w + px * 2); c.height = Math.ceil(lh * lines.length + py * 2);
  ctx.font = font;
  if (s.bg) { ctx.fillStyle = s.bg; ctx.fillRect(0, 0, c.width, c.height); }
  if (s.border) { ctx.strokeStyle = s.border; ctx.lineWidth = 6; ctx.strokeRect(3, 3, c.width - 6, c.height - 6); }
  ctx.fillStyle = s.color ?? "#fff"; ctx.textBaseline = "middle";
  lines.forEach((l, i) => {
    let x = px; const y = py + lh * (i + 0.5);
    if (!track) { ctx.fillText(l, x, y); return; }
    for (const ch of l) { ctx.fillText(ch, x, y); x += ctx.measureText(ch).width + track; }
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter;
  return { tex, aspect: c.width / c.height, lines: lines.length };
}

type LabelProps = LabelStyle & {
  text: string; position?: [number, number, number]; rotation?: [number, number, number];
  /** chiều cao một dòng chữ, đơn vị thế giới 3D */
  size?: number; show?: boolean; opacity?: number; billboard?: boolean; depthTest?: boolean; renderOrder?: number;
};

/** Nhãn chữ trong không gian 3D. `show` điều khiển hiện/ẩn có chuyển động mờ dần. */
export function Label({ text, position = [0, 0, 0], rotation, size = 0.2, show = true, opacity = 1, billboard = true, depthTest = false, renderOrder = 10, ...style }: LabelProps) {
  const fonts = useFontsReady();
  const { tex, aspect, lines } = useMemo(() => drawLabel(text, style),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, style.color, style.bg, style.border, style.font, style.weight, style.tracking, fonts]);
  useEffect(() => () => tex.dispose(), [tex]);
  const gl = useThree(s => s.gl);
  useEffect(() => { gl.initTexture(tex); }, [gl, tex]); // tải sẵn lên GPU, kể cả khi nhãn đang ẩn
  const mat = useRef<THREE.SpriteMaterial | THREE.MeshBasicMaterial>(null);
  const grp = useRef<THREE.Object3D>(null);
  useFrame((_, dt) => {
    const m = mat.current; if (!m) return;
    const target = show ? opacity : 0;
    m.opacity += (target - m.opacity) * Math.min(1, dt * 6 * (SNAP_LABEL ? 100 : 1));
    if (grp.current) grp.current.visible = m.opacity > 0.01;
  });
  const h = size * lines * 1.28 + (style.bg || style.border ? size * 0.64 : size * 0.2);
  const scale: [number, number, number] = [h * aspect, h, 1];
  if (billboard)
    return <sprite ref={grp as React.Ref<THREE.Sprite>} position={position} scale={scale} renderOrder={renderOrder}>
      <spriteMaterial ref={mat as React.Ref<THREE.SpriteMaterial>} map={tex} transparent opacity={0} depthWrite={false} depthTest={depthTest} />
    </sprite>;
  return <mesh ref={grp as React.Ref<THREE.Mesh>} position={position} rotation={rotation} scale={scale} renderOrder={renderOrder}>
    <planeGeometry />
    <meshBasicMaterial ref={mat as React.Ref<THREE.MeshBasicMaterial>} map={tex} transparent opacity={0} depthWrite={false} depthTest={depthTest} side={THREE.DoubleSide} toneMapped={false} />
  </mesh>;
}

/** Bộ sinh số ngẫu nhiên có hạt giống: cảnh giống hệt nhau mỗi lần trình chiếu. */
export function rng(seed: number) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** Làm mượt một số theo thời gian, độc lập với tốc độ khung hình. */
export function damp(cur: number, target: number, lambda: number, dt: number) { return THREE.MathUtils.damp(cur, target, lambda, dt); }

/** Đường nét đứt (THREE.Line) làm từ danh sách điểm. */
export function dashedLine(points: THREE.Vector3[], color: string, dash = 0.08, gap = 0.06, opacity = 1) {
  const g = new THREE.BufferGeometry().setFromPoints(points);
  const l = new THREE.Line(g, new THREE.LineDashedMaterial({ color, dashSize: dash, gapSize: gap, transparent: true, opacity }));
  l.computeLineDistances();
  return l;
}

export function circlePoints(r: number, n = 96, y = 0) {
  return Array.from({ length: n + 1 }, (_, i) => { const a = (i / n) * Math.PI * 2; return new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r); });
}

/** Quỹ đạo camera mượt: tiến tới vị trí/điểm nhìn mục tiêu, có rung nhẹ theo chuột. */
export function useCameraRig(pos: THREE.Vector3, look: THREE.Vector3, opts: { lambda?: number; sway?: number; pointer?: number } = {}) {
  const lookCur = useRef(look.clone());
  const t = useRef(0);
  useFrame(({ camera, pointer }, dt) => {
    t.current += dt;
    const k = opts.lambda ?? 2.2, sw = opts.sway ?? 0.12, pk = opts.pointer ?? 0.35;
    const tx = pos.x + Math.sin(t.current * 0.25) * sw + pointer.x * pk;
    const ty = pos.y + Math.cos(t.current * 0.2) * sw * 0.5 + pointer.y * pk * 0.5;
    camera.position.set(damp(camera.position.x, tx, k, dt), damp(camera.position.y, ty, k, dt), damp(camera.position.z, pos.z, k, dt));
    lookCur.current.set(damp(lookCur.current.x, look.x, k, dt), damp(lookCur.current.y, look.y, k, dt), damp(lookCur.current.z, look.z, k, dt));
    camera.lookAt(lookCur.current);
  });
}
