"use client";
// Mục V: năm phương thức, thủ đoạn. Mỗi trang gồm cảnh minh họa (nhịp a–d) và khu hồ sơ vụ việc (nhịp cuối).
import type { Method } from "@/content/slides";
import {
  P, book, box, bubble, building, chat, doc, envelope, globe, deskGlobe, groupPage, house, lines, lock, magnifier, megaphone, money, orgChart, playIcon, rr, shape, stamp, text, tree, bowl, MONO, SANS, SERIF,
} from "../art";
import { C, Holo, Tag } from "../fx";
import { DropIn, Magnifier, PushPin, RubberStamp, Thread, indexCard, newsClip } from "../desk";
import { CASE_X } from "../layout";
import { CARRY, Ripple, Typing } from "../particles";
import { Card, InkPath, PAGE_Y } from "../pop";
import { crowdW, dCrowd, dIcon, dLaptop, dPerson, dPhone } from "./draws";
import { cap, lane } from "./Theory";

type MP = { step: number };
type G = CanvasRenderingContext2D;

/* ============ PT1: tạo nhóm trên mạng xã hội ============ */
// chủ đề nóng xếp thành vòng cung quanh điện thoại như mồi câu (không đứng trước đám đông)
const TOPICS: [string, (g: G, cx: number, cy: number, s: number) => void, [number, number]][] = [
  ["MÔI TRƯỜNG", (g, cx, cy, s) => tree(g, cx, cy + s * 0.45, s), [-3.8, -2.5]],
  ["ĐẤT ĐAI", (g, cx, cy, s) => house(g, cx, cy + s * 0.35, s * 0.8), [-4.2, -0.3]],
  ["DÂN SINH", (g, cx, cy, s) => bowl(g, cx, cy + s * 0.1, s * 0.9), [3.8, -2.5]],
  ["GIÁO DỤC", (g, cx, cy, s) => book(g, cx, cy, s * 0.85), [4.2, -0.3]],
  ["KHIẾU KIỆN", (g, cx, cy, s) => doc(g, cx - s * 0.35, cy - s * 0.45, s * 0.7, s * 0.9, { lines: 4 }), [4.4, 1.7]],
];
const CROWD1: [number, number][] = [[-1.9, 2.0], [0, 2.6], [1.9, 2.0]];
const CHOSEN: [number, number][] = [[3.0, 0.9], [3.9, 1.4], [4.8, 0.9]];
function M1({ step }: MP) {
  const alert = step >= 2, closed = step >= 3;
  return <group>
    <Card id="m1-phone" w={2.7} h={4.6} at={[0, -2.0]} ring={step === 0} dim={closed} draw={dPhone((g, x, y, w, h) => groupPage(g, x, y, w, h, { name: "Bảo vệ quyền lợi cộng đồng" }))}
      back={{ id: "m1-phone-bad", draw: dPhone((g, x, y, w, h) => groupPage(g, x, y, w, h, { name: "Bảo vệ quyền lợi cộng đồng", alert: true })) }} flipped={alert} />
    {/* bong bóng "đang soạn tin" đứng hẳn bên phải điện thoại (mép phải ở x = 1.35), không che góc máy */}
    <Typing at={[1.95, -2.0, 3.7]} on={step === 0} delay={0.9} />
    {TOPICS.map(([t, icon, at], i) => <Card key={t} id={`m1-t${i}`} w={1.9} h={2.0} at={at} on={step >= 1 && !closed} delay={i * 0.1} draw={dIcon(icon, t)} />)}
    {CROWD1.map(([x, z], i) => <Card key={i} id={`m1-c${i}`} w={crowdW(3, 1.45)} h={1.45} at={step >= 1 ? [x, z] : [x * 1.4, z + 2.3]} on={step >= 1 && !closed} delay={0.4 + i * 0.1} speed={1.4}
      draw={dCrowd(3, k => ({ body: [P.slate, P.sand, P.blueSoft][(i + k) % 3], phone: k === 1 }))} back={{ id: `m1-c${i}b`, draw: dCrowd(3, k => ({ body: k === 1 ? P.red : P.redSoft, angry: true })) }} flipped={alert} />)}
    {CROWD1.map(([x, z], i) => <InkPath key={i} pts={[[x, z - 0.4], [x * 0.3, 0.2]]} on={step === 1} arrow dash={0.2} width={0.04} delay={0.8 + i * 0.1} />)}
    {CROWD1.map(([x, z], i) => <InkPath key={`f${i}`} pts={[[x * 0.25, -1.3], [x, z - 0.55]]} on={step === 2} arrow width={0.03} delay={0.3 + i * 0.15} carrier={CARRY.fake} />)}
    {lane("THU HÚT BẰNG CHỦ ĐỀ NÓNG", 0, step === 1)}
    {lane("TUNG TIN SAI LỆCH · KÍCH ĐỘNG BẤT MÃN", 0, step === 2)}
    <Card id="m1-lock" w={2.0} h={3.3} at={[3.9, -1.9]} on={closed} rotY={-0.2} ring draw={dPhone((g, x, y, w, h) => chat(g, x, y, w, h, { locked: true, red: true, title: "Nhóm kín" }))} />
    {/* 3 người được chọn rời đám đông, đi sang nhóm kín (có vệt di chuyển) */}
    {CHOSEN.map(([x, z], i) => <Card key={i} id={`m1-sel${i}`} w={0.95} h={1.55} at={closed ? [x, z] : CROWD1[i]} on={closed} delay={0.3 + i * 0.15} speed={1.5} draw={dPerson({ body: P.red })} />)}
    {lane("CHỌN NGƯỜI ĐỒNG TÌNH → KÉO VÀO NHÓM KÍN", 2.8, closed)}
  </group>;
}

