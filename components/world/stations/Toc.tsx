"use client";
// Trang 3 (Mục lục): "lộ trình hồ sơ". Một con đường mực đỏ uốn lượn trên trang, đi qua sáu cột mốc pop-up (mục I–VI).
// Cột mốc bật dựng lần lượt khi con đường vẽ tới; một tập hồ sơ nhỏ chạy dọc đường; điểm cuối "Giải pháp" được khoanh bút.
// Chỉ 7 tấm bìa nhỏ và một đường mực: nhẹ, không phải dựng lại cả 14 trang.
import { SECTIONS, SEC_COLOR } from "@/content/slides";
import { MONO, P, SANS, SERIF, book, crowd, magnifier, megaphone, orgChart, rr, shape, shield, star, text } from "../art";
import { Card, InkPath, type CarrierSpec, type Draw } from "../pop";

type G = CanvasRenderingContext2D;
/** chỗ đặt sáu cột mốc (x, z), con đường đi qua ngay phía trước mỗi cột */
const STOPS: [number, number][] = [[-1.7, 2.3], [0.2, 0.3], [1.9, 2.5], [3.5, 0.2], [4.9, 2.3], [6.2, 0.1]];
const SW = 1.9, SH = 2.5; // kích thước một cột mốc

const ICONS: ((g: G, cx: number, cy: number, s: number) => void)[] = [
  (g, cx, cy, s) => book(g, cx, cy, s * 0.62), // I. khái niệm
  (g, cx, cy, s) => magnifier(g, cx - s * 0.06, cy - s * 0.06, s * 0.7), // II. đặc điểm
  (g, cx, cy, s) => crowd(g, cx, cy + s * 0.42, s * 0.8, 3, i => ({ body: [P.slate, P.sand, P.blueSoft][i] })), // III. các dạng hội nhóm
  (g, cx, cy, s) => orgChart(g, cx - s * 0.5, cy - s * 0.38, s, s * 0.76, ""), // IV. hình thức thành lập
  (g, cx, cy, s) => megaphone(g, cx, cy, s * 0.7), // V. phương thức, thủ đoạn
  (g, cx, cy, s) => shield(g, cx, cy, s * 0.95, P.blueSoft, gg => star(gg, cx, cy - s * 0.04, s * 0.18, P.red)), // VI. giải pháp
];

/** cột mốc: biểu tượng tròn ở trên, biển tên có dải màu của mục, chữ số La Mã và số trang */
const drawStop = (k: number): Draw => (g, W, H) => {
  const sec = SECTIONS[k], col = SEC_COLOR[sec.n] ?? P.ink, lw = 6;
  // cọc gỗ
  rr(g, W / 2 - 9, H * 0.55, 18, H * 0.45 - 6, 5); shape(g, P.sand, 5);
  // biểu tượng trong vòng tròn
  g.beginPath(); g.arc(W / 2, H * 0.24, W * 0.3, 0, Math.PI * 2); shape(g, P.paper, lw, col);
  ICONS[k](g, W / 2, H * 0.24, W * 0.36);
  // biển tên
  const by = H * 0.52, bh = H * 0.3;
  rr(g, 10, by, W - 20, bh, 14); shape(g, P.paper, lw);
  g.fillStyle = col; g.fillRect(13, by + 3, W - 26, bh * 0.12);
  text(g, sec.n, W * 0.2, by + bh * 0.52, SERIF(Math.round(bh * 0.4), 800), col, "center");
  text(g, String(sec.to).padStart(2, "0"), W - 26, by + bh * 0.3, MONO(Math.round(bh * 0.13), 700), P.ink2, "right");
  text(g, sec.label, W * 0.6, by + bh * 0.68, SANS(Math.round(bh * 0.17), 800), P.ink, "center", W * 0.62);
};

/** tập hồ sơ nhỏ chạy dọc con đường */
const FOLDER: CarrierSpec = { id: "toc-folder", w: 0.75, h: 0.58, count: 1, draw: (g, W, H) => {
  rr(g, 8, H * 0.12, W * 0.42, H * 0.2, 8); shape(g, P.ochreSoft, 5);
  rr(g, 8, H * 0.24, W - 16, H * 0.68, 10); shape(g, P.ochreSoft, 5);
  text(g, "HỒ SƠ", W / 2, H * 0.6, MONO(Math.round(H * 0.17), 800), P.red);
} };

export function TocStation() {
  // con đường đi ngay trước chân mỗi cột mốc, bắt đầu từ mép trái phía trước trang
  const road: [number, number][] = [[-3.4, 3.6], ...STOPS.map(([x, z]) => [x, z + 0.75] as [number, number])];
  return <group>
    <InkPath pts={road} dash={0.32} width={0.06} speed={0.7} delay={0.2} flow carrier={FOLDER} />
    {STOPS.map(([x, z], k) => <Card key={k} id={`toc-stop${k}`} w={SW} h={SH} at={[x, z]} delay={0.45 + k * 0.32} rotY={-x * 0.03}
      ring={k === STOPS.length - 1 ? P.blue : undefined} trail={false} draw={drawStop(k)} />)}
  </group>;
}
