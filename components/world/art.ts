// Thư viện hình minh họa vẽ tay bằng canvas: người, điện thoại, màn hình, biểu tượng.
// Mỗi hình được in lên một tấm bìa cắt rời (có viền giấy trắng) rồi dựng đứng trên trang hồ sơ.
// Phong cách: nét mực đậm, mảng màu giấy, một màu nhấn đỏ son.

export const P = {
  ink: "#23262b", ink2: "#4a4d52", paper: "#fbf8f1", cream: "#efe6d4", sand: "#e2d4b6", slate: "#c7ccd2", slate2: "#9aa3ad",
  red: "#b0261f", redSoft: "#e7b7ae", ochre: "#9c7419", ochreSoft: "#ecd9a6", green: "#2f6652", greenSoft: "#bfd8c9", blue: "#2a4f7a", blueSoft: "#c3d3e6", skin: "#f1e3cc",
};
type G = CanvasRenderingContext2D;
export const SERIF = (px: number, w = 700) => `${w} ${px}px "Noto Serif", Georgia, serif`;
export const SANS = (px: number, w = 600) => `${w} ${px}px "Be Vietnam Pro", system-ui, sans-serif`;
export const MONO = (px: number, w = 600) => `${w} ${px}px "JetBrains Mono", monospace`;

/* ---------------- nét cơ bản ---------------- */
export function rr(g: G, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
/** tô và viền mực */
export function shape(g: G, fill: string | null, lw = 6, ink = P.ink) { if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.lineWidth = lw; g.strokeStyle = ink; g.lineJoin = "round"; g.lineCap = "round"; g.stroke(); } }
export function circ(g: G, x: number, y: number, r: number) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); }
export function line(g: G, pts: [number, number][], lw = 6, color = P.ink, dash: number[] = []) {
  g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.setLineDash(dash); g.lineWidth = lw; g.strokeStyle = color; g.lineCap = "round"; g.lineJoin = "round"; g.stroke(); g.setLineDash([]);
}
export function text(g: G, t: string, x: number, y: number, font: string, color = P.ink, align: CanvasTextAlign = "center", maxW?: number) {
  g.font = font; g.fillStyle = color; g.textAlign = align; g.textBaseline = "middle";
  if (maxW && g.measureText(t).width > maxW) { const k = maxW / g.measureText(t).width; g.font = font.replace(/(\d+)px/, (_, n) => `${Math.floor(+n * k)}px`); }
  g.fillText(t, x, y); g.textAlign = "left";
}
/** các dòng chữ giả (thanh xám) */
export function lines(g: G, x: number, y: number, w: number, n: number, gap = 16, color = P.slate2, lw = 7) {
  for (let i = 0; i < n; i++) line(g, [[x, y + i * gap], [x + w * (i === n - 1 ? 0.6 : 0.95 - (i % 3) * 0.08), y + i * gap]], lw, color);
}