/* ============ PT2: học hỏi, giao lưu ============ */
const classScreen = (bad: boolean) => (g: G, x: number, y: number, w: number, h: number) => {
  g.fillStyle = bad ? P.redSoft : P.blueSoft; g.fillRect(x, y, w, h * 0.16);
  text(g, bad ? "LỒNG GHÉP XUYÊN TẠC" : "LỚP HỌC TRỰC TUYẾN", x + w / 2, y + h * 0.08, MONO(Math.round(h * 0.075), 800), bad ? P.red : P.ink, "center", w * 0.9);
  const items = bad ? ["Xuyên tạc", "Kích động", "Lôi kéo", "Chống phá"] : ["Pháp luật", "Nhân quyền", "Kỹ năng sống", "Thiện nguyện"];
  items.forEach((t, i) => text(g, `${i + 1}. ${t}`, x + w * 0.1, y + h * (0.3 + i * 0.17), SERIF(Math.round(h * 0.1), 700), bad ? P.red : P.ink, "left"));
  if (bad) stamp(g, x + w * 0.74, y + h * 0.66, "CHỐNG PHÁ", h * 0.08);
};
/** Biển nhóm có hai chân cắm xuống trang: nơi những người bị lôi kéo tập hợp lại. */
const groupSign = (g: G, W: number, H: number) => {
  const bw = W - 16, bh = H * 0.5, x = 8, y = 8;
  for (const px of [W * 0.25, W * 0.75]) { rr(g, px - 7, y + bh - 4, 14, H - bh - 16, 4); shape(g, P.sand, 5); }
  rr(g, x, y, bw, bh, 10); shape(g, P.paper, 7, P.red);
  rr(g, x + 12, y + 12, bw - 24, bh - 24, 6); shape(g, null, 3, P.red);
  text(g, "NHÓM CHỐNG PHÁ", W / 2, y + bh / 2 + 2, MONO(Math.round(bh * 0.3), 800), P.red, "center", bw - 50);
};
// hai hàng so le (hàng sau 4 người, hàng trước 3 người) để từ góc thấp không ai che ai
const STUDENTS: [number, number][] = [[-3.3, 0.6], [-2.2, 2.0], [-1.1, 0.6], [0, 2.0], [1.1, 0.6], [2.2, 2.0], [3.3, 0.6]];
const MARKED = [1, 4, 5];
function M2({ step }: MP) {
  const bad = step >= 3;
  return <group>
    {STUDENTS.map(([x, z], i) => {
      const m = MARKED.indexOf(i), go = bad && m >= 0;
      return <Card key={i} id={`m2-s${i}`} w={0.95} h={1.55} at={go ? [3.4 + m * 1.0, -1.1] : [x, z]} delay={i * 0.08} speed={1.5} ring={m >= 0 ? step === 2 : undefined} dim={bad && m < 0}
        draw={dPerson({ body: [P.blueSoft, P.slate, P.sand][i % 3], cap: i % 2 === 0, bag: i % 2 === 1 })}
        back={{ id: `m2-s${i}${bad ? "r" : "m"}`, draw: dPerson({ body: bad ? P.red : [P.blueSoft, P.slate, P.sand][i % 3], cap: i % 2 === 0, bag: i % 2 === 1, mark: !bad }) }} flipped={step >= 2 && m >= 0} />;
    })}
    {lane("NHẮM VÀO HỌC SINH, SINH VIÊN, NGƯỜI TRẺ", 0, step === 0)}
    <Card id="m2-laptop" w={3.6} h={2.7} at={[-0.4, -2.6]} on={step >= 1} draw={dLaptop(classScreen(false))} back={{ id: "m2-laptop-bad", draw: dLaptop(classScreen(true)) }} flipped={bad} />
    <Card id="m2-host" w={1.2} h={1.9} at={[-3.0, -2.3]} on={step >= 1} delay={0.2} draw={dPerson({ body: P.slate2, tie: true })} back={{ id: "m2-host-bad", draw: dPerson({ hood: true, body: "#3a3d43" }) }} flipped={bad} />
    {lane("MỞ LỚP, DIỄN ĐÀN TRỰC TUYẾN · VỎ BỌC HỌC THUẬT, THIỆN NGUYỆN", 0, step === 1)}
    {/* kính lúp quét dọc hai hàng học viên, dừng lại ở phía phải */}
    <Magnifier from={[-4.2, 0.55, 1.4]} to={[2.6, 0.55, 1.4]} on={step === 2} delay={0.3} size={0.95} />
    {lane("TÌM HIỂU, CHỌN NGƯỜI ĐỂ TÁC ĐỘNG", 0, step === 2)}
    <Card id="m2-grp" w={3.0} h={1.7} at={[4.4, -2.5]} on={bad} delay={0.6} draw={groupSign} />
    {lane("LỒNG GHÉP XUYÊN TẠC → KÉO VÀO HỘI NHÓM CHỐNG PHÁ", 1.8, bad)}
  </group>;
}

