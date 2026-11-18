"use client";
// Trang 1 (bìa), trang 2 (ảnh nhóm, khoanh mặt bằng bút đỏ), trang 14 (lời cảm ơn).
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { MEMBERS, ROLES, TEAM_ASPECT, TEAM_ORDER, TEAM_PHOTO, TEAM_SPOTS, TEAM_STAGGER } from "@/content/slides";
import { MONO, P, SANS, building, chibi, groupPage, rr, shape, shield, star, text } from "../art";
import { CHIBI } from "../chibis";
import { Holo, sdt, useLive } from "../fx";
import { Card, InkPath, PAGE_Y, type Draw } from "../pop";
import { dCrowd, dPerson, dPhone, crowdW } from "./draws";

/* ---------------- Bìa: "từ rời rạc thành tổ chức" ----------------
   Đúng tên chuyên đề: tập hợp lực lượng → thành lập tổ chức.
   ① Người dùng đứng rải rác, ở giữa là một tài khoản đeo mặt nạ.
   ② Mạng nhện mực đỏ giăng ra từ tài khoản đó; vòng lan tới ai thì người đó bị móc chỉ và chuyển đỏ.
   ③ Những người bị móc bị kéo về, xếp thành kim tự tháp tổ chức (1 cầm đầu · 3 · 8); nét phân cấp nối các tầng. */
const WEB_C: [number, number] = [2.6, -0.3]; // tâm mạng nhện
const USERS: [number, number][] = [
  [0.4, -2.6], [4.9, -2.9], [6.3, -0.6], [5.8, 1.9], [3.9, 3.0], [1.2, 3.1],
  [-0.9, 1.4], [-0.6, -1.0], [1.6, 1.3], [4.3, 1.0], [2.4, -2.5],
];
/* chỗ đứng trong kim tự tháp: tầng 2 (3 người), tầng 3 (8 người, hai hàng so le) */
const TIER2: [number, number][] = [[1.4, -0.9], [2.6, -0.9], [3.8, -0.9]];
const TIER3: [number, number][] = [[0.9, 0.6], [2.0, 0.6], [3.2, 0.6], [4.3, 0.6], [0.4, 1.9], [1.6, 1.9], [3.6, 1.9], [4.8, 1.9]];
const SLOT = [...TIER2, ...TIER3];
const LEADER_END: [number, number] = [2.6, -2.4];
const RINGS = [1.6, 3.1, 4.6];
const RAYS = 8;
const T_WEB = 1.0, T_HOOK = 1.5, T_GATHER = 4.6, T_LINKS = 5.9;