/* ---------------- con người ---------------- */
export type PersonOpt = {
  body?: string; head?: string; mask?: boolean; hood?: boolean; cap?: boolean; bag?: boolean; tie?: boolean; mark?: boolean; question?: boolean;
  phone?: boolean; laptop?: boolean; angry?: boolean; star?: boolean; badge?: string;
};
/** Người đứng, chân tại (cx, by), cao s pixel. */
export function person(g: G, cx: number, by: number, s: number, o: PersonOpt = {}) {
  const lw = Math.max(4, s * 0.028), hr = s * 0.13, hy = by - s * 0.8, body = o.body ?? P.slate, sw = s * 0.27;
  if (o.hood) { hooded(g, cx, by, s, body, lw, !!o.laptop); if (o.mark) { g.beginPath(); g.ellipse(cx, by - s * 0.55, s * 0.4, s * 0.52, 0.08, 0, Math.PI * 2); g.lineWidth = lw * 1.1; g.strokeStyle = P.red; g.stroke(); } return; }
  // thân
  g.beginPath(); g.moveTo(cx - sw, by); g.lineTo(cx - sw, by - s * 0.42); g.quadraticCurveTo(cx - sw, by - s * 0.62, cx - sw * 0.55, by - s * 0.63);
  g.lineTo(cx + sw * 0.55, by - s * 0.63); g.quadraticCurveTo(cx + sw, by - s * 0.62, cx + sw, by - s * 0.42); g.lineTo(cx + sw, by); g.closePath(); shape(g, body, lw);
  if (o.tie) { g.beginPath(); g.moveTo(cx, by - s * 0.62); g.lineTo(cx - s * 0.03, by - s * 0.45); g.lineTo(cx, by - s * 0.38); g.lineTo(cx + s * 0.03, by - s * 0.45); g.closePath(); shape(g, P.red, lw * 0.6); }
  if (o.bag) { rr(g, cx + sw * 0.6, by - s * 0.55, sw * 0.7, s * 0.3, s * 0.04); shape(g, P.ochreSoft, lw * 0.8); }
  if (o.star) { star(g, cx, by - s * 0.45, s * 0.07, P.ochre); }
  if (o.badge) { rr(g, cx - sw * 0.6, by - s * 0.32, sw * 1.2, s * 0.12, 4); shape(g, P.paper, lw * 0.6); text(g, o.badge, cx, by - s * 0.26, MONO(Math.round(s * 0.07), 700), P.ink); }
  // đầu
  circ(g, cx, hy, hr); shape(g, o.head ?? P.skin, lw);
  if (o.mask) { // mặt nạ ẩn danh
    g.beginPath(); g.ellipse(cx, hy + hr * 0.05, hr * 0.8, hr * 0.9, 0, 0, Math.PI * 2); shape(g, P.paper, lw * 0.6);
    line(g, [[cx - hr * 0.45, hy - hr * 0.15], [cx - hr * 0.15, hy - hr * 0.1]], lw * 0.7); line(g, [[cx + hr * 0.15, hy - hr * 0.1], [cx + hr * 0.45, hy - hr * 0.15]], lw * 0.7);
    line(g, [[cx - hr * 0.35, hy + hr * 0.4], [cx, hy + hr * 0.5], [cx + hr * 0.35, hy + hr * 0.4]], lw * 0.6);
  } else if (o.angry) {
    line(g, [[cx - hr * 0.5, hy - hr * 0.35], [cx - hr * 0.15, hy - hr * 0.15]], lw * 0.7); line(g, [[cx + hr * 0.5, hy - hr * 0.35], [cx + hr * 0.15, hy - hr * 0.15]], lw * 0.7);
    line(g, [[cx - hr * 0.3, hy + hr * 0.45], [cx + hr * 0.3, hy + hr * 0.45]], lw * 0.7);
  }
  if (o.question) text(g, "?", cx, hy + 2, SERIF(Math.round(hr * 1.4), 800), P.paper);
  if (o.cap) { g.beginPath(); g.moveTo(cx - hr * 1.3, hy - hr * 0.75); g.lineTo(cx, hy - hr * 1.25); g.lineTo(cx + hr * 1.3, hy - hr * 0.75); g.lineTo(cx, hy - hr * 0.35); g.closePath(); shape(g, P.ink, lw * 0.6); }
  if (o.phone) { rr(g, cx + sw * 0.2, by - s * 0.5, s * 0.12, s * 0.2, 5); shape(g, P.ink, lw * 0.6); rr(g, cx + sw * 0.2 + 5, by - s * 0.5 + 6, s * 0.12 - 10, s * 0.2 - 14, 2); shape(g, P.blueSoft, 0); }
  if (o.laptop) { g.beginPath(); g.moveTo(cx - sw * 1.15, by - s * 0.18); g.lineTo(cx + sw * 1.15, by - s * 0.18); g.lineTo(cx + sw * 0.95, by - s * 0.42); g.lineTo(cx - sw * 0.95, by - s * 0.42); g.closePath(); shape(g, P.slate2, lw * 0.8); }
  if (o.mark) { g.beginPath(); g.ellipse(cx, by - s * 0.5, s * 0.31, s * 0.47, 0.06, 0, Math.PI * 2); g.lineWidth = lw * 1.1; g.strokeStyle = P.red; g.stroke(); }
}
/** Kẻ giấu mặt: hoodie trùm đầu, kính đen, khẩu trang che nửa mặt; cùng tỉ lệ với người thường. Có thể cầm laptop (nhìn từ phía sau). */
function hooded(g: G, cx: number, by: number, s: number, body: string, lw: number, withLaptop: boolean) {
  const hr = s * 0.13, hy = by - s * 0.8, sw = s * 0.29, seam = "#5b6068", glass = "#15171a", mask = "#3c4047";
  // mũ trùm phía sau đầu, rộng hơn đầu, nối xuống vai
  g.beginPath(); g.ellipse(cx, hy - hr * 0.05, hr * 1.5, hr * 1.6, 0, 0, Math.PI * 2); shape(g, body, lw);
  // thân áo: vai tròn, rộng hơn người thường một chút
  g.beginPath(); g.moveTo(cx - sw, by); g.lineTo(cx - sw, by - s * 0.4); g.quadraticCurveTo(cx - sw, by - s * 0.62, cx - sw * 0.5, by - s * 0.645);
  g.lineTo(cx + sw * 0.5, by - s * 0.645); g.quadraticCurveTo(cx + sw, by - s * 0.62, cx + sw, by - s * 0.4); g.lineTo(cx + sw, by); g.closePath(); shape(g, body, lw);
  // tay áo
  for (const k of [-1, 1]) line(g, [[cx + k * sw * 0.6, by - s * 0.5], [cx + k * sw * 0.64, by - s * 0.05]], lw * 0.5, seam);
  // khuôn mặt, vành mũ phủ trán
  circ(g, cx, hy, hr); shape(g, P.skin, lw);
  g.save(); circ(g, cx, hy, hr); g.clip();
  g.beginPath(); g.ellipse(cx, hy - hr * 1.02, hr * 1.35, hr * 0.72, 0, 0, Math.PI * 2); g.fillStyle = body; g.fill();
  // khẩu trang che nửa dưới mặt, có hai nếp gấp
  g.fillStyle = mask; g.fillRect(cx - hr, hy + hr * 0.2, hr * 2, hr);
  g.strokeStyle = "#5b6068"; g.lineWidth = lw * 0.35;
  for (const dy of [0.45, 0.68]) { g.beginPath(); g.moveTo(cx - hr * 0.7, hy + hr * dy); g.lineTo(cx + hr * 0.7, hy + hr * dy); g.stroke(); }
  g.restore();
  circ(g, cx, hy, hr); g.lineWidth = lw; g.strokeStyle = P.ink; g.stroke();
  // kính đen
  for (const k of [-1, 1]) { rr(g, cx + (k < 0 ? -hr * 0.8 : hr * 0.1), hy - hr * 0.2, hr * 0.7, hr * 0.36, hr * 0.12); shape(g, glass, lw * 0.4); }
  line(g, [[cx - hr * 0.1, hy - hr * 0.08], [cx + hr * 0.1, hy - hr * 0.08]], lw * 0.4, glass);
  g.fillStyle = "rgba(255,255,255,.55)"; g.fillRect(cx - hr * 0.68, hy - hr * 0.12, hr * 0.18, hr * 0.06); g.fillRect(cx + hr * 0.22, hy - hr * 0.12, hr * 0.18, hr * 0.06);
  // dây rút áo
  for (const k of [-1, 1]) { line(g, [[cx + k * s * 0.05, by - s * 0.63], [cx + k * s * 0.06, by - s * 0.5]], lw * 0.45, P.paper); circ(g, cx + k * s * 0.06, by - s * 0.495, lw * 0.55); shape(g, P.paper, 0); }
  if (!withLaptop) { // túi áo trước bụng
    g.beginPath(); g.moveTo(cx - sw * 0.55, by - s * 0.1); g.lineTo(cx - sw * 0.42, by - s * 0.27); g.lineTo(cx + sw * 0.42, by - s * 0.27); g.lineTo(cx + sw * 0.55, by - s * 0.1); g.lineWidth = lw * 0.5; g.strokeStyle = seam; g.stroke();
    return;
  }
  // laptop cầm trước ngực, nhìn từ phía sau: nắp + đế
  rr(g, cx - s * 0.33, by - s * 0.44, s * 0.66, s * 0.33, s * 0.035); shape(g, P.slate, lw);
  circ(g, cx, by - s * 0.275, s * 0.04); shape(g, P.slate2, lw * 0.5);
  g.beginPath(); g.moveTo(cx - s * 0.4, by - s * 0.11); g.lineTo(cx + s * 0.4, by - s * 0.11); g.lineTo(cx + s * 0.37, by - s * 0.065); g.lineTo(cx - s * 0.37, by - s * 0.065); g.closePath(); shape(g, P.slate2, lw * 0.8);
}
/** Nhóm người đứng thành hàng. */
export function crowd(g: G, cx: number, by: number, s: number, n: number, opts: (i: number) => PersonOpt = () => ({}), spread = 0.55) {
  const step = s * spread; for (let i = 0; i < n; i++) { const row = i % 2, x = cx + (i - (n - 1) / 2) * step; person(g, x, by - row * s * 0.06, s * (row ? 0.92 : 1), opts(i)); }
}

