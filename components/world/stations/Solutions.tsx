"use client";
// Mục VI: giải pháp. "Lá chắn bảo vệ cộng đồng mạng":
// cộng đồng đứng giữa trang, năm thủ đoạn xếp vòng cung phía sau, mũi tên đỏ nhắm vào cộng đồng.
// Mỗi nhịp, một tấm khiên giải pháp bật dựng chắn ngang: mũi tên bị chặn, thẻ thủ đoạn lật mặt "ĐÃ CHẶN".
// Nhịp cuối: các khiên nằm xuống, "ngôi nhà giải pháp chung" bốn cột trụ dựng lên che chở cộng đồng.
import { P, book, chat, circ, doc, eye, globe, groupPage, handshake, magnifier, megaphone, rr, shape, shield, stamp, star, text, MONO, SERIF, SANS } from "../art";
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

/** Ngôi nhà giải pháp chung: mái tam giác có sao, băng chữ, bốn cột kiểu cổ điển (đầu cột, thân có rãnh, chân cột),
 *  mỗi cột treo một biển tên, đặt trên ba bậc thềm. Khoảng giữa các cột để trống (thấy nền giấy phía sau). */
const PILLARS: [string, string][] = [["CƠ CHẾ", "PHÁP LUẬT"], ["LỰC LƯỢNG", "KHOA HỌC CN"], ["GIA ĐÌNH", "NHÀ TRƯỜNG"], ["PHÒNG NGỪA", "XỬ LÝ"]];
const PILLAR_C = [P.red, P.blue, P.green, P.ochre];
function generalHouse(g: G, W: number, H: number) {
  const stone = "#f6efe1", stone2 = "#e7dbc3", groove = "rgba(90,70,40,.28)", lw = Math.max(5, H * 0.006);
  const x0 = W * 0.08, x1 = W * 0.92, cw = x1 - x0;
  const roofT = H * 0.035, roofB = H * 0.25, cornB = roofB + H * 0.024, friezeB = H * 0.33, capB = friezeB + H * 0.05, stepT = H * 0.85, shaftB = stepT - H * 0.03;
  const rect = (x: number, y: number, w: number, h: number, fill: string, l = lw) => { g.beginPath(); g.rect(x, y, w, h); shape(g, fill, l); };
  // mái + tam giác trang trí bên trong
  g.beginPath(); g.moveTo(x0 - W * 0.045, roofB); g.lineTo(W / 2, roofT); g.lineTo(x1 + W * 0.045, roofB); g.closePath(); shape(g, stone, lw);
  g.beginPath(); g.moveTo(x0 + W * 0.06, roofB - H * 0.028); g.lineTo(W / 2, roofT + H * 0.055); g.lineTo(x1 - W * 0.06, roofB - H * 0.028); g.closePath(); shape(g, "#efe2c8", lw * 0.6);
  star(g, W / 2, roofT + (roofB - roofT) * 0.6, H * 0.05, P.red);
  // gờ mái, băng chữ
  rect(x0 - W * 0.045, roofB, cw + W * 0.09, cornB - roofB, stone2);
  rect(x0 - W * 0.015, cornB, cw + W * 0.03, friezeB - cornB, stone);
  text(g, "GIẢI PHÁP CHUNG", W / 2, (cornB + friezeB) / 2 + H * 0.004, SERIF(Math.round(H * 0.048), 800), P.ink, "center", cw * 0.8);
  // bốn cột
  const centers = Array.from({ length: 4 }, (_, i) => x0 + cw * ((i + 0.5) / 4)), w = cw * 0.1;
  for (const cx of centers) {
    rect(cx - w * 0.8, friezeB, w * 1.6, H * 0.022, stone2);                    // đầu cột
    rect(cx - w * 0.64, friezeB + H * 0.022, w * 1.28, capB - friezeB - H * 0.022, stone, lw * 0.8);
    rect(cx - w / 2, capB, w, shaftB - capB, stone);                              // thân cột
    for (const k of [-0.25, 0, 0.25]) { g.beginPath(); g.moveTo(cx + k * w, capB + H * 0.012); g.lineTo(cx + k * w, shaftB - H * 0.012); g.lineWidth = lw * 0.5; g.strokeStyle = groove; g.stroke(); }
    rect(cx - w * 0.66, shaftB, w * 1.32, stepT - shaftB, stone2, lw * 0.8);       // chân cột
  }
  // ba bậc thềm
  rect(x0 - W * 0.02, stepT, cw + W * 0.04, H * 0.04, stone);
  rect(x0 - W * 0.045, stepT + H * 0.04, cw + W * 0.09, H * 0.045, stone2);
  rect(x0 - W * 0.07, stepT + H * 0.085, cw + W * 0.14, H * 0.045, stone);
  // biển tên treo trên từng cột
  const pw = cw * 0.225, ph = H * 0.15, py = capB + (shaftB - capB) * 0.42;
  centers.forEach((cx, i) => {
    g.beginPath(); g.moveTo(cx - pw * 0.22, py - ph / 2); g.lineTo(cx, py - ph / 2 - H * 0.05); g.lineTo(cx + pw * 0.22, py - ph / 2); g.lineWidth = lw * 0.6; g.strokeStyle = P.ink; g.stroke(); // dây treo
    circ(g, cx, py - ph / 2 - H * 0.05, H * 0.008); shape(g, P.ink, 0);
    rr(g, cx - pw / 2, py - ph / 2, pw, ph, H * 0.012); shape(g, P.paper, lw * 0.85);
    g.fillStyle = PILLAR_C[i]; g.fillRect(cx - pw / 2 + lw * 0.6, py - ph / 2 + lw * 0.6, pw - lw * 1.2, H * 0.016);
    PILLARS[i].forEach((t, k) => text(g, t, cx, py - ph * 0.06 + k * ph * 0.34, SANS(Math.round(H * 0.037), 800), P.ink, "center", pw * 0.86));
  });
}

