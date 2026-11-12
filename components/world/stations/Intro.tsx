"use client";
// Trang 1 (bìa hồ sơ chuyên đề trên bàn) và trang 2 (ảnh nhóm, bút chì khoanh từng khuôn mặt).
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { MEMBERS, ROLES, SECTIONS, TEAM_ORDER, TEAM_PHOTO, TEAM_STAGGER } from "@/content/slides";
import { damp, rng } from "../../three/kit";
import { F, Folder, HEX, Sheet, canvasTex, ease, grain, paperTexture, useOptionalTexture, useSince, useTex } from "../props";

/* ---------------- Bìa ---------------- */
export function coverTex() {
  return canvasTex(1024, 726, (g, W, H) => {
    g.fillStyle = "#d4b277"; g.fillRect(0, 0, W, H); grain(g, W, H, 4, 5000);
    g.fillStyle = "#f4efe2"; g.fillRect(90, 110, 560, 300); g.strokeStyle = "#1a1a1a"; g.lineWidth = 3; g.strokeRect(104, 124, 532, 272);
    g.fillStyle = "#b3202a"; g.font = F.mono(28); g.fillText("HỒ SƠ CHUYÊN ĐỀ", 134, 180);
    g.fillStyle = "#1a1a1a"; g.font = F.serif(96); g.fillText("HS-01", 130, 290);
    g.font = F.mono(30); g.fillText("KHÔNG GIAN MẠNG", 134, 360);
    g.fillStyle = "rgba(26,26,26,.6)"; g.font = F.mono(24); g.fillText("LƯU HÀNH NỘI BỘ", 96, H - 70);
  });
}
export function contentsTex() {
  return canvasTex(1024, 726, (g, W, H) => {
    g.fillStyle = "#f5f1e6"; g.fillRect(0, 0, W, H); grain(g, W, H, 9, 3000);
    g.fillStyle = "#b3202a"; g.font = F.mono(30); g.fillText("NỘI DUNG HỒ SƠ", 80, 100);
    g.fillStyle = "#1a1a1a"; g.fillRect(80, 122, W - 160, 4);
    SECTIONS.forEach((s, i) => {
      const y = 200 + i * 78;
      g.fillStyle = "#b3202a"; g.font = F.serif(48); g.fillText(s.n, 80, y);
      g.fillStyle = "#1a1a1a"; g.font = F.sans(44, 600); g.fillText(s.label, 200, y);
      g.fillStyle = "rgba(26,26,26,.35)"; for (let x = 520; x < W - 160; x += 18) g.fillRect(x, y - 6, 6, 4);
      g.fillStyle = "#1a1a1a"; g.font = F.mono(36); g.fillText(String(s.to).padStart(2, "0"), W - 140, y);
    });
  });
}