/* ---------------- thiết bị ---------------- */
/** Điện thoại; screen vẽ nội dung màn hình trong khung (x, y, w, h). */
export function phone(g: G, x: number, y: number, w: number, h: number, screen?: (g: G, x: number, y: number, w: number, h: number) => void) {
  rr(g, x, y, w, h, w * 0.12); shape(g, P.ink, 8);
  const p = w * 0.06; rr(g, x + p, y + p * 2.2, w - p * 2, h - p * 4.2, w * 0.05); shape(g, P.paper, 0);
  g.save(); rr(g, x + p, y + p * 2.2, w - p * 2, h - p * 4.2, w * 0.05); g.clip(); screen?.(g, x + p, y + p * 2.2, w - p * 2, h - p * 4.2); g.restore();
  rr(g, x + w * 0.38, y + p * 0.8, w * 0.24, p * 0.6, 4); shape(g, "#555", 0);
}
export function laptop(g: G, x: number, y: number, w: number, h: number, screen?: (g: G, x: number, y: number, w: number, h: number) => void) {
  rr(g, x, y, w, h * 0.86, 14); shape(g, P.ink, 8);
  const p = w * 0.035; rr(g, x + p, y + p, w - p * 2, h * 0.86 - p * 2, 6); shape(g, P.paper, 0);
  g.save(); rr(g, x + p, y + p, w - p * 2, h * 0.86 - p * 2, 6); g.clip(); screen?.(g, x + p, y + p, w - p * 2, h * 0.86 - p * 2); g.restore();
  g.beginPath(); g.moveTo(x - w * 0.06, y + h); g.lineTo(x + w * 1.06, y + h); g.lineTo(x + w, y + h * 0.86); g.lineTo(x, y + h * 0.86); g.closePath(); shape(g, P.slate2, 7);
}
/** Trang nhóm mạng xã hội: thanh tên nhóm, ảnh bìa, các bài đăng. */
export function groupPage(g: G, x: number, y: number, w: number, h: number, o: { name: string; members?: string; alert?: boolean; locked?: boolean; cover?: string }) {
  g.fillStyle = o.cover ?? (o.alert ? P.redSoft : P.blueSoft); g.fillRect(x, y, w, h * 0.2);
  if (o.locked) { lock(g, x + w / 2, y + h * 0.1, h * 0.05, P.ink); }
  else crowd(g, x + w / 2, y + h * 0.2, h * 0.13, 5, () => ({ body: o.alert ? P.red : P.slate2 }), 0.42);
  text(g, o.name, x + w / 2, y + h * 0.26, SANS(Math.round(w * 0.075), 800), P.ink, "center", w * 0.9);
  text(g, o.members ?? "12.400 thành viên", x + w / 2, y + h * 0.31, SANS(Math.round(w * 0.05), 500), P.ink2);
  for (let i = 0; i < 3; i++) {
    const py = y + h * (0.37 + i * 0.21); circ(g, x + w * 0.12, py + h * 0.02, w * 0.055); shape(g, i === 0 && o.alert ? P.red : P.slate, 3);
    lines(g, x + w * 0.22, py + h * 0.005, w * 0.32, 1, 0, P.ink2, 6);
    if (i === 0 && o.alert) { rr(g, x + w * 0.06, py + h * 0.06, w * 0.88, h * 0.11, 8); shape(g, "#f6dcd6", 4, P.red); text(g, "TIN SAI LỆCH", x + w / 2, py + h * 0.115, MONO(Math.round(w * 0.065), 800), P.red); }
    else lines(g, x + w * 0.08, py + h * 0.07, w * 0.84, 3, h * 0.035, P.slate, 6);
  }
}
export function chat(g: G, x: number, y: number, w: number, h: number, o: { locked?: boolean; red?: boolean; title?: string } = {}) {
  g.fillStyle = o.red ? P.redSoft : P.blueSoft; g.fillRect(x, y, w, h * 0.13);
  text(g, o.title ?? "Nhóm kín", x + w * 0.5, y + h * 0.065, SANS(Math.round(w * 0.075), 700), P.ink, "center", w * 0.7);
  if (o.locked) lock(g, x + w * 0.88, y + h * 0.065, h * 0.03, P.ink);
  for (let i = 0; i < 5; i++) {
    const left = i % 2 === 0, by = y + h * (0.2 + i * 0.15), bw = w * (0.5 + ((i * 37) % 20) / 100);
    rr(g, left ? x + w * 0.06 : x + w * 0.94 - bw, by, bw, h * 0.1, 14); shape(g, left ? P.paper : (o.red ? P.redSoft : P.greenSoft), 4);
    lines(g, (left ? x + w * 0.06 : x + w * 0.94 - bw) + 14, by + h * 0.035, bw - 40, 2, h * 0.032, P.slate2, 5);
  }
}