/* ============ PT3: truyền thông, tuyên truyền ============ */
const POSTS: [number, number][] = [[-3.4, 0.6], [-1.4, 1.6], [1.4, 1.6], [3.4, 0.6]];
// tài khoản ảo đứng ở rìa ngoài, mỗi người một bong bóng số liệu
const FAKES: [number, number, string][] = [[-5.4, -1.0, "+1,2K"], [-5.0, 1.5, "CHIA SẺ"], [5.0, 1.5, "ĐỒNG TÌNH"], [5.4, -1.0, "+3K"]];
function M3({ step }: MP) {
  return <group>
    <Card id="m3-creator" w={1.9} h={2.5} at={[0, -0.9]} ring={step === 0} draw={dPerson({ hood: true, body: "#3a3d43", laptop: true })} />
    {[["m3-video", -2.6, (g: G, x: number, y: number, w: number, h: number) => playIcon(g, x + w * 0.3, y + h * 0.22, w * 0.4, h * 0.56), "VIDEO"],
      ["m3-blog", 0, (g: G, x: number, y: number, w: number, h: number) => { text(g, "BLOG", x + w / 2, y + h * 0.18, SERIF(Math.round(h * 0.16), 800)); lines(g, x + w * 0.1, y + h * 0.42, w * 0.8, 4, h * 0.13); }, "WEBSITE · BLOG"],
      ["m3-live", 2.6, (g: G, x: number, y: number, w: number, h: number) => { g.fillStyle = P.red; g.fillRect(x + w * 0.06, y + h * 0.08, w * 0.3, h * 0.2); text(g, "LIVE", x + w * 0.21, y + h * 0.18, MONO(Math.round(h * 0.13), 800), P.paper); megaphone(g, x + w * 0.55, y + h * 0.6, h * 0.42); }, "LIVESTREAM"]] .map(([id, x, scr, t], i) =>
      <group key={id as string}><Card id={id as string} w={2.3} h={1.85} at={[x as number, -4.5]} delay={0.2 + i * 0.12} draw={dLaptop(scr as (g: G, x: number, y: number, w: number, h: number) => void)} />{cap(t as string, x as number, -3.9, true, C.ink, 0.17)}</group>)}
    {POSTS.map(([x, z], i) => <Card key={i} id={`m3-post${i}`} w={1.2} h={1.5} at={step >= 1 ? [x, z] : [0, -1.2]} on={step >= 1} delay={i * 0.12} speed={1.8} dim={step >= 2}
      draw={(g, W, H) => doc(g, 8, 8, W - 16, H - 16, { lines: 4, stamp: "XUYÊN TẠC" })} />)}
    {POSTS.map(([x, z], i) => <Ripple key={`r${i}`} at={[x, z + 0.2]} r={1.3} on={step === 1} delay={0.9 + i * 0.15} />)}
    {lane("DỰNG HÌNH ẢNH, UY TÍN: WEBSITE · BLOG · KÊNH VIDEO", 0, step === 0)}
    {lane("PHÁT TÁN BÀI VIẾT, VIDEO BÓP MÉO SỰ THẬT", 0, step === 1)}
    {FAKES.map(([x, z, t], i) => <group key={i}>
      <Card id={`m3-fake${i}`} w={1.05} h={1.7} at={[x, z]} on={step >= 2} delay={i * 0.1} dim={step >= 3} draw={dPerson({ mask: true, body: P.slate2 })} />
      <Card id={`m3-bub${i}`} w={1.3} h={0.75} at={[x + 0.2, z, 1.75]} on={step >= 2} delay={0.4 + i * 0.1} draw={(g, W, H) => bubble(g, 6, 6, W - 12, H * 0.62, t, P.paper, P.red)} />
    </group>)}
    {lane("BÁM SỰ KIỆN NÓNG · TÀI KHOẢN ẢO TẠO HIỆU ỨNG ĐÁM ĐÔNG", 0, step === 2)}
    <Card id="m3-viewers" w={crowdW(5, 1.4)} h={1.4} at={[0, 2.5]} on={step >= 3} ring={step >= 3} draw={dCrowd(5, i => ({ body: [P.slate, P.sand, P.blueSoft][i % 3], phone: true }))}
      back={{ id: "m3-viewers-b", draw: dCrowd(5, i => ({ body: i === 1 || i === 3 ? P.red : [P.slate, P.sand, P.blueSoft][i % 3], phone: true, angry: i === 1 || i === 3 })) }} flipped={step >= 3} />
    {lane("SÀNG LỌC NGƯỜI BẤT MÃN, LÔI KÉO VÀO NHÓM", 0, step === 3)}
  </group>;
}