/** Dấu mộc tròn "10đ" giống mộc đóng tay: in lệch hai nhịp, mực loang không đều, mép hơi nhòe, có chỗ mực đọng. */
function sealTex() {
  return canvasTex(512, 512, (g, W, H) => {
    const cx = W / 2, cy = H / 2, r = rng(23);
    const stamp = (color: string, dx: number, dy: number) => {
      g.save(); g.translate(dx, dy); g.strokeStyle = color; g.fillStyle = color;
      g.lineWidth = 13; g.beginPath(); g.arc(cx, cy, 234, 0, Math.PI * 2); g.stroke();
      g.lineWidth = 4.5; g.beginPath(); g.arc(cx, cy, 213, 0, Math.PI * 2); g.stroke();
      g.lineWidth = 4.5; g.beginPath(); g.arc(cx, cy, 138, 0, Math.PI * 2); g.stroke();
      const ring = (text: string, top: boolean) => {
        g.font = F.sans(34, 700); const chars = [...text], span = 0.072 * (chars.length - 1);
        chars.forEach((ch, k) => {
          const a = (top ? -Math.PI / 2 : Math.PI / 2) + (top ? 1 : -1) * (k * 0.072 - span / 2);
          g.save(); g.translate(cx + Math.cos(a) * 176, cy + Math.sin(a) * 176); g.rotate(a + (top ? Math.PI / 2 : -Math.PI / 2));
          g.textAlign = "center"; g.fillText(ch, 0, 12); g.restore();
        });
      };
      ring("HỒ SƠ CHUYÊN ĐỀ", true); ring("TIỂU ĐỘI 2", false);
      const star = (x: number, y: number, rr: number) => { g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, q = k % 2 ? rr * 0.42 : rr; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath(); g.fill(); };
      star(cx - 178, cy, 16); star(cx + 178, cy, 16);
      g.font = F.serif(150); g.textAlign = "center"; g.fillText("10đ", cx, cy + 52);
      g.restore();
    };
    // nhịp ấn thứ nhất lệch nhẹ, mờ (mộc bị xê dịch khi nhấc tay)
    g.filter = "blur(1.2px)"; stamp("rgba(190,30,40,.22)", 4, 3);
    // nhịp chính, mép hơi nhòe
    g.filter = "blur(0.6px)"; stamp("rgba(190,28,38,.95)", 0, 0); g.filter = "none";
    // chỗ mực đọng đậm hơn
    g.globalCompositeOperation = "source-atop";
    for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(120,8,16,${0.12 + r() * 0.2})`; g.beginPath(); g.arc(r() * W, r() * H, 10 + r() * 40, 0, Math.PI * 2); g.fill(); }
    // lực ấn không đều: một phía nhạt dần
    g.globalCompositeOperation = "destination-out";
    const grd = g.createLinearGradient(W * 0.15, H * 0.1, W * 0.95, H * 0.9);
    grd.addColorStop(0, "rgba(0,0,0,0)"); grd.addColorStop(0.55, "rgba(0,0,0,.08)"); grd.addColorStop(1, "rgba(0,0,0,.55)");
    g.fillStyle = grd; g.fillRect(0, 0, W, H);
    // mảng mực không ăn giấy
    for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(0,0,0,${0.15 + r() * 0.45})`; g.beginPath(); g.ellipse(r() * W, r() * H, 3 + r() * 14, 2 + r() * 7, r() * Math.PI, 0, Math.PI * 2); g.fill(); }
    // hạt giấy
    for (let i = 0; i < 3200; i++) { g.fillStyle = `rgba(0,0,0,${r() * 0.6})`; const q = r() * 2.5 + 0.8; g.fillRect(r() * W, r() * H, q, q); }
  });
}
/** Dấu mộc đóng xuống: rơi từ trên, nảy nhẹ, mực hiện ra. */
export function Seal({ on, delay = 0.9, position = [1.25, 0.006, 0.95], size = 1.75, rot = 0.22 }: { on: boolean; delay?: number; position?: [number, number, number]; size?: number; rot?: number }) {
  const tex = useTex(sealTex, []);
  const g = useRef<THREE.Group>(null!), m = useRef<THREE.MeshBasicMaterial>(null!);
  const since = useSince(on);
  useFrame(({ clock }) => {
    const t = on ? clock.elapsedTime - since.current - delay : -1, k = ease(t / 0.28);
    g.current.visible = t > 0; g.current.position.y = position[1] + (1 - k) * 1.6;
    g.current.scale.setScalar(1 + (1 - k) * 0.6 + (t > 0.28 && t < 0.5 ? Math.sin(((t - 0.28) / 0.22) * Math.PI) * 0.04 : 0));
    m.current.opacity = Math.min(1, k * 1.2);
  });
  return (
    <group ref={g} position={position}>
      <mesh rotation={[-Math.PI / 2, 0, rot]}><planeGeometry args={[size, size]} /><meshBasicMaterial ref={m} map={tex} transparent depthWrite={false} toneMapped={false} /></mesh>
    </group>
  );
}