/* ---------------- biểu tượng ---------------- */
export function lock(g: G, cx: number, cy: number, s: number, fill = P.ochre) {
  g.beginPath(); g.arc(cx, cy - s * 0.4, s * 0.62, Math.PI, 0); g.lineWidth = s * 0.28; g.strokeStyle = P.ink; g.stroke();
  rr(g, cx - s, cy - s * 0.4, s * 2, s * 1.5, s * 0.25); shape(g, fill, Math.max(3, s * 0.18)); circ(g, cx, cy + s * 0.25, s * 0.2); shape(g, P.ink, 0);
}
export function star(g: G, cx: number, cy: number, r: number, fill = P.ochre, lw = 0) {
  g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? r * 0.42 : r; g.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); } g.closePath(); shape(g, fill, lw);
}
const LAND: [number, number][][] = [
  // châu Âu
  [[-0.34, -0.22], [-0.3, -0.36], [-0.16, -0.4], [-0.08, -0.56], [0.06, -0.62], [0.2, -0.56], [0.24, -0.4], [0.14, -0.3], [0.02, -0.26], [-0.1, -0.24], [-0.2, -0.18]],
  // châu Phi
  [[-0.44, -0.04], [-0.3, -0.14], [-0.08, -0.14], [0.1, -0.1], [0.2, 0.02], [0.34, 0.06], [0.28, 0.24], [0.17, 0.4], [0.1, 0.6], [-0.01, 0.66], [-0.08, 0.5], [-0.12, 0.3], [-0.22, 0.18], [-0.4, 0.12]],
  // châu Á
  [[0.24, -0.5], [0.46, -0.66], [0.78, -0.58], [1.0, -0.3], [0.96, -0.02], [0.78, 0.08], [0.64, 0.26], [0.56, 0.1], [0.44, 0.08], [0.36, -0.06], [0.26, -0.24]],
  // Nam Mỹ (khuất sau vành)
  [[-1.0, 0.04], [-0.8, 0.02], [-0.72, 0.2], [-0.8, 0.5], [-0.98, 0.56]],
];
/** Quả địa cầu: đại dương, lục địa, lưới kinh vĩ tuyến và bóng khối. */
export function globe(g: G, cx: number, cy: number, r: number, fill = P.blueSoft) {
  circ(g, cx, cy, r); g.fillStyle = fill; g.fill();
  g.save(); circ(g, cx, cy, r); g.clip();
  for (const poly of LAND) { g.beginPath(); poly.forEach(([x, y], k) => (k ? g.lineTo(cx + x * r, cy + y * r) : g.moveTo(cx + x * r, cy + y * r))); g.closePath(); shape(g, P.greenSoft, Math.max(2, r * 0.025), P.green); }
  g.globalAlpha = 0.35; g.lineWidth = Math.max(1.5, r * 0.012); g.strokeStyle = P.ink;
  for (const k of [0.38, 0.75]) { g.beginPath(); g.ellipse(cx, cy, r * k, r, 0, 0, Math.PI * 2); g.stroke(); }
  g.beginPath(); g.moveTo(cx, cy - r); g.lineTo(cx, cy + r); g.stroke();
  for (const k of [-0.55, 0, 0.55]) { const hw = r * Math.sqrt(1 - k * k); g.beginPath(); g.moveTo(cx - hw, cy + k * r); g.lineTo(cx + hw, cy + k * r); g.stroke(); }
  g.globalAlpha = 1;
  // bóng khối
  const sh = g.createRadialGradient(cx - r * 0.45, cy - r * 0.45, r * 0.2, cx, cy, r * 1.05);
  sh.addColorStop(0, "rgba(255,255,255,0.35)"); sh.addColorStop(0.55, "rgba(255,255,255,0)"); sh.addColorStop(1, "rgba(35,38,43,0.28)");
  g.fillStyle = sh; g.fillRect(cx - r, cy - r, r * 2, r * 2);
  g.restore();
  circ(g, cx, cy, r); shape(g, null, Math.max(4, r * 0.05));
}
/** Địa cầu để bàn: quả cầu nghiêng trên vành đồng và chân đế. */
export function deskGlobe(g: G, cx: number, cy: number, r: number, fill = P.blueSoft) {
  const lw = Math.max(4, r * 0.05), base = cy + r * 1.42;
  line(g, [[cx, cy + r * 1.13], [cx, base - r * 0.06]], lw * 1.6, P.ink);
  g.beginPath(); g.ellipse(cx, base, r * 0.55, r * 0.13, 0, 0, Math.PI * 2); shape(g, P.ochre, lw);
  g.save(); g.translate(cx, cy); g.rotate(-0.4); globe(g, 0, 0, r, fill); g.restore();
  g.beginPath(); g.arc(cx, cy, r * 1.13, -Math.PI * 0.5, Math.PI * 0.5); g.lineWidth = lw * 1.4; g.strokeStyle = P.ink; g.stroke();
  g.beginPath(); g.arc(cx, cy, r * 1.13, -Math.PI * 0.5, Math.PI * 0.5); g.lineWidth = lw * 0.7; g.strokeStyle = P.ochreSoft; g.stroke();
}
export function megaphone(g: G, cx: number, cy: number, s: number, fill = P.red) {
  g.beginPath(); g.moveTo(cx - s * 0.6, cy - s * 0.2); g.lineTo(cx + s * 0.5, cy - s * 0.6); g.lineTo(cx + s * 0.5, cy + s * 0.6); g.lineTo(cx - s * 0.6, cy + s * 0.2); g.closePath(); shape(g, fill, 7);
  rr(g, cx - s * 0.85, cy - s * 0.22, s * 0.28, s * 0.44, 6); shape(g, P.ink, 0);
  for (let i = 1; i <= 3; i++) { g.beginPath(); g.arc(cx + s * 0.55, cy, s * 0.25 * i, -0.6, 0.6); g.lineWidth = 6; g.strokeStyle = fill; g.stroke(); }
}
export function playIcon(g: G, x: number, y: number, w: number, h: number) {
  rr(g, x, y, w, h, 16); shape(g, P.red, 6); g.beginPath(); g.moveTo(x + w * 0.4, y + h * 0.28); g.lineTo(x + w * 0.66, y + h * 0.5); g.lineTo(x + w * 0.4, y + h * 0.72); g.closePath(); shape(g, P.paper, 0);
}
export function doc(g: G, x: number, y: number, w: number, h: number, o: { title?: string; stamp?: string; fill?: string; torn?: boolean; lines?: number } = {}) {
  g.beginPath(); g.moveTo(x, y); g.lineTo(x + w * 0.8, y); g.lineTo(x + w, y + w * 0.2); g.lineTo(x + w, y + h);
  if (o.torn) for (let i = 10; i >= 0; i--) g.lineTo(x + (w * i) / 10, y + h - (i % 2 ? 18 : 0)); else g.lineTo(x, y + h);
  g.closePath(); shape(g, o.fill ?? P.paper, 6);
  if (o.title) text(g, o.title, x + w / 2, y + h * 0.13, SERIF(Math.round(w * 0.1), 800), P.ink, "center", w * 0.8);
  lines(g, x + w * 0.12, y + h * (o.title ? 0.26 : 0.16), w * 0.76, o.lines ?? 6, h * 0.09, P.slate2, 6);
  if (o.stamp) stamp(g, x + w * 0.55, y + h * 0.78, o.stamp, w * 0.075);
}
export function stamp(g: G, cx: number, cy: number, t: string, px: number, color = P.red, rot = -0.14) {
  g.save(); g.translate(cx, cy); g.rotate(rot); g.font = MONO(Math.round(px), 800); const tw = g.measureText(t).width;
  g.lineWidth = px * 0.16; g.strokeStyle = color; g.strokeRect(-tw / 2 - px * 0.5, -px * 0.85, tw + px, px * 1.7);
  g.fillStyle = color; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(t, 0, 2); g.restore();
}
export function money(g: G, x: number, y: number, w: number, h: number) {
  for (let i = 2; i >= 0; i--) { rr(g, x + i * 10, y - i * 10, w, h, 8); shape(g, P.greenSoft, 6); }
  circ(g, x + w / 2, y + h / 2, h * 0.28); shape(g, P.paper, 5); text(g, "$", x + w / 2, y + h / 2 + 2, SERIF(Math.round(h * 0.4), 800), P.green);
}
export function envelope(g: G, x: number, y: number, w: number, h: number, fill = P.paper) {
  rr(g, x, y, w, h, 8); shape(g, fill, 6); line(g, [[x + 4, y + 6], [x + w / 2, y + h * 0.58], [x + w - 4, y + 6]], 6);
}
export function box(g: G, x: number, y: number, w: number, h: number) {
  g.beginPath(); g.rect(x, y, w, h); shape(g, P.sand, 6); line(g, [[x + w / 2, y], [x + w / 2, y + h]], 5); line(g, [[x, y + h * 0.3], [x + w, y + h * 0.3]], 5, P.ochre);
}
/** Trụ sở cơ quan nhà nước: mái tam giác, cột, ngôi sao. */
export function building(g: G, cx: number, by: number, w: number, o: { star?: boolean; cracked?: boolean } = {}) {
  const h = w * 0.62;
  g.beginPath(); g.moveTo(cx - w * 0.55, by - h * 0.72); g.lineTo(cx, by - h * 1.12); g.lineTo(cx + w * 0.55, by - h * 0.72); g.closePath(); shape(g, P.cream, 7);
  if (o.star) star(g, cx, by - h * 0.86, w * 0.075, P.red);
  g.beginPath(); g.rect(cx - w * 0.48, by - h * 0.72, w * 0.96, h * 0.72); shape(g, P.paper, 7);
  for (let i = 0; i < 5; i++) { const x = cx - w * 0.38 + i * w * 0.19; g.beginPath(); g.rect(x - w * 0.035, by - h * 0.64, w * 0.07, h * 0.58); shape(g, P.cream, 5); }
  g.beginPath(); g.rect(cx - w * 0.55, by - 14, w * 1.1, 14); shape(g, P.sand, 6);
  if (o.cracked) line(g, [[cx + w * 0.1, by - h * 1.05], [cx + w * 0.02, by - h * 0.8], [cx + w * 0.14, by - h * 0.6], [cx + w * 0.04, by - h * 0.35]], 6, P.red);
}
export function house(g: G, cx: number, by: number, w: number, fill = P.cream) {
  const h = w * 0.7; g.beginPath(); g.moveTo(cx - w * 0.6, by - h * 0.6); g.lineTo(cx, by - h * 1.1); g.lineTo(cx + w * 0.6, by - h * 0.6); g.closePath(); shape(g, P.red, 7);
  g.beginPath(); g.rect(cx - w * 0.45, by - h * 0.6, w * 0.9, h * 0.6); shape(g, fill, 7); g.beginPath(); g.rect(cx - w * 0.1, by - h * 0.35, w * 0.2, h * 0.35); shape(g, P.ochreSoft, 5);
}
export function tree(g: G, cx: number, by: number, s: number) {
  g.beginPath(); g.rect(cx - s * 0.06, by - s * 0.4, s * 0.12, s * 0.4); shape(g, P.ochreSoft, 6); circ(g, cx, by - s * 0.62, s * 0.3); shape(g, P.greenSoft, 7); circ(g, cx - s * 0.18, by - s * 0.5, s * 0.18); shape(g, P.greenSoft, 6);
}
export function bowl(g: G, cx: number, cy: number, s: number) {
  g.beginPath(); g.arc(cx, cy, s * 0.5, 0, Math.PI); g.closePath(); shape(g, P.blueSoft, 7); g.beginPath(); g.ellipse(cx, cy, s * 0.5, s * 0.12, 0, Math.PI, 0); shape(g, P.paper, 5);
  line(g, [[cx + s * 0.1, cy - s * 0.05], [cx + s * 0.5, cy - s * 0.55]], 6); line(g, [[cx + s * 0.2, cy - s * 0.02], [cx + s * 0.62, cy - s * 0.45]], 6);
}
export function book(g: G, cx: number, cy: number, s: number, fill = P.blueSoft) {
  g.beginPath(); g.moveTo(cx, cy - s * 0.3); g.quadraticCurveTo(cx - s * 0.3, cy - s * 0.45, cx - s * 0.6, cy - s * 0.35); g.lineTo(cx - s * 0.6, cy + s * 0.35); g.quadraticCurveTo(cx - s * 0.3, cy + s * 0.25, cx, cy + s * 0.4); g.closePath(); shape(g, fill, 6);
  g.beginPath(); g.moveTo(cx, cy - s * 0.3); g.quadraticCurveTo(cx + s * 0.3, cy - s * 0.45, cx + s * 0.6, cy - s * 0.35); g.lineTo(cx + s * 0.6, cy + s * 0.35); g.quadraticCurveTo(cx + s * 0.3, cy + s * 0.25, cx, cy + s * 0.4); g.closePath(); shape(g, fill, 6);
}
export function shield(g: G, cx: number, cy: number, s: number, fill = P.blueSoft, mark?: (g: G) => void) {
  g.beginPath(); g.moveTo(cx, cy - s * 0.6); g.lineTo(cx + s * 0.5, cy - s * 0.42); g.lineTo(cx + s * 0.45, cy + s * 0.1); g.quadraticCurveTo(cx + s * 0.3, cy + s * 0.5, cx, cy + s * 0.65);
  g.quadraticCurveTo(cx - s * 0.3, cy + s * 0.5, cx - s * 0.45, cy + s * 0.1); g.lineTo(cx - s * 0.5, cy - s * 0.42); g.closePath(); shape(g, fill, Math.max(5, s * 0.05)); mark?.(g);
}
export function magnifier(g: G, cx: number, cy: number, s: number) {
  line(g, [[cx + s * 0.25, cy + s * 0.25], [cx + s * 0.6, cy + s * 0.6]], s * 0.14, P.ink); circ(g, cx, cy, s * 0.36); shape(g, "rgba(195,211,230,.6)", s * 0.08);
}
export function gavel(g: G, cx: number, cy: number, s: number) {
  g.save(); g.translate(cx, cy); g.rotate(-0.6); rr(g, -s * 0.4, -s * 0.18, s * 0.8, s * 0.36, 8); shape(g, P.ochreSoft, 6); rr(g, -s * 0.06, s * 0.18, s * 0.12, s * 0.75, 6); shape(g, P.ochre, 6); g.restore();
  rr(g, cx - s * 0.1, cy + s * 0.55, s * 0.8, s * 0.15, 6); shape(g, P.ochreSoft, 6);
}
export function handshake(g: G, cx: number, cy: number, s: number) {
  rr(g, cx - s * 0.7, cy - s * 0.15, s * 0.6, s * 0.3, s * 0.12); shape(g, P.blueSoft, 6); rr(g, cx + s * 0.1, cy - s * 0.15, s * 0.6, s * 0.3, s * 0.12); shape(g, P.greenSoft, 6);
  g.beginPath(); g.ellipse(cx, cy, s * 0.28, s * 0.2, 0, 0, Math.PI * 2); shape(g, P.skin, 6);
}
export function eye(g: G, cx: number, cy: number, s: number) {
  g.beginPath(); g.moveTo(cx - s * 0.6, cy); g.quadraticCurveTo(cx, cy - s * 0.5, cx + s * 0.6, cy); g.quadraticCurveTo(cx, cy + s * 0.5, cx - s * 0.6, cy); shape(g, P.paper, 6); circ(g, cx, cy, s * 0.2); shape(g, P.blue, 5);
}
export function heart(g: G, cx: number, cy: number, s: number, fill = P.red) {
  g.beginPath(); g.moveTo(cx, cy + s * 0.4); g.bezierCurveTo(cx - s * 0.7, cy - s * 0.1, cx - s * 0.35, cy - s * 0.6, cx, cy - s * 0.25); g.bezierCurveTo(cx + s * 0.35, cy - s * 0.6, cx + s * 0.7, cy - s * 0.1, cx, cy + s * 0.4); shape(g, fill, 6);
}
export function server(g: G, x: number, y: number, w: number, h: number) {
  for (let i = 0; i < 3; i++) { rr(g, x, y + (i * h) / 3, w, h / 3 - 6, 8); shape(g, P.slate, 6); circ(g, x + w * 0.85, y + (i * h) / 3 + h / 6 - 3, 6); shape(g, i === 1 ? P.red : P.green, 0); lines(g, x + w * 0.1, y + (i * h) / 3 + h / 6 - 3, w * 0.5, 1, 0, P.ink2, 6); }
}
export function bubble(g: G, x: number, y: number, w: number, h: number, t: string, fill = P.paper, color = P.ink) {
  rr(g, x, y, w, h, h * 0.3); shape(g, fill, 6); g.beginPath(); g.moveTo(x + w * 0.2, y + h - 3); g.lineTo(x + w * 0.12, y + h + h * 0.35); g.lineTo(x + w * 0.38, y + h - 3); shape(g, fill, 0);
  line(g, [[x + w * 0.2, y + h], [x + w * 0.12, y + h + h * 0.35], [x + w * 0.38, y + h]], 6);
  text(g, t, x + w / 2, y + h / 2 + 2, SANS(Math.round(h * 0.4), 800), color, "center", w * 0.85);
}
/** Biển hiệu dựng trên hai cột. */
export function sign(g: G, cx: number, by: number, w: number, h: number, title: string, sub?: string, fill = P.paper, color = P.ink) {
  line(g, [[cx - w * 0.38, by], [cx - w * 0.38, by - h * 0.6]], 9); line(g, [[cx + w * 0.38, by], [cx + w * 0.38, by - h * 0.6]], 9);
  rr(g, cx - w / 2, by - h, w, h * 0.55, 10); shape(g, fill, 7);
  text(g, title, cx, by - h * (sub ? 0.82 : 0.73), SERIF(Math.round(h * 0.15), 800), color, "center", w * 0.88);
  if (sub) text(g, sub, cx, by - h * 0.63, SANS(Math.round(h * 0.085), 600), P.ink2, "center", w * 0.9);
}
/** Sơ đồ tổ chức: hộp đầu não và các nhánh. */
export function orgChart(g: G, x: number, y: number, w: number, h: number, title: string, color = P.red) {
  const box = (cx: number, cy: number, bw: number, bh: number, fill: string) => { rr(g, cx - bw / 2, cy - bh / 2, bw, bh, 8); shape(g, fill, 6); };
  const top = [x + w / 2, y + h * 0.16], mid = [0.22, 0.5, 0.78].map(f => [x + w * f, y + h * 0.5]);
  mid.forEach(([mx, my]) => { line(g, [[top[0], top[1]], [top[0], y + h * 0.33], [mx, y + h * 0.33], [mx, my]], 6); [-0.08, 0.08].forEach(d => line(g, [[mx, my], [mx, y + h * 0.7], [mx + w * d, y + h * 0.7], [mx + w * d, y + h * 0.8]], 5)); });
  box(top[0], top[1], w * 0.42, h * 0.2, color); text(g, title, top[0], top[1], SANS(Math.round(h * 0.075), 800), P.paper, "center", w * 0.38);
  mid.forEach(([mx, my]) => { box(mx, my, w * 0.2, h * 0.14, P.redSoft); [-0.08, 0.08].forEach(d => { circ(g, mx + w * d, y + h * 0.86, h * 0.055); shape(g, P.slate, 5); }); });
}
/** Mũi tên vẽ tay (dùng trên các tấm nằm phẳng trên trang). */
export function arrow(g: G, x1: number, y1: number, x2: number, y2: number, color = P.red, lw = 10, head = 34) {
  line(g, [[x1, y1], [x2, y2]], lw, color); const a = Math.atan2(y2 - y1, x2 - x1);
  g.beginPath(); g.moveTo(x2, y2); g.lineTo(x2 - Math.cos(a - 0.45) * head, y2 - Math.sin(a - 0.45) * head); g.lineTo(x2 - Math.cos(a + 0.45) * head, y2 - Math.sin(a + 0.45) * head); g.closePath(); g.fillStyle = color; g.fill();
}