/* ============ PT4: ứng dụng nhắn tin, họp trực tuyến ============ */
const MEMBERS4: [number, number][] = [[-3.6, 0.8], [-1.2, 1.4], [1.2, 1.4], [3.6, 0.8]];
const APPS = ["Telegram", "Signal", "WhatsApp", "Zoom"];
function M4({ step }: MP) {
  const apart = step >= 3;
  return <group>
    {MEMBERS4.map(([x, z], i) => <group key={i}>
      <Card id={`m4-p${i}`} w={1.1} h={1.8} at={apart ? [x * 1.25, z + 0.6] : [x, z]} delay={i * 0.1} speed={1.6} draw={dPerson({ body: [P.slate, P.sand, P.blueSoft, P.slate][i], phone: true })}
        back={{ id: `m4-p${i}m`, draw: dPerson({ body: [P.slate, P.sand, P.blueSoft, P.slate][i], mask: true, phone: true }) }} flipped={step >= 1} />
      <Card id={`m4-lock${i}`} w={0.75} h={0.85} at={apart ? [x * 1.25 + 0.6, z + 0.6, 1.4] : [x + 0.6, z, 1.4]} on={step >= 1} delay={0.2 + i * 0.1} speed={1.6} draw={dIcon((g, cx, cy, s) => lock(g, cx, cy, s * 0.32))} />
    </group>)}
    {([[0, 1], [1, 2], [2, 3], [0, 2], [1, 3]] as [number, number][]).map(([a, b], i) => <InkPath key={i} pts={[[MEMBERS4[a][0], MEMBERS4[a][1] - 0.3], [MEMBERS4[b][0], MEMBERS4[b][1] - 0.3]]} on={step === 0} dash={0.18} width={0.035} color={P.blue} delay={0.4 + i * 0.1} carrier={{ ...CARRY.chat, count: 1 }} />)}
    {lane(`NHẮN TIN · GỌI ĐIỆN · HỌP TRỰC TUYẾN (${APPS.join(", ")})`, 0, step === 0, C.ink)}
    {lane("NHÓM KÍN · TÀI KHOẢN ẨN DANH · CHẶN NGƯỜI NGOÀI", 0, step === 1)}
    <Card id="m4-call" w={3.2} h={2.4} at={apart ? [0, -4.6] : [0, -2.2]} on={step >= 2} speed={1.4} ring={step === 2} dim={apart} draw={dLaptop((g, x, y, w, h) => {
      g.fillStyle = P.cream; g.fillRect(x, y, w, h);
      for (let i = 0; i < 4; i++) { const cx = x + w * (0.25 + (i % 2) * 0.5), cy = y + h * (0.27 + Math.floor(i / 2) * 0.48); g.fillStyle = i === 0 ? P.redSoft : P.paper; g.fillRect(cx - w * 0.23, cy - h * 0.22, w * 0.46, h * 0.44);
        g.beginPath(); g.arc(cx, cy - h * 0.05, h * 0.08, 0, 7); g.fillStyle = i === 0 ? "#3a3d43" : P.slate; g.fill(); g.beginPath(); g.ellipse(cx, cy + h * 0.14, h * 0.13, h * 0.08, 0, Math.PI, 0); g.fill(); }
      text(g, "ĐIỀU HÀNH", x + w * 0.25, y + h * 0.44, MONO(Math.round(h * 0.06), 800), P.red);
    })} />
    {/* giấy việc bay từ màn hình họp tới, đứng cạnh chân từng người (không che mặt ai) */}
    {MEMBERS4.map(([x, z], i) => <Card key={i} id={`m4-task${i}`} w={0.75} h={0.95} at={step >= 2 ? [x * (apart ? 1.25 : 1) + 0.8, z + 0.15 + (apart ? 0.6 : 0)] : [0, -2.0]} on={step >= 2} delay={0.4 + i * 0.12} speed={1.6}
      draw={(g, W, H) => doc(g, 6, 6, W - 12, H - 12, { title: "VIỆC", lines: 3 })} />)}
    {lane("HỌP KÍN, THỐNG NHẤT PHƯƠNG HƯỚNG, PHÂN CÔNG NHIỆM VỤ", 0, step === 2)}
    {/* mỗi người bị tách vào một ô riêng: không ai biết toàn bộ cơ cấu */}
    {MEMBERS4.map(([x, z], i) => { const cx = x * 1.25 + 0.3, cz = z + 0.6;
      return <InkPath key={`cell${i}`} pts={[[cx - 1.05, cz - 0.75], [cx + 1.05, cz - 0.75], [cx + 1.05, cz + 0.75], [cx - 1.05, cz + 0.75], [cx - 1.05, cz - 0.75]]} on={apart} dash={0.16} width={0.03} color={P.ink2} delay={0.3 + i * 0.1} />; })}
    <InkPath pts={[[-6.5, -3.4], [6.5, -3.4]]} on={apart} dash={0.3} width={0.05} />
    {cap("BIÊN GIỚI", 6.4, -2.8, apart, C.red, 0.17)}{cap("NƯỚC NGOÀI", 3.6, -4.6, apart, C.red)}
    {MEMBERS4.map(([x, z], i) => <InkPath key={i} pts={[[0, -4.2], [x * 1.25, z]]} on={apart} width={0.035} delay={0.6 + i * 0.1} carrier={{ ...CARRY.doc, count: 1 }} />)}
    {lane("CHIA NHÓM NHỎ · CHỈ ĐẠO, ĐIỀU HÀNH TỪ NƯỚC NGOÀI", 0, apart)}
  </group>;
}

