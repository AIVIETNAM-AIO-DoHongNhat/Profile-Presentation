"use client";
// Mục VI: giải pháp. "Lá chắn bảo vệ cộng đồng mạng":
// cộng đồng đứng giữa trang, năm thủ đoạn xếp vòng cung phía sau, mũi tên đỏ nhắm vào cộng đồng.
// Mỗi nhịp, một tấm khiên giải pháp bật dựng chắn ngang: mũi tên bị chặn, thẻ thủ đoạn lật mặt "ĐÃ CHẶN".
// Nhịp cuối: các khiên nằm xuống, "ngôi nhà giải pháp chung" bốn cột trụ dựng lên che chở cộng đồng.
import { P, book, chat, doc, eye, globe, groupPage, handshake, magnifier, megaphone, shield, stamp, star, text, MONO, SERIF, SANS } from "../art";
import { C } from "../fx";
import { Impact } from "../desk";
import { Card, InkPath } from "../pop";
import { dCrowd, crowdW, dIcon, dLaptop, dPhone } from "./draws";
import { cap } from "./Theory";

type G = CanvasRenderingContext2D;
type D = (g: G, W: number, H: number) => void;
const ANG = [160, 125, 90, 55, 20].map(a => (a * Math.PI) / 180);
const CENTER: [number, number] = [0, 1.4];
const at = (k: number, r: number): [number, number] => [CENTER[0] + Math.cos(ANG[k]) * r * 0.78, CENTER[1] - Math.sin(ANG[k]) * r * 0.9];
const R_THREAT = 6.8, R_SHIELD = 4.0;

const THREATS: { draw: D; w: number; h: number; label: string }[] = [
  { draw: dPhone((g, x, y, w, h) => groupPage(g, x, y, w, h, { name: "Nhóm MXH", alert: true })), w: 1.5, h: 2.5, label: "NHÓM MXH" },
  { draw: dLaptop((g, x, y, w, h) => { text(g, "LỚP HỌC", x + w / 2, y + h * 0.32, SERIF(Math.round(h * 0.2), 800), P.red); text(g, "trực tuyến", x + w / 2, y + h * 0.62, SANS(Math.round(h * 0.15), 600)); }), w: 2.0, h: 1.6, label: "HỌC HỎI, GIAO LƯU" },
  { draw: dIcon((g, cx, cy, s) => megaphone(g, cx, cy, s * 0.6)), w: 1.7, h: 1.6, label: "TUYÊN TRUYỀN" },
  { draw: dPhone((g, x, y, w, h) => chat(g, x, y, w, h, { locked: true, red: true })), w: 1.5, h: 2.5, label: "HỌP QUA ỨNG DỤNG" },
  { draw: dIcon((g, cx, cy, s) => globe(g, cx, cy, s * 0.46, P.redSoft)), w: 1.7, h: 1.7, label: "MÓC NỐI BÊN NGOÀI" },
];
/** Mặt sau của thẻ thủ đoạn: hình mờ đi, đóng dấu "ĐÃ CHẶN". */
const blocked = (d: D): D => (g, W, H) => { d(g, W, H); g.fillStyle = "rgba(236,229,214,.72)"; g.fillRect(0, 0, W, H); stamp(g, W / 2, H / 2, "ĐÃ CHẶN", Math.min(W, H) * 0.12, P.red, -0.2); };

const SHIELDS: [string, (g: G, cx: number, cy: number, s: number) => void][] = [
  ["NẮM TÌNH HÌNH", (g, cx, cy, s) => eye(g, cx, cy, s * 0.7)],
  ["GIÁO DỤC", (g, cx, cy, s) => book(g, cx, cy, s * 0.6, P.paper)],
  ["TIN CHÍNH THỐNG", (g, cx, cy, s) => doc(g, cx - s * 0.3, cy - s * 0.38, s * 0.6, s * 0.76, { lines: 4, fill: P.paper })],
  ["NGHIỆP VỤ", (g, cx, cy, s) => magnifier(g, cx - s * 0.08, cy - s * 0.08, s * 0.75)],
  ["PHỐI HỢP QUỐC TẾ", (g, cx, cy, s) => handshake(g, cx, cy, s * 0.6)],
];
const drawShield = (k: number): D => (g, W, H) => {
  shield(g, W / 2, H * 0.42, H * 0.7, P.blueSoft, gg => SHIELDS[k][1](gg, W / 2, H * 0.4, H * 0.34));
  text(g, SHIELDS[k][0], W / 2, H * 0.92, MONO(Math.round(H * 0.08), 800), P.blue, "center", W * 0.98);
};