/* ---------------- chibi: nhân vật đầu to, dùng cho thành viên nhóm và người dẫn chuyện ---------------- */
export type ChibiOpt = {
  hair: "short" | "spiky" | "wavy" | "long"; hairC?: string;
  top: string; topStyle?: "plain" | "collar" | "hoodie" | "jersey" | "stripe" | "check" | "print" | "cardigan"; accent?: string;
  bottom?: string; shorts?: boolean; glasses?: boolean;
  pose?: "down" | "wave" | "point" | "hold"; item?: "folder" | "magnifier" | "shield";
};
const pt = (cx: number, cy: number, r: number, xs: [number, number][]) => xs.map(([x, y]) => [cx + x * r, cy + y * r] as [number, number]);
export function chibi(g: G, cx: number, by: number, s: number, o: ChibiOpt) {
  const lw = Math.max(3, s * 0.013), hr = s * 0.215, hy = by - s * 0.7, hairC = o.hairC ?? "#2a2622", bot = o.bottom ?? "#2f3238";
  const hipY = by - s * 0.22, nY = by - s * 0.49, shY = by - s * 0.46, pose = o.pose ?? "down";
  // tóc dài phía sau
  if (o.hair === "long") {
    g.beginPath(); g.moveTo(cx - hr * 1.12, hy - hr * 0.1);
    g.bezierCurveTo(cx - hr * 1.28, hy + hr * 0.9, cx - hr * 1.08, hy + hr * 1.5, cx - hr * 0.72, hy + hr * 1.55); g.lineTo(cx + hr * 0.72, hy + hr * 1.55);
    g.bezierCurveTo(cx + hr * 1.08, hy + hr * 1.5, cx + hr * 1.28, hy + hr * 0.9, cx + hr * 1.12, hy - hr * 0.1);
    g.bezierCurveTo(cx + hr * 1.1, hy - hr * 1.35, cx - hr * 1.1, hy - hr * 1.35, cx - hr * 1.12, hy - hr * 0.1); g.closePath(); shape(g, hairC, lw);
  }
  // chân + giày
  const legTop = o.shorts ? hipY + s * 0.075 : hipY;
  for (const k of [-1, 1]) {
    g.beginPath(); g.rect(k < 0 ? cx - s * 0.125 : cx + s * 0.012, legTop, s * 0.113, by - s * 0.04 - legTop); shape(g, o.shorts ? P.skin : bot, lw);
  }
  if (o.shorts) { g.beginPath(); g.rect(cx - s * 0.14, hipY - s * 0.01, s * 0.28, s * 0.095); shape(g, bot, lw); }
  for (const k of [-1, 1]) { g.beginPath(); g.ellipse(cx + k * s * 0.072, by - s * 0.035, s * 0.078, s * 0.036, 0, 0, Math.PI * 2); shape(g, "#2a2c30", lw); }
  // thân áo
  const body = () => {
    g.beginPath(); g.moveTo(cx - s * 0.07, nY); g.quadraticCurveTo(cx - s * 0.16, nY, cx - s * 0.165, shY + s * 0.05);
    g.lineTo(cx - s * 0.172, hipY + s * 0.02); g.lineTo(cx + s * 0.172, hipY + s * 0.02); g.lineTo(cx + s * 0.165, shY + s * 0.05);
    g.quadraticCurveTo(cx + s * 0.16, nY, cx + s * 0.07, nY); g.closePath();
  };
  body(); shape(g, o.top, 0);
  g.save(); body(); g.clip();
  const ac = o.accent ?? P.paper;
  switch (o.topStyle) {
    case "check": g.globalAlpha = 0.55; for (let x = cx - s * 0.2; x < cx + s * 0.2; x += s * 0.034) line(g, [[x, nY], [x, hipY + s * 0.03]], Math.max(1.5, s * 0.004), ac); for (let y = nY; y < hipY + s * 0.03; y += s * 0.034) line(g, [[cx - s * 0.2, y], [cx + s * 0.2, y]], Math.max(1.5, s * 0.004), ac); g.globalAlpha = 1; break;
    case "stripe": for (let k = -3; k <= 3; k++) line(g, [[cx + k * s * 0.07 - s * 0.12, hipY + s * 0.05], [cx + k * s * 0.07 + s * 0.12, nY - s * 0.02]], s * 0.022, ac); break;
    case "jersey": g.fillStyle = ac; g.fillRect(cx - s * 0.18, nY, s * 0.035, s * 0.3); g.fillRect(cx + s * 0.145, nY, s * 0.035, s * 0.3); line(g, [[cx - s * 0.05, by - s * 0.4], [cx, by - s * 0.37], [cx + s * 0.05, by - s * 0.4]], s * 0.012, ac); break;
    case "print": rr(g, cx - s * 0.065, by - s * 0.43, s * 0.13, s * 0.12, s * 0.01); shape(g, "#d9b8a0", lw * 0.6); circ(g, cx, by - s * 0.39, s * 0.025); shape(g, "#3a3d43", 0); break;
    case "cardigan":
      g.beginPath(); g.moveTo(cx - s * 0.065, nY - 2); g.lineTo(cx + s * 0.065, nY - 2); g.lineTo(cx, by - s * 0.31); g.closePath(); shape(g, P.paper, lw * 0.7);
      for (let k = 0; k < 3; k++) { circ(g, cx + s * 0.012, by - s * 0.29 + k * s * 0.03, s * 0.008); shape(g, "#9aa3ad", 0); }
      break;
    case "hoodie": rr(g, cx - s * 0.09, by - s * 0.33, s * 0.18, s * 0.09, s * 0.02); shape(g, null, lw * 0.6, "rgba(0,0,0,.35)"); break;
  }
  g.restore(); body(); shape(g, null, lw);
  if (o.topStyle === "collar" || o.topStyle === "print") for (const k of [-1, 1]) { g.beginPath(); g.moveTo(cx, nY + s * 0.025); g.lineTo(cx + k * s * 0.075, nY - s * 0.005); g.lineTo(cx + k * s * 0.05, nY + s * 0.04); g.closePath(); shape(g, P.paper, lw * 0.6); }
  if (o.topStyle === "cardigan") for (const k of [-1, 1]) { g.beginPath(); g.moveTo(cx, nY + s * 0.02); g.lineTo(cx + k * s * 0.06, nY - s * 0.006); g.lineTo(cx + k * s * 0.045, nY + s * 0.035); g.closePath(); shape(g, P.paper, lw * 0.6); }
  if (o.topStyle === "hoodie") { g.beginPath(); g.ellipse(cx, nY, s * 0.1, s * 0.035, 0, 0, Math.PI * 2); shape(g, o.top, lw * 0.8); for (const k of [-1, 1]) line(g, [[cx + k * s * 0.03, nY + s * 0.02], [cx + k * s * 0.032, nY + s * 0.09]], lw * 0.6, P.paper); }
  // tay
  const L: [number, number] = [cx - s * 0.15, shY + s * 0.035], R: [number, number] = [cx + s * 0.15, shY + s * 0.035];
  const ends: Record<string, [[number, number], [number, number]]> = {
    down: [[cx - s * 0.2, hipY - s * 0.01], [cx + s * 0.2, hipY - s * 0.01]],
    wave: [[cx - s * 0.2, hipY - s * 0.01], [cx + s * 0.27, shY - s * 0.17]],
    point: [[cx - s * 0.2, hipY - s * 0.01], [cx + s * 0.32, shY + s * 0.01]],
    hold: [[cx - s * 0.07, by - s * 0.31], [cx + s * 0.07, by - s * 0.31]],
  };
  const [eL, eR] = ends[pose];
  const arm = (a: [number, number], b: [number, number]) => { line(g, [a, b], s * 0.075 + lw * 2, P.ink); line(g, [a, b], s * 0.075, o.top); };
  const hand = (b: [number, number]) => { circ(g, b[0], b[1], s * 0.037); shape(g, P.skin, lw * 0.8); };
  arm(L, eL); arm(R, eR);
  // đồ cầm tay
  if (o.item === "folder") { g.save(); g.translate(cx, by - s * 0.34); g.rotate(-0.06); rr(g, -s * 0.14, -s * 0.08, s * 0.28, s * 0.2, s * 0.015); shape(g, "#d8b878", lw); rr(g, -s * 0.14, -s * 0.1, s * 0.1, s * 0.04, s * 0.01); shape(g, "#d8b878", lw * 0.8); line(g, [[-s * 0.08, s * 0.03], [s * 0.08, s * 0.03]], lw, P.red); g.restore(); }
  if (o.item === "shield") shield(g, cx, by - s * 0.33, s * 0.24, P.blueSoft, gg => star(gg, cx, by - s * 0.34, s * 0.045, P.red));
  if (o.item === "magnifier") magnifier(g, eR[0] + s * 0.06, eR[1] - s * 0.08, s * 0.16);
  hand(eL); hand(eR);
  // đầu + mặt
  g.beginPath(); g.ellipse(cx, hy, hr, hr * 0.95, 0, 0, Math.PI * 2); shape(g, P.skin, lw);
  for (const k of [-1, 1]) {
    const ex = cx + k * hr * 0.36, ey = hy + hr * 0.2;
    g.beginPath(); g.ellipse(ex, ey, hr * 0.1, hr * 0.14, 0, 0, Math.PI * 2); g.fillStyle = P.ink; g.fill();
    circ(g, ex - hr * 0.03, ey - hr * 0.05, hr * 0.038); g.fillStyle = "#fff"; g.fill();
    g.beginPath(); g.ellipse(cx + k * hr * 0.62, hy + hr * 0.45, hr * 0.14, hr * 0.08, 0, 0, Math.PI * 2); g.fillStyle = "rgba(226,120,110,.4)"; g.fill();
  }
  g.beginPath(); g.arc(cx, hy + hr * 0.38, hr * 0.11, Math.PI * 0.15, Math.PI * 0.85); g.lineWidth = lw * 0.8; g.strokeStyle = P.ink; g.lineCap = "round"; g.stroke();
  // tóc phía trước
  const cap = (top: [number, number][], fringe: [number, number][]) => {
    g.beginPath(); pt(cx, hy, hr, top).forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y)));
    pt(cx, hy, hr, fringe).forEach(([x, y]) => g.lineTo(x, y)); g.closePath(); shape(g, hairC, lw);
  };
  const dome = (w: number, h: number): [number, number][] => Array.from({ length: 13 }, (_, k) => { const a = Math.PI + (k / 12) * Math.PI; return [Math.cos(a) * w, Math.sin(a) * h + 0.05] as [number, number]; });
  if (o.hair === "spiky") cap([[-1.06, 0.1], [-1.0, -0.6], [-0.85, -1.0], [-0.6, -0.95], [-0.45, -1.3], [-0.15, -1.05], [0.1, -1.38], [0.32, -1.05], [0.62, -1.22], [0.75, -0.9], [1.0, -0.62], [1.06, 0.1]],
    [[0.92, -0.15], [0.7, -0.34], [0.5, -0.18], [0.28, -0.38], [0.05, -0.2], [-0.18, -0.4], [-0.4, -0.2], [-0.62, -0.38], [-0.88, -0.12]]);
  else if (o.hair === "wavy") cap(dome(1.2, 1.32), [[1.0, -0.05], [0.82, -0.3], [0.45, -0.46], [0.2, -0.3], [-0.15, -0.5], [-0.45, -0.32], [-0.8, -0.45], [-1.05, -0.1]]);
  else if (o.hair === "long") {
    cap(dome(1.12, 1.2), [[1.0, 0.1], [0.75, -0.25], [0.4, -0.32], [0.1, -0.22], [-0.25, -0.36], [-0.6, -0.28], [-0.95, 0.05]]);
    for (const k of [-1, 1]) { g.beginPath(); g.moveTo(cx + k * hr * 1.08, hy - hr * 0.1); g.quadraticCurveTo(cx + k * hr * 1.12, hy + hr * 0.6, cx + k * hr * 0.98, hy + hr * 1.0); g.lineTo(cx + k * hr * 0.8, hy + hr * 0.82); g.quadraticCurveTo(cx + k * hr * 0.9, hy + hr * 0.2, cx + k * hr * 0.86, hy - hr * 0.1); g.closePath(); shape(g, hairC, lw); }
  } else cap(dome(1.08, 1.22), [[0.94, -0.12], [0.7, -0.34], [0.48, -0.2], [0.24, -0.38], [0.0, -0.22], [-0.24, -0.4], [-0.48, -0.22], [-0.7, -0.38], [-0.92, -0.12]]);
  if (o.glasses) { for (const k of [-1, 1]) { circ(g, cx + k * hr * 0.36, hy + hr * 0.2, hr * 0.22); shape(g, null, lw * 0.7); } line(g, [[cx - hr * 0.14, hy + hr * 0.18], [cx + hr * 0.14, hy + hr * 0.18]], lw * 0.7); }
}