/* ============ PT5: móc nối với bên ngoài ============ */
const DOM: [number, number][] = [[-5.2, -1.4], [-3.4, 0.6], [-4.8, 2.2], [-2.0, 2.4], [-1.6, -0.6]];
function M5({ step }: MP) {
  return <group>
    <InkPath pts={[[0.2, -4.6], [-0.1, 0], [0.2, 4.4]]} dash={0.32} width={0.06} />
    {cap("BIÊN GIỚI", 0.2, -4.9, true, C.red, 0.17)}{cap("TRONG NƯỚC", -3.4, -4.6, true, C.ink, 0.2)}{cap("NƯỚC NGOÀI", 3.6, -4.6, true, C.ink, 0.2)}
    <Card id="m5-leader" w={1.4} h={2.1} at={[3.0, -1.6]} draw={dPerson({ hood: true, body: "#3a3d43", star: false, laptop: true })} />
    <Card id="m5-globe" w={1.7} h={1.7} at={[4.8, -2.8]} delay={0.2} draw={dIcon((g, cx, cy, s) => deskGlobe(g, cx, cy - s * 0.12, s * 0.33))} />
    <Card id="m5-f1" w={1.0} h={1.6} at={[4.6, 0.2]} delay={0.3} draw={dPerson({ body: P.slate2, tie: true })} />
    {DOM.map(([x, z], i) => <Card key={i} id={`m5-d${i}`} w={0.95} h={1.55} at={[x, z]} delay={0.2 + i * 0.08} ring={i === 4 ? step === 1 : undefined} draw={dPerson({ body: [P.slate, P.sand, P.blueSoft][i % 3], phone: i === 4 })}
      back={{ id: `m5-d${i}r`, draw: dPerson({ body: i === 4 ? P.red : P.redSoft, phone: i === 4, mark: i === 4 && step < 3 }) }} flipped={(i === 4 && step >= 1) || step >= 3} />)}
    <InkPath pts={[[2.6, -1.2], [1.0, -1.0, 1.4], [-1.3, -0.6]]} on={step >= 0} arrow width={0.05} delay={0.8} flow={step === 0} carrier={CARRY.envelope} />
    {lane("KẾT NỐI XUYÊN BIÊN GIỚI: MẠNG XÃ HỘI · EMAIL · ỨNG DỤNG", 0, step === 0)}
    {[1, 2, 3].map((d, i) => <InkPath key={d} pts={[[-1.6, -0.3], [DOM[d][0] + 0.3, DOM[d][1] - 0.3]]} on={step >= 1} dash={0.2} width={0.04} delay={0.3 + i * 0.12} flow={step === 1} carrier={{ ...CARRY.chat, count: 1 }} />)}
    {lane("DÙNG NGƯỜI QUEN LÀM CẦU NỐI, MỞ RỘNG LIÊN KẾT", 0, step === 1)}
    {[["m5-money", (g: G, W: number, H: number) => money(g, 10, H * 0.3, W - 40, H * 0.5)], ["m5-box", (g: G, W: number, H: number) => box(g, 8, 8, W - 16, H - 16)], ["m5-doc", (g: G, W: number, H: number) => doc(g, 8, 8, W - 16, H - 16, { title: "TÀI LIỆU", lines: 3 })]].map(([id, d], i) =>
      <Card key={id as string} id={id as string} w={1.1} h={1.0} at={step >= 2 ? [-3.1 + i * 1.25, -2.9 + i * 0.12] : [3.4, -0.4 + i * 0.12]} on={step >= 2} delay={i * 0.25} speed={1.2} draw={d as (g: G, W: number, H: number) => void} />)}
    <InkPath pts={[[3.4, -0.5], [0.4, -2.0, 1.3], [-2.4, -2.7]]} on={step === 2} arrow width={0.04} delay={0.5} carrier={{ ...CARRY.money, count: 3 }} />
    {lane("NHẬN TIỀN · TÀI LIỆU · PHƯƠNG TIỆN TỪ BÊN NGOÀI", 0, step === 2)}
    <Card id="m5-org" w={3.0} h={2.1} at={[-3.6, -3.4]} on={step >= 3} ring draw={(g, W, H) => orgChart(g, 10, 10, W - 20, H - 20, "MẠNG LƯỚI")} />
    <InkPath pts={[[-2.0, -3.2, 1.2], [0.4, -3.0, 2.4], [2.6, -1.9, 1.6]]} on={step >= 3} arrow width={0.05} delay={0.5} />
    {lane("PHỐI HỢP THÀNH MẠNG LƯỚI TRONG – NGOÀI NƯỚC", 0, step === 3)}
  </group>;
}