/** Ngôi nhà giải pháp chung: mái, bốn cột trụ có tên, nền móng. */
const PILLARS = ["CƠ CHẾ, PHÁP LUẬT", "LỰC LƯỢNG, KHCN", "GIA ĐÌNH, NHÀ TRƯỜNG", "PHÒNG NGỪA, XỬ LÝ"];
function generalHouse(g: G, W: number, H: number) {
  const x = W * 0.04, w = W * 0.92, top = H * 0.04, roofH = H * 0.24, base = H - 10, cols = 4;
  g.beginPath(); g.moveTo(x - 8, top + roofH); g.lineTo(W / 2, top); g.lineTo(x + w + 8, top + roofH); g.closePath(); g.fillStyle = P.redSoft; g.fill(); g.lineWidth = 7; g.strokeStyle = P.ink; g.lineJoin = "round"; g.stroke();
  star(g, W / 2, top + roofH * 0.42, roofH * 0.2, P.red);
  text(g, "GIẢI PHÁP CHUNG", W / 2, top + roofH * 0.8, MONO(Math.round(H * 0.05), 800), P.ink, "center", w * 0.5);
  g.fillStyle = P.cream; g.fillRect(x, top + roofH, w, H * 0.05); g.strokeRect(x, top + roofH, w, H * 0.05);
  const y0 = top + roofH + H * 0.05, y1 = base - H * 0.09;
  for (let i = 0; i < cols; i++) {
    const cx = x + w * ((i + 0.5) / cols), cw = w * 0.2;
    g.fillStyle = P.paper; g.fillRect(cx - cw / 2, y0, cw, y1 - y0); g.lineWidth = 6; g.strokeRect(cx - cw / 2, y0, cw, y1 - y0);
    PILLARS[i].split(", ").forEach((t, k) => text(g, t, cx, y0 + (y1 - y0) * (0.4 + k * 0.2), MONO(Math.round(H * 0.042), 800), P.ink, "center", cw * 0.92));
  }
  g.fillStyle = P.sand; g.fillRect(x - 10, y1, w + 20, base - y1); g.lineWidth = 7; g.strokeRect(x - 10, y1, w + 20, base - y1);
}

export function SolutionsStation({ step }: { step: number }) {
  const all = step >= 5, live = step >= 0;
  return <group>
    {/* cộng đồng ở giữa */}
    <Card id="sol-people" w={crowdW(6, 1.7)} h={1.7} at={CENTER} on={live} draw={dCrowd(6, i => ({ body: [P.slate, P.sand, P.blueSoft, P.greenSoft][i % 4], phone: i % 2 === 0 }))} />
    {cap("CỘNG ĐỒNG MẠNG", CENTER[0], CENTER[1] + 0.6, live, C.ink, 0.2)}
    {THREATS.map((t, k) => {
      const tp = at(k, R_THREAT), sp = at(k, R_SHIELD), stop = at(k, R_SHIELD + 0.7), hit = at(k, 1.6), safe = step >= k;
      return <group key={k}>
        <Card id={`sol-t${k}`} w={t.w} h={t.h} at={tp} on={live} delay={0.1 * k} draw={t.draw} back={{ id: `sol-t${k}x`, draw: blocked(t.draw) }} flipped={safe} />
        {cap(t.label, tp[0], tp[1] + 0.55, live, safe ? C.grey : C.red, 0.16)}
        <InkPath pts={[at(k, R_THREAT - 0.9), hit]} on={live && !safe} delay={0.4 + 0.1 * k} arrow width={0.05} />
        <InkPath pts={[at(k, R_THREAT - 0.9), stop]} on={safe} delay={0.5} arrow width={0.05} color={P.slate2} flow={false} />
        <Impact at={[...at(k, R_SHIELD + 0.45), 1.0]} on={step === k} delay={1.05} size={0.9} />
        <Card id={`sol-s${k}`} w={1.8} h={2.2} at={sp} on={safe} flat={all} delay={0.25} ring={step === k ? P.blue : false} jolt={step === k} joltDelay={1.05} draw={drawShield(k)} />
      </group>;
    })}
    <Card id="sol-house" w={5.4} h={4.2} at={[CENTER[0], CENTER[1] - 1.1]} on={all} delay={0.3} ring={all} draw={generalHouse} />
  </group>;
}