export function CoverStation({ step, active }: { step: number; active: boolean }) {
  const cover = useTex(coverTex, []), inside = useTex(contentsTex, []);
  const papers = useTex(() => paperTexture("photo", 1), []), note = useTex(() => paperTexture("note", 2), []), net = useTex(() => paperTexture("net", 4, "SƠ ĐỒ LIÊN KẾT"), []), web = useTex(() => paperTexture("web", 5), []);
  return (
    <group>
      <Sheet tex={papers} w={2.2} h={2.75} position={[-1.2, 0.012, -3.9]} rot={0.22} />
      <Sheet tex={net} w={2.4} h={3} position={[4.8, 0.012, -1.2]} rot={-0.18} />
      <Sheet tex={note} w={1.8} h={2.25} position={[4.4, 0.016, 2.2]} rot={0.3} />
      <Sheet tex={web} w={2.2} h={2.75} position={[1.8, 0.016, -4.3]} rot={-0.14} />
      <Folder open={active && step >= 1} w={6} d={4.25} cover={cover} inside={inside} position={[0, 0, 0.2]}><Seal on={active} /></Folder>
      {/* bút và cốc cà phê */}
      <group position={[3.2, 0.06, 3.4]} rotation={[0, 0.6, Math.PI / 2]}><mesh castShadow><cylinderGeometry args={[0.06, 0.06, 1.8, 12]} /><meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.3} /></mesh></group>
      <group position={[4.6, 0, -3.9]}>
        <mesh castShadow position={[0, 0.45, 0]}><cylinderGeometry args={[0.45, 0.4, 0.9, 32, 1, true]} /><meshStandardMaterial color="#e9e2d0" side={THREE.DoubleSide} roughness={0.4} /></mesh>
        <mesh position={[0, 0.78, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.42, 32]} /><meshStandardMaterial color="#2a1a0e" roughness={0.2} /></mesh>
        <mesh position={[0.5, 0.45, 0]}><torusGeometry args={[0.2, 0.05, 8, 20]} /><meshStandardMaterial color="#e9e2d0" /></mesh>
      </group>
    </group>
  );
}

/* ---------------- Thành viên: ảnh nhóm, bút chì khoanh từng khuôn mặt ----------------
   Ảnh dán giữa bảng gỗ bần. Vào trang: ảnh "hiện hình" như tráng phim. Bấm một lần: nét bút chì màu
   lần lượt khoanh từng khuôn mặt (theo vai trò), kéo một nét dẫn ra thẻ tên ghim ở mép ảnh. */
const PW = 8, PH = (PW * 1721) / 2560, PX = 0.6, PY = 4.6;
const TAG_W = 1.9, TAG_H = 0.7, Z = 0.03;
const toLocal = (u: number, v: number): [number, number] => [PX - PW / 2 + u * PW, PY + PH / 2 - v * PH];
const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);

type Plan = { i: number; c: [number, number]; R: number; tag: [number, number]; up: boolean; delay: number };
const PLANS: Plan[] = (() => {
  const ids = MEMBERS.map((_, i) => i), byX = (a: number, b: number) => MEMBERS[a].face[0] - MEMBERS[b].face[0];
  const top = ids.filter(i => MEMBERS[i].face[1] < 0.45).sort(byX), bot = ids.filter(i => MEMBERS[i].face[1] >= 0.45).sort(byX);
  const plans: Plan[] = [];
  const make = (row: number[], up: boolean, margin: number) => row.forEach((i, k) => {
    const span = PW - 2 * margin, x = PX - PW / 2 + margin + (row.length === 1 ? span / 2 : (k * span) / (row.length - 1));
    const y = up ? PY + PH / 2 + 0.56 + (k % 2) * 0.86 : PY - PH / 2 - 0.56;
    const [u, v, r] = MEMBERS[i].face;
    plans.push({ i, c: toLocal(u, v), R: r * PW, tag: [x, y], up, delay: TEAM_ORDER.indexOf(i) * TEAM_STAGGER });
  });
  make(top, true, 0.1); make(bot, false, 1.4);
  return plans;
})();