export function CoverStation() {
  const live = useLive();
  // người gần tâm bị móc trước; mỗi người được giao một chỗ trong kim tự tháp theo hướng đứng để đường đi không cắt nhau
  const plan = useMemo(() => {
    const d = USERS.map(([x, z]) => Math.hypot(x - WEB_C[0], z - WEB_C[1]));
    const hookAt = d.map(r => T_HOOK + r * 0.5);
    const free = SLOT.map((_, i) => i), slotOf: number[] = [];
    USERS.map((_, i) => i).sort((a, b) => d[a] - d[b]).forEach(i => {
      let best = 0; free.forEach((s, k) => { if (Math.hypot(SLOT[s][0] - USERS[i][0], SLOT[s][1] - USERS[i][1]) < Math.hypot(SLOT[free[best]][0] - USERS[i][0], SLOT[free[best]][1] - USERS[i][1])) best = k; });
      slotOf[i] = free.splice(best, 1)[0];
    });
    return { hookAt, slotOf };
  }, []);
  const [t, setT] = useState(0); // thời gian kịch bản, làm tròn 0.1 s để chỉ render lại khi có mốc mới
  const clock = useRef(0);
  useFrame((_, raw) => {
    clock.current = live ? clock.current + sdt(raw) : 0;
    const q = Math.floor(clock.current * 10) / 10;
    if (q !== t && (q <= T_LINKS + 0.2 || t < T_LINKS)) setT(Math.min(q, T_LINKS + 0.2));
  });
  const web = t >= T_WEB && t < T_GATHER + 0.3, gather = t >= T_GATHER, links = t >= T_LINKS;
  const ring = (r: number): [number, number][] => Array.from({ length: RAYS + 1 }, (_, k) => {
    const a = (k / RAYS) * Math.PI * 2 + 0.2; return [WEB_C[0] + Math.cos(a) * r, WEB_C[1] + Math.sin(a) * r * 0.8];
  });
  return <group>
    {/* tài khoản đeo mặt nạ: tâm mạng nhện, cuối cùng lùi về đỉnh kim tự tháp */}
    <Card id="cover-leader" w={1.25} h={2.0} at={gather ? LEADER_END : WEB_C} delay={0.3} speed={1.4}
      draw={dPerson({ mask: true, body: "#2e3137" })} ring={links ? P.red : undefined} />
    {/* mạng nhện: tia trước, vòng sau, tan đi khi đã gom người */}
    {Array.from({ length: RAYS }, (_, k) => {
      const a = (k / RAYS) * Math.PI * 2 + 0.2;
      return <InkPath key={`r${k}`} pts={[[WEB_C[0] + Math.cos(a) * 0.5, WEB_C[1] + Math.sin(a) * 0.4], [WEB_C[0] + Math.cos(a) * 5.2, WEB_C[1] + Math.sin(a) * 4.2]]}
        on={web} delay={k * 0.04} width={0.022} speed={2.4} />;
    })}
    {RINGS.map((r, k) => <InkPath key={`c${k}`} pts={ring(r)} on={web} delay={0.5 + k * 0.45} width={0.022} speed={2.2} dash={0.18} />)}
    {/* người dùng: bị móc thì chuyển đỏ, rồi bị kéo về chỗ trong tổ chức */}
    {USERS.map(([x, z], i) => {
      const hooked = t >= plan.hookAt[i], slot = SLOT[plan.slotOf[i]];
      return <group key={i}>
        <Card id={`cover-u${i}`} w={0.82} h={1.35} at={gather ? slot : [x, z]} delay={0.2 + i * 0.05} speed={1.5 + (i % 3) * 0.2} rotY={-x * 0.03}
          draw={dPerson({ body: [P.slate, P.sand, P.blueSoft][i % 3], phone: i % 2 === 0 })}
          back={{ id: `cover-u${i}-red`, draw: dPerson({ body: P.red, phone: i % 2 === 0 }) }} flipped={hooked} />
        {/* sợi chỉ móc từ tâm tới người */}
        <InkPath pts={[[WEB_C[0], WEB_C[1]], [x, z - 0.25]]} on={hooked && !gather} width={0.03} speed={3} />
      </group>;
    })}
    {/* nét phân cấp: cầm đầu → tầng 2 → tầng 3 */}
    {TIER2.map(([x, z], k) => <InkPath key={`l${k}`} pts={[[LEADER_END[0], LEADER_END[1] + 0.3], [x, z - 0.35]]} on={links} delay={k * 0.12} width={0.04} dash={0.2} flow />)}
    {TIER3.map(([x, z], k) => { const p = TIER2[Math.min(2, Math.floor((x - 0.4) / 1.6))];
      return <InkPath key={`m${k}`} pts={[[p[0], p[1] + 0.3], [x, z - 0.35]]} on={links} delay={0.4 + k * 0.06} width={0.03} dash={0.16} flow />; })}
  </group>;
}