// Nhịp cuối: cộng đồng tiến lên phía trước, ngôi nhà dựng lùi phía sau. Với góc máy nhìn xuống, đỉnh đầu đám đông
// rơi dưới chân nhà nên không che cột; các khiên gập lại, thẻ thủ đoạn nhạt đi, nhãn của chúng ẩn.
const PEOPLE_ALL: [number, number] = [0, 2.9], HOUSE_AT: [number, number] = [0, -1.6];
export function SolutionsStation({ step }: { step: number }) {
  const all = step >= 5, live = step >= 0, people = all ? PEOPLE_ALL : CENTER;
  return <group>
    {/* cộng đồng ở giữa */}
    <Card id="sol-people" w={crowdW(6, 1.7)} h={1.7} at={people} on={live} speed={0.9} draw={dCrowd(6, i => ({ body: [P.slate, P.sand, P.blueSoft, P.greenSoft][i % 4], phone: i % 2 === 0 }))} />
    {cap("CỘNG ĐỒNG MẠNG", people[0], people[1] + 0.6, live, C.ink, 0.2)}
    {THREATS.map((t, k) => {
      const tp = at(k, R_THREAT), sp = at(k, R_SHIELD), stop = at(k, R_SHIELD + 0.7), hit = at(k, 1.6), safe = step >= k;
      return <group key={k}>
        <Card id={`sol-t${k}`} w={t.w} h={t.h} at={tp} on={live} delay={0.1 * k} draw={t.draw} back={{ id: `sol-t${k}x`, draw: blocked(t.draw) }} flipped={safe} dim={all} />
        {cap(t.label, tp[0], tp[1] + 0.55, live && !all, safe ? C.grey : C.red, 0.16)}
        <InkPath pts={[at(k, R_THREAT - 0.9), hit]} on={live && !safe} delay={0.4 + 0.1 * k} arrow width={0.05} />
        <InkPath pts={[at(k, R_THREAT - 0.9), stop]} on={safe} delay={0.5} arrow width={0.05} color={P.slate2} flow={false} />
        <Impact at={[...at(k, R_SHIELD + 0.45), 1.0]} on={step === k} delay={1.05} size={0.9} />
        <Card id={`sol-s${k}`} w={1.8} h={2.2} at={sp} on={safe && !all} delay={0.25} ring={step === k ? P.blue : false} jolt={step === k} joltDelay={1.05} draw={drawShield(k)} />
      </group>;
    })}
    <Card id="sol-house" w={6.4} h={4.6} at={HOUSE_AT} on={all} delay={0.55} draw={generalHouse} />
  </group>;
}