/* ============ khu hồ sơ vụ việc: bảng điều tra ============ */
// Ảnh rơi xuống và được ghim, mẩu báo và thẻ ghi chú bật dựng, chỉ đỏ nối từ ghim tới giấy tờ,
// kính lúp lướt qua ảnh, cuối cùng con dấu kết luận đập xuống.
const PHOTO_W = 6.2, PHOTO_H = 3.8;
const CLIP: [number, number] = [-1.9, 1.5], NOTE: [number, number] = [2.6, 1.4], PAPER_H = 1.5;
function CaseArea({ m, on }: { m: Method; on: boolean }) {
  const c = m.case, ph = PHOTO_H + 0.32, hy = PAGE_Y + ph / 2 + 0.05;
  const topY = PAPER_H - (hy - PAGE_Y); // đỉnh mẩu báo / thẻ ghi chú, tính trong hệ tọa độ của tấm ảnh
  return <group position={[CASE_X, 0, -0.4]}>
    <DropIn on={on} from={[0.3, 2.6, 0.6]} spin={0.22}>
      <Holo src={`/images/${c.image}`} w={PHOTO_W} h={PHOTO_H} on={on} position={[0, hy, 0]} rotation={[-0.06, 0, -0.02]}>
        {(pw, pph) => {
          const L: [number, number, number] = [-pw / 2 + 0.28, pph / 2 - 0.24, 0], R: [number, number, number] = [pw / 2 - 0.28, pph / 2 - 0.24, 0];
          return <>
            <PushPin position={L} on={on} delay={0.8} /><PushPin position={R} on={on} delay={0.95} />
            <Thread a={[L[0], L[1], 0.24]} b={[CLIP[0], topY, CLIP[1]]} on={on} delay={1.45} sag={0.35} />
            <Thread a={[R[0], R[1], 0.24]} b={[NOTE[0], topY, NOTE[1]]} on={on} delay={1.6} sag={0.35} />
            <Magnifier from={[-pw / 2 - 0.8, -0.3, 0.55]} to={[pw * 0.16, 0.05, 0.55]} on={on} delay={1.9} size={1.1} />
          </>;
        }}
      </Holo>
    </DropIn>
    <Card id={`case-clip${m.n}`} w={2.0} h={PAPER_H} at={CLIP} rotY={0.15} on={on} delay={1.1} draw={newsClip(c.name, c.period)} trail={false} />
    <Card id={`case-note${m.n}`} w={2.0} h={PAPER_H} at={NOTE} rotY={-0.18} on={on} delay={1.25} draw={indexCard("KẾT LUẬN", c.verdict[1])} trail={false} />
    <RubberStamp at={[0.3, 1.9]} text={c.verdict[0].toUpperCase()} on={on} delay={2.6} size={0.62} restDx={null} />
    <Tag text={`VỤ VIỆC MINH HỌA · ${c.period}`} position={[0, PAGE_Y + ph + 0.4, 0]} size={0.2} show={on} />
  </group>;
}

export function MethodStation({ m, step }: { m: Method; step: number }) {
  const S = [M1, M2, M3, M4, M5][m.n - 1];
  return <group>
    <S step={Math.min(step, 3)} />
    <CaseArea m={m} on={step >= 4} />
  </group>;
}

export { building, envelope, SANS };