function tube(pts: THREE.Vector3[], seg: number, r: number) { return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg, r, 5, false); }
/** Vòng khoanh tay: hơi méo, hơi xoắn ốc, vẽ quá điểm đầu một chút như nét bút thật. */
function scribble(cx: number, cy: number, R: number, seed: number, turns: number, grow: number) {
  const r = rng(seed), a0 = r() * Math.PI * 2, ph = r() * 6, pts: THREE.Vector3[] = [];
  for (let k = 0; k <= 72; k++) {
    const t = k / 72, a = a0 + t * turns * Math.PI * 2, rr = R * (1 + 0.06 * Math.sin(2 * a + ph) + grow * t);
    pts.push(new THREE.Vector3(cx + Math.cos(a) * rr * 1.05, cy + Math.sin(a) * rr * 1.2, Z));
  }
  return pts;
}

function tagTex(i: number) {
  const m = MEMBERS[i], role = ROLES[m.role];
  return canvasTex(640, 236, (g, W, H) => {
    g.fillStyle = "#f6f1e3"; g.fillRect(0, 0, W, H); grain(g, W, H, 40 + i, 1500);
    g.fillStyle = role.color; g.fillRect(0, 0, 16, H);
    g.font = F.mono(30); const lab = role.label.toUpperCase(), lw = g.measureText(lab).width;
    g.fillRect(40, 20, lw + 28, 50); g.fillStyle = "#15130f"; g.fillText(lab, 54, 56);
    const id = String(i + 1).padStart(2, "0"), named = m.name.trim() !== "";
    // số thứ tự to bên phải: dùng để đối chiếu khi điền họ tên trong content/slides.ts
    g.fillStyle = named ? "rgba(26,26,26,.4)" : "#1a1a1a"; g.font = F.serif(named ? 40 : 150); g.textAlign = "right"; g.fillText(id, W - 24, named ? 60 : 196); g.textAlign = "left";
    if (named) {
      let px = 84; g.font = F.hand(px);
      while (g.measureText(m.name).width > W - 70 && px > 40) { px -= 4; g.font = F.hand(px); }
      g.fillStyle = "#1b2433"; g.fillText(m.name, 40, 172);
    } else { g.fillStyle = "rgba(27,36,51,.55)"; g.font = F.hand(56); g.fillText("Thành viên", 40, 168); }
    g.strokeStyle = "rgba(27,36,51,.35)"; g.lineWidth = 2; g.beginPath(); g.moveTo(40, 190); g.lineTo(W - 30, 194); g.stroke();
  });
}

const SEGS = [140, 100, 40];
function Mark({ p, on }: { p: Plan; on: boolean }) {
  const role = ROLES[MEMBERS[p.i].role];
  const geos = useMemo(() => {
    const [cx, cy] = p.c, [tx, ty] = p.tag;
    const dx = tx - cx, dy = ty - cy, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    const sx = cx + ux * p.R * 1.18, sy = cy + uy * p.R * 1.3, ex = tx, ey = ty + (p.up ? -TAG_H / 2 + 0.02 : TAG_H / 2 - 0.02);
    const mx = (sx + ex) / 2 - uy * 0.12, my = (sy + ey) / 2 + ux * 0.12;
    return [
      tube(scribble(cx, cy, p.R, p.i * 7 + 1, 1.12, 0.06), SEGS[0], 0.017),
      tube(scribble(cx, cy, p.R * 1.05, p.i * 7 + 3, 0.8, 0.04), SEGS[1], 0.009),
      tube([new THREE.Vector3(sx, sy, Z), new THREE.Vector3(mx, my, Z), new THREE.Vector3(ex, ey, Z)], SEGS[2], 0.011),
    ];
  }, [p]);
  useEffect(() => () => geos.forEach(g => g.dispose()), [geos]);
  const tex = useTex(() => tagTex(p.i), [p.i]);
  const tag = useRef<THREE.Group>(null!), tA = useRef(0);
  const since = useSince(on);
  const tilt = useMemo(() => (rng(p.i + 11)() - 0.5) * 0.09, [p.i]);
  useFrame(({ clock }, dt) => {
    const t = on ? clock.elapsedTime - since.current - p.delay : -1;
    const k = [ease(t / 0.5), ease((t - 0.28) / 0.4), ease((t - 0.5) / 0.28)];
    geos.forEach((g, j) => g.setDrawRange(0, Math.floor(clamp01(k[j]) * SEGS[j]) * 30));
    tA.current = damp(tA.current, t > 0.72 ? 1 : 0, 9, dt);
    const s = tA.current;
    tag.current.visible = s > 0.02; tag.current.scale.setScalar(0.6 + 0.4 * s);
    tag.current.position.z = 0.06 + (1 - s) * 0.5; tag.current.rotation.z = tilt + (1 - s) * 0.25;
  });
  return (
    <group>
      {geos.map((g, j) => <mesh key={j} geometry={g} renderOrder={3}><meshBasicMaterial color={role.color} transparent opacity={j === 1 ? 0.7 : 0.95} depthWrite={false} toneMapped={false} fog={false} /></mesh>)}
      <group ref={tag} position={[p.tag[0], p.tag[1], 0.06]} visible={false}>
        <mesh castShadow><planeGeometry args={[TAG_W, TAG_H]} /><meshStandardMaterial map={tex} roughness={0.9} fog={false} /></mesh>
        <mesh position={[0.4, TAG_H / 2 - 0.08, 0.05]}><sphereGeometry args={[0.07, 14, 14]} /><meshStandardMaterial color={role.color} roughness={0.3} /></mesh>
      </group>
    </group>
  );
}