/* ---------------- Lời cảm ơn: khiên bảo vệ cộng đồng mạng ---------------- */
export function ClosingStation() {
  return <group>
    <Card id="end-building" w={4.4} h={3.3} at={[1.2, -3.2]} draw={(g, W, H) => building(g, W / 2, H - 8, W * 0.86, { star: true })} />
    <Card id="end-shield" w={2.6} h={3.0} at={[-2.6, -1.6]} delay={0.3} draw={(g, W, H) => shield(g, W / 2, H / 2, H * 0.78, P.blueSoft, gg => star(gg, W / 2, H / 2 - 10, H * 0.17, P.red))} />
    <Card id="end-crowd" w={crowdW(7, 1.9)} h={1.9} at={[0.8, 0.8]} delay={0.6} draw={dCrowd(7, i => ({ body: [P.slate, P.sand, P.blueSoft, P.greenSoft][i % 4], phone: i % 3 === 1 }))} />
    <Card id="end-phone" w={1.6} h={2.7} at={[4.6, -0.8]} delay={0.8} rotY={-0.25} draw={dPhone((g, x, y, w, h) => groupPage(g, x, y, w, h, { name: "Thông tin chính thống", members: "Nguồn tin xác thực", cover: P.greenSoft }))} />
  </group>;
}

/* ---------------- Thành viên ----------------
   Ảnh tập thể kẹp đứng phía sau. Khi bấm, vùng sáng lướt qua từng khuôn mặt; tới ai thì chibi của người đó
   (mặc đúng bộ đồ trong ảnh) bật dựng trên mặt bàn, kèm bảng tên và nhiệm vụ. */
const PW = 6.6, PH = PW / TEAM_ASPECT, PAD = 0.3;
const PHOTO_Z = -1.6, TILT = -0.08;
export const TEAM_Y = PAGE_Y + (PH + PAD * 2) / 2 + 0.05;
// vị trí mặt trên ảnh (TEAM_SPOTS); `face` trong MEMBERS chỉ còn dùng để xếp hàng chibi
const faceAt = (i: number) => { const f = TEAM_SPOTS?.[i] ?? MEMBERS[i].face; return { x: (f[0] - 0.5) * PW, y: (0.5 - f[1]) * PH, r: f[2] * PW }; };

/* Bố cục thẻ: hàng sau là những người đứng cao trong ảnh, hàng trước là những người ngồi phía trước; trái → phải theo ảnh. */
const CW = 1.45, CH = 2.3;
const SLOTS = (() => {
  const byY = MEMBERS.map((_, i) => i).sort((a, b) => MEMBERS[a].face[1] - MEMBERS[b].face[1]);
  const back = byY.slice(0, 5).sort((a, b) => MEMBERS[a].face[0] - MEMBERS[b].face[0]);
  const front = byY.slice(5).sort((a, b) => MEMBERS[a].face[0] - MEMBERS[b].face[0]);
  const out: Record<number, [number, number]> = {};
  back.forEach((m, k) => { out[m] = [(k - 2) * 1.8 - 0.45, 0.4]; });
  front.forEach((m, k) => { out[m] = [(k - 2) * 1.8 + 0.45, 3.6]; });
  return out;
})();

function splitName(g: CanvasRenderingContext2D, name: string, maxW: number) {
  if (g.measureText(name).width <= maxW) return [name];
  const w = name.split(" "); const a = w.slice(0, -2).join(" "), b = w.slice(-2).join(" ");
  return a ? [a, b] : [w.slice(0, -1).join(" "), w[w.length - 1]];
}
/** Chibi của một thành viên đứng trên bảng tên: số thứ tự · nhiệm vụ, họ tên. */
function drawMember(i: number, order: number): Draw {
  return (g, W, H) => {
    const m = MEMBERS[i], role = ROLES[m.role];
    // người đội vương miện vẽ nhỏ đi một chút để vương miện không lẹm khỏi mép trên tấm bìa
    chibi(g, W / 2, H * 0.76, H * (CHIBI[i].crown ? 0.69 : 0.74), CHIBI[i]);
    const py = H * 0.765, ph = H - py - 6;
    rr(g, W * 0.05, py, W * 0.9, ph, 10); shape(g, P.paper, 4);
    g.fillStyle = role.color; g.fillRect(W * 0.05 + 2, py + 2, W * 0.9 - 4, ph * 0.08);
    text(g, `${String(order + 1).padStart(2, "0")} · ${role.label.toUpperCase()}`, W / 2, py + ph * 0.26, MONO(Math.round(H * 0.034), 800), role.color, "center", W * 0.84);
    g.font = SANS(Math.round(H * 0.05), 800);
    const ls = splitName(g, m.name, W * 0.84);
    ls.forEach((t, k) => text(g, t, W / 2, py + ph * (ls.length > 1 ? 0.56 + k * 0.27 : 0.66), SANS(Math.round(H * 0.05), 800), P.ink, "center", W * 0.84));
  };
}

const SPOT_FS = `varying vec2 vP; uniform vec2 uC; uniform vec2 uR; uniform float uAmt;
void main(){ float d = length((vP - uC) / uR); gl_FragColor = vec4(.07, .07, .08, uAmt * .62 * smoothstep(1., 1.7, d)); }`;
/** Lớp tối phủ ảnh, chừa vùng sáng quanh khuôn mặt đang được giới thiệu; lướt lần lượt theo thứ tự. */
function Spotlight({ on }: { on: boolean }) {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uC: { value: new THREE.Vector2() }, uR: { value: new THREE.Vector2(0.4, 0.45) }, uAmt: { value: 0 } },
    vertexShader: `varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
    fragmentShader: SPOT_FS, transparent: true, depthWrite: false,
  }), []);
  useEffect(() => () => mat.dispose(), [mat]);
  const t = useRef(0);
  useFrame((_, raw) => {
    const dt = sdt(raw); t.current = on ? t.current + dt : 0;
    const k = Math.floor((t.current - 0.5) / TEAM_STAGGER);
    const who = on && k >= 0 && k < TEAM_ORDER.length ? TEAM_ORDER[k] : -1;
    const u = mat.uniforms;
    u.uAmt.value = THREE.MathUtils.damp(u.uAmt.value, who >= 0 ? 1 : 0, 5, dt);
    if (who >= 0) {
      const f = faceAt(who), snap = u.uAmt.value < 0.05 ? 60 : 10;
      u.uC.value.x = THREE.MathUtils.damp(u.uC.value.x, f.x, snap, dt); u.uC.value.y = THREE.MathUtils.damp(u.uC.value.y, f.y, snap, dt);
      u.uR.value.x = THREE.MathUtils.damp(u.uR.value.x, f.r * 1.5, snap, dt); u.uR.value.y = THREE.MathUtils.damp(u.uR.value.y, f.r * 1.8, snap, dt);
    }
  });
  return <mesh position={[0, 0, 0.006]} material={mat}><planeGeometry args={[PW, PH]} /></mesh>;
}
function Tape({ x, y, rot }: { x: number; y: number; rot: number }) {
  return <mesh position={[x, y, 0.015]} rotation={[0, 0, rot]}><planeGeometry args={[1.0, 0.3]} /><meshBasicMaterial color="#e9dcbc" transparent opacity={0.85} depthWrite={false} /></mesh>;
}
export function TeamStation({ step }: { step: number }) {
  const on = step >= 1;
  return <group>
    <group position={[0, TEAM_Y, PHOTO_Z]}>
      <Holo src={TEAM_PHOTO} w={PW} h={PH} pad={PAD} on rotation={[TILT, 0, 0]} />
      <group rotation={[TILT, 0, 0]}>
        {TEAM_SPOTS && <Spotlight on={on} />}
        <Tape x={-PW / 2 - PAD * 0.1} y={PH / 2 + PAD * 0.7} rot={0.62} />
        <Tape x={PW / 2 + PAD * 0.1} y={PH / 2 + PAD * 0.7} rot={-0.62} />
      </group>
    </group>
    {TEAM_ORDER.map((i, order) => {
      const [x, z] = SLOTS[i];
      return <Card key={i} id={`team-chibi-${i}`} w={CW} h={CH} at={[x, z]} on={on} delay={0.6 + order * TEAM_STAGGER} rotY={-x * 0.035} draw={drawMember(i, order)} />;
    })}
  </group>;
}