/** Ảnh nhóm "hiện hình": từ nền tối ngả nâu lên màu thật, rơi nhẹ xuống bảng. */
function GroupPhoto({ url }: { url: string }) {
  const t = useOptionalTexture(url);
  const mat = useRef<THREE.MeshBasicMaterial>(null), g = useRef<THREE.Group>(null);
  const since = useSince(!!t);
  useFrame(({ clock }) => {
    if (!g.current || !mat.current) return;
    const e = clock.elapsedTime - since.current, d = ease((e - 0.25) / 2.2), drop = ease(e / 0.8);
    mat.current.color.setRGB(0.18 + 0.8 * d, 0.13 + 0.85 * d, 0.08 + 0.9 * d);
    g.current.position.z = (1 - drop) * 0.8; g.current.rotation.z = -0.012 + (1 - drop) * 0.05;
  });
  if (!t) return null;
  return (
    <group ref={g} position={[PX, PY, 0]}>
      <mesh position={[0.08, -0.1, -0.012]}><planeGeometry args={[PW + 0.1, PH + 0.1]} /><meshBasicMaterial color="#000" transparent opacity={0.45} depthWrite={false} /></mesh>
      <mesh><planeGeometry args={[PW, PH]} /><meshBasicMaterial ref={mat} map={t} toneMapped={false} fog={false} /></mesh>
      {[-1, 1].map(sx => <mesh key={sx} position={[sx * (PW / 2 - 0.25), PH / 2 - 0.2, 0.06]}><sphereGeometry args={[0.09, 14, 14]} /><meshStandardMaterial color={HEX.red} roughness={0.3} /></mesh>)}
    </group>
  );
}

export function TeamStation({ step }: { step: number }) {
  const cork = useTex(() => { const t = canvasTex(512, 256, (g, W, H) => { const r = rng(5); g.fillStyle = "#6b4f33"; g.fillRect(0, 0, W, H); for (let i = 0; i < 7000; i++) { g.fillStyle = r() < 0.5 ? `rgba(40,25,12,${r() * 0.4})` : `rgba(190,150,100,${r() * 0.25})`; g.fillRect(r() * W, r() * H, 2, 2); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 2.4); return t; }, []);
  return (
    <group position={[0, 0, -1]}>
      <mesh position={[PX, 5.1, -0.12]} receiveShadow castShadow><boxGeometry args={[18, 10.6, 0.2]} /><meshStandardMaterial map={cork} roughness={1} /></mesh>
      <mesh position={[PX, 5.1, -0.2]}><boxGeometry args={[18.5, 11.1, 0.1]} /><meshStandardMaterial color="#2a1e14" roughness={0.8} /></mesh>
      <GroupPhoto url={TEAM_PHOTO} />
      {PLANS.map(p => <Mark key={p.i} p={p} on={step >= 1} />)}
    </group>
  );
}
