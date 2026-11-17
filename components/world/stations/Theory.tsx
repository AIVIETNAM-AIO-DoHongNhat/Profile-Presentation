"use client";
// Mục I–IV. Quy tắc bố cục chung: hậu cảnh z ∈ [−4.5, −2.5], sân khấu z ∈ [−1.5, 1.5], làn chú thích z = 3.4
// (mỗi nhịp đúng một dòng). Mỗi nhịp một điểm nhấn: vật của nhịp trước gập lại hoặc nhạt đi, không chồng lên nhau.
import { P, building, chat, doc, deskGlobe, groupPage, heart, house, megaphone, orgChart, person, playIcon, rr, server, shape, sign, text, globe, MONO, SERIF } from "../art";
import { DropIn, Magnifier, RubberStamp } from "../desk";
import { C, Tag, useDelayed } from "../fx";
import { CONCEPT_X, TRIO_X, TYPES_X } from "../layout";
import { CARRY, Ripple } from "../particles";
import { Card, InkPath, type CarrierSpec, type Draw } from "../pop";
import { crowdW, dCrowd, dIcon, dLaptop, dPerson, dPhone } from "./draws";

type SP = { step: number };
type G = CanvasRenderingContext2D;
/** chú thích đánh máy trên trang */
export const cap = (t: string, x: number, z: number, show = true, color: string = C.ink, size = 0.19) =>
  <Tag key={`${t}${x}${z}`} text={t} position={[x, -1.25, z]} size={size} show={show} color={color} />;
/** Làn chú thích: dải cố định ở mép trước trang. Mỗi nhịp đúng một dòng, căn theo tâm vùng đang nói. */
export const LANE_Z = 3.4;
export const lane = (t: string, x: number, show = true, color: string = C.red, size = 0.23) => cap(t, x, LANE_Z, show, color, size);
/** người tí hon chạy dọc đường mực (lực lượng được đưa qua lại) */
const PERSON_CARRY: CarrierSpec = { id: "cr-person", w: 0.42, h: 0.7, count: 2, draw: dPerson({ body: P.slate }) };

/* =============================== I. KHÁI NIỆM ===============================
   "Dây chuyền hình thành", đọc từ trái sang phải; camera lia sang một vùng mỗi nhịp:
   A (x −4.5) lợi dụng không gian mạng → B (x 0) tuyên truyền, lôi kéo → C (x 4.5) hình thành tổ chức → D (x 9) chống phá. */
const [ZA, ZB, ZC, ZD] = CONCEPT_X;
const PEOPLE: { b: [number, number]; c: [number, number]; o: Parameters<typeof dPerson>[0]; tag?: string }[] = [
  { b: [ZB - 2.2, 0.8], c: [ZC - 1.9, 0.3], o: { body: P.sand, angry: true }, tag: "BẤT MÃN" },
  { b: [ZB - 1.2, 1.8], c: [ZC - 1.1, 1.1], o: { body: P.slate, phone: true } },
  { b: [ZB, 2.1], c: [ZC, 1.3], o: { body: P.blueSoft }, tag: "CÙNG QUAN ĐIỂM" },
  { b: [ZB + 1.2, 1.8], c: [ZC + 1.1, 1.1], o: { body: P.slate, phone: true } },
  { b: [ZB + 2.2, 0.8], c: [ZC + 1.9, 0.3], o: { body: P.sand }, tag: "NHẬN THỨC HẠN CHẾ" },
];
export function ConceptStation({ step }: SP) {
  const s0 = step >= 0, org = step >= 2, end = step >= 3;
  const hoodAt: [number, number] = step <= 0 ? [ZA, 0.4] : step === 1 ? [ZB, -1.2] : [ZC - 2.9, -2.4];
  return <group>
    {/* A: ba nền tảng ở hậu cảnh, đối tượng đứng trước */}
    <Card id="c-net" w={2.1} h={1.75} at={[ZA - 2.0, -2.4]} on={s0} dim={step >= 1} draw={dLaptop((g, x, y, w, h) => globe(g, x + w / 2, y + h / 2, h * 0.38))} />
    <Card id="c-mxh" w={1.35} h={2.3} at={[ZA, -2.7]} on={s0} dim={step >= 1} delay={0.15} draw={dPhone((g, x, y, w, h) => groupPage(g, x, y, w, h, { name: "Nhóm cộng đồng" }))} />
    <Card id="c-video" w={2.1} h={1.75} at={[ZA + 2.0, -2.4]} on={s0} dim={step >= 1} delay={0.3} draw={dLaptop((g, x, y, w, h) => playIcon(g, x + w * 0.3, y + h * 0.22, w * 0.4, h * 0.56))} />
    <Card id="c-hood" w={1.5} h={2.1} at={hoodAt} on={s0} speed={1.6} dim={end} ring={step === 0}
      draw={dPerson({ hood: true, body: "#3a3d43", laptop: true })} />
    {lane("LỢI DỤNG INTERNET · MẠNG XÃ HỘI · NỀN TẢNG SỐ", ZA, step === 0)}
    {/* B: phong bì tuyên truyền tỏa tới 5 người; C: 5 người đi sang, đứng hai bên dưới sơ đồ tổ chức */}
    {PEOPLE.map((p, i) => <group key={i}>
      <Card id={`c-r${i}`} w={0.95} h={1.6} at={org ? p.c : p.b} on={step >= 1} delay={0.1 * i} speed={1.5 + i * 0.08} dim={end}
        draw={dPerson(p.o)} back={{ id: `c-r${i}-red`, draw: dPerson({ ...p.o, body: P.red, angry: false }) }} flipped={org} />
      <InkPath pts={[[ZB, -0.9], [p.b[0], p.b[1] - 0.35]]} on={step === 1} dash={0.2} width={0.03} delay={0.6 + i * 0.1} flow carrier={{ ...CARRY.envelope, count: 1 }} />
      {p.tag && cap(p.tag, p.b[0], p.b[1] + 0.5, step === 1, C.red, 0.15)}
    </group>)}
    {lane("TUYÊN TRUYỀN · MÓC NỐI · LÔI KÉO", ZB, step === 1)}
    <Card id="c-org" w={3.6} h={2.6} at={[ZC, -2.5]} on={org} delay={0.9} ring={step === 2} dim={end} draw={(g, W, H) => orgChart(g, 10, 10, W - 20, H - 20, "TỔ CHỨC")} />
    {lane("LIÊN KẾT, HÌNH THÀNH TỔ CHỨC · TÊN GỌI, CƯƠNG LĨNH, CƠ CẤU", ZC, step === 2)}
    {/* D: mũi tên từ tổ chức sang trụ sở; trụ sở lật sang bản nứt, con dấu đập xuống */}
    <InkPath pts={[[ZC + 1.9, -2.3, 1.6], [ZC + 3.0, -2.2, 2.7], [ZD - 1.6, -2.0, 1.7]]} on={end} arrow width={0.07} delay={0.3} />
    <Card id="c-state" w={3.4} h={2.6} at={[ZD + 0.3, -2.1]} on={end} delay={0.1} rotY={-0.2}
      draw={(g, W, H) => building(g, W / 2, H - 8, W * 0.86, { star: true })} back={{ id: "c-state-crack", draw: (g, W, H) => building(g, W / 2, H - 8, W * 0.86, { star: true, cracked: true }) }}
      flipped={useDelayed(end, 1.2)} jolt={end} joltDelay={1.2} />
    <RubberStamp at={[ZD, 0.9]} text="CHỐNG PHÁ" on={end} delay={1.9} size={0.7} restDx={null} />
    {lane("MỤC ĐÍCH: CHỐNG PHÁ ĐẢNG, NHÀ NƯỚC", ZD, step === 3)}
  </group>;
}

/* =============================== II. ĐẶC ĐIỂM ===============================
   Ba "phép biến hình", camera đẩy vào cụm đang nói. Tiêu đề ba cụm nằm ở làn chú thích. */
function Feat1({ step }: SP) {
  const on = step === 0;
  return <group position={[TRIO_X[0], 0, 0]}>
    <InkPath pts={[[0.6, -3.6], [0.4, 0], [0.6, 2.4]]} dash={0.3} width={0.05} />
    {cap("BIÊN GIỚI", 0.6, -3.9, true, C.red, 0.16)}
    <Card id="f1-m1" w={1.15} h={1.8} at={[-2.4, -0.9]} draw={dPerson({ mask: true, body: P.slate, laptop: true })} />
    <Card id="f1-m2" w={1.15} h={1.8} at={[-2.9, 1.1]} delay={0.15} draw={dPerson({ mask: true, body: P.sand, phone: true })} />
    <Card id="f1-srv" w={1.4} h={1.9} at={[2.4, -1.4]} delay={0.3} draw={(g, W, H) => { server(g, W * 0.1, H * 0.05, W * 0.8, H * 0.7); text(g, "MÁY CHỦ", W / 2, H * 0.88, MONO(Math.round(H * 0.1), 800)); }} />
    <Card id="f1-globe" w={1.3} h={1.3} at={[3.4, 0.6]} delay={0.4} draw={dIcon((g, cx, cy, s) => deskGlobe(g, cx, cy - s * 0.12, s * 0.33))} />
    <Card id="f1-user" w={0.95} h={1.55} at={[-0.9, 1.6]} delay={0.5} draw={dPerson({ body: P.blueSoft, phone: true })} />
    {/* gói tin từ tài khoản ảo dội qua máy chủ nước ngoài rồi mới tới người nhận: vượt biên giới hai lần */}
    <InkPath pts={[[-2.0, -0.7], [2.0, -1.0, 0.6], [-0.6, 1.3]]} on dash={0.22} width={0.035} delay={0.7} flow={on} carrier={{ ...CARRY.envelope, count: 2 }} />
  </group>;
}
function Feat2({ step }: SP) {
  const now = step === 1, unmasked = useDelayed(step >= 1, 1.6);
  return <group position={[TRIO_X[1], 0, 0]}>
    {/* biển "xã hội dân sự" lật mặt thành tổ chức phản động (không trượt đè lên gì) */}
    <Card id="f2-sign" w={3.6} h={2.8} at={[-0.2, -1.2]} ring={now && unmasked}
      draw={(g, W, H) => sign(g, W / 2, H - 6, W * 0.96, H * 0.98, "HỘI XÃ HỘI DÂN SỰ", "Dân chủ · Nhân quyền · Cải tổ", P.greenSoft)}
      back={{ id: "f2-real", draw: (g, W, H) => { sign(g, W / 2, H - 6, W * 0.96, H * 0.98, "", undefined, P.redSoft, P.red); orgChart(g, W * 0.12, H * 0.08, W * 0.76, H * 0.5, "TỔ CHỨC PHẢN ĐỘNG"); } }}
      flipped={unmasked} />
    <Magnifier from={[-2.8, 0.2, 0.6]} to={[1.0, 0.35, 0.6]} on={now} delay={0.2} size={0.9} />
    <Card id="f2-globe" w={1.3} h={1.3} at={[2.9, 0.2]} on={unmasked} delay={0.4} draw={dIcon((g, cx, cy, s) => deskGlobe(g, cx, cy - s * 0.12, s * 0.33), "QUỐC TẾ HÓA")} />
    <InkPath pts={[[2.4, 0.0, 0.9], [2.0, -0.6, 1.4], [1.6, -1.0, 1.2]]} on={unmasked} arrow delay={0.9} width={0.04} />
  </group>;
}
const F3: [number, number][] = [[-2.9, -2.1], [2.9, -2.1], [-2.9, 1.0], [2.9, 1.0]];
function Feat3({ step }: SP) {
  const linking = step >= 2, merge = useDelayed(linking, 1.6);
  return <group position={[TRIO_X[2], 0, 0]}>
    {F3.map(([x, z], i) => <Card key={i} id={`f3-g${i}`} w={crowdW(3, 1.3)} h={1.3} at={merge ? [(i % 2 ? 1 : -1) * 1.05, i < 2 ? -1.2 : 0.2] : [x, z]} speed={1.6} delay={i * 0.1}
      draw={dCrowd(3, k => ({ body: [P.slate, P.sand, P.blueSoft][(i + k) % 3] }))} back={{ id: `f3-g${i}r`, draw: dCrowd(3, () => ({ body: P.red })) }} flipped={merge} />)}
    {/* phản ứng dây chuyền: chỉ nối nhóm này sang nhóm kia, rồi cả bốn dồn lại thành một */}
    {([[0, 1], [1, 3], [3, 2], [2, 0]] as [number, number][]).map(([a, b], k) =>
      <InkPath key={k} pts={[[F3[a][0], F3[a][1] + 0.3], [F3[b][0], F3[b][1] + 0.3]]} on={linking && !merge} dash={0.2} width={0.04} delay={k * 0.3} arrow />)}
    <RubberStamp at={[0, 1.9]} text="SÁP NHẬP · MỞ RỘNG" on={merge} delay={0.9} size={0.75} restDx={null} />
  </group>;
}
export function FeaturesStation({ step }: SP) {
  return <group>
    <Feat1 step={step} /><Feat2 step={step} /><Feat3 step={step} />
    {["01 · ẨN DANH, XUYÊN BIÊN GIỚI, PHI TẬP TRUNG", "02 · CÔNG KHAI HÓA, HỢP PHÁP HÓA, QUỐC TẾ HÓA", "03 · LAN TRUYỀN NHANH, MỞ RỘNG LINH HOẠT"].map((t, i) => lane(t, TRIO_X[i], true, i === step ? C.red : C.grey, 0.21))}
  </group>;
}

/* =============================== III. CÁC DẠNG HỘI NHÓM ===============================
   Một cảnh duy nhất: hai hòn đảo "Trên mạng" ↔ "Thực tế". Mỗi nhịp bắc thêm cầu nối giữa hai đảo. */
const meeting = (red = false): Draw => (g, W, H) => {
  house(g, W * 0.5, H * 0.55, W * 0.5, P.cream);
  for (let i = 0; i < 4; i++) person(g, W * (0.16 + i * 0.22), H - 8, H * 0.46, { body: red ? P.redSoft : [P.slate, P.sand, P.blueSoft, P.slate][i] });
};
function channel(g: G, x: number, y: number, w: number, h: number) {
  megaphone(g, x + w / 2, y + h * 0.33, w * 0.42);
  text(g, "KÊNH TIN", x + w / 2, y + h * 0.62, SERIF(Math.round(w * 0.12), 800));
  for (let i = 0; i < 3; i++) { g.fillStyle = P.slate; g.fillRect(x + w * 0.12, y + h * (0.72 + i * 0.07), w * 0.76 * (1 - i * 0.15), 7); }
}
/** hòn đảo: mảng giấy màu nằm trên trang, tên đảo ở mép dưới */
const island = (fill: string, label: string): Draw => (g, W, H) => {
  g.beginPath();
  for (let i = 0; i <= 40; i++) { const a = (i / 40) * Math.PI * 2, r = 1 + 0.05 * Math.sin(a * 5) + 0.03 * Math.sin(a * 9); g.lineTo(W / 2 + Math.cos(a) * (W / 2 - 12) * r * 0.96, H / 2 + Math.sin(a) * (H / 2 - 12) * r * 0.96); }
  shape(g, fill, 6, P.ink2);
  text(g, label, W / 2, H * 0.86, MONO(Math.round(H * 0.07), 800), P.ink2);
};
const [ON_X, OFF_X] = TYPES_X;
export function TypesStation({ step }: SP) {
  const one = step >= 1, two = step >= 2;
  return <group>
    <Card id="t-isl-on" w={4.4} h={3.6} flat at={[ON_X, -0.3]} draw={island(P.blueSoft, "TRÊN MẠNG")} trail={false} />
    <Card id="t-isl-off" w={4.4} h={3.6} flat at={[OFF_X, -0.3]} delay={0.2} draw={island(P.sand, "THỰC TẾ")} trail={false} />
    {/* đảo mạng: điện thoại nhóm, đổi màn hình theo dạng */}
    <Card id="t-phone" w={1.5} h={2.6} at={[ON_X, -1.1]} delay={0.3} trail={false}
      draw={dPhone((g, x, y, w, h) => groupPage(g, x, y, w, h, { name: "Nhóm A" }))}
      back={{ id: two ? "t-phone-chat" : "t-phone-ch", draw: dPhone(two ? (g, x, y, w, h) => chat(g, x, y, w, h, { title: "Nhóm A" }) : channel) }} flipped={one} />
    {/* đảo thực tế: dạng 01 chưa có gì (khung nét đứt), dạng 02–03 có cuộc họp */}
    <InkPath pts={[[OFF_X - 1.3, -1.8], [OFF_X + 1.3, -1.8], [OFF_X + 1.3, 0.2], [OFF_X - 1.3, 0.2], [OFF_X - 1.3, -1.8]]} on={!one} dash={0.2} width={0.035} color={P.ink2} delay={0.5} />
    {cap("(KHÔNG CÓ)", OFF_X, -0.8, !one, C.grey, 0.2)}
    <Card id="t-meet" w={2.5} h={2.1} at={[OFF_X, -1.1]} on={one} delay={0.3} draw={meeting(false)} back={{ id: "t-meet-red", draw: meeting(true) }} flipped={two} />
    {/* cầu nối: dạng 02 một chiều (mạng → thực tế), dạng 03 hai chiều */}
    <InkPath pts={[[ON_X + 1.3, -0.1], [(ON_X + OFF_X) / 2, -0.3, 0.9], [OFF_X - 1.5, -0.1]]} on={one} arrow width={0.05} delay={0.6} carrier={PERSON_CARRY} />
    <InkPath pts={[[OFF_X - 1.5, 1.0], [(ON_X + OFF_X) / 2, 1.2, 0.7], [ON_X + 1.3, 1.0]]} on={two} arrow width={0.05} delay={0.6} carrier={PERSON_CARRY} />
    {lane("DẠNG 01 · MỌI HOẠT ĐỘNG ĐỀU TRÊN MẠNG", (ON_X + OFF_X) / 2, step === 0)}
    {lane("DẠNG 02 · LÀM KÊNH TRUYỀN THÔNG, PHÁT TRIỂN LỰC LƯỢNG CHO NHÓM THỰC TẾ", (ON_X + OFF_X) / 2, step === 1)}
    {lane("DẠNG 03 · CÙNG THÀNH VIÊN; THỰC TẾ KHÓ KHĂN THÌ CHUYỂN LÊN MẠNG", (ON_X + OFF_X) / 2, step === 2)}
  </group>;
}

/* =============================== IV. HÌNH THỨC THÀNH LẬP ===============================
   Ba cách "dựng nhà", camera hạ từ trên xuống từng cụm. */
const brick = (t: string, fill: string): Draw => (g, W, H) => { rr(g, 8, 8, W - 16, H - 16, 10); shape(g, fill, 6); text(g, t, W / 2, H / 2 + 2, MONO(Math.round(H * 0.22), 800), P.ink, "center", W - 30); };
export function FormsStation({ step }: SP) {
  const fixed = step >= 1, gathered = useDelayed(fixed, 1.1), bad = step >= 2, infected = useDelayed(bad, 1.2);
  return <group>
    {/* 01 lập mới: ba khối rơi xuống xếp hàng, biển tổ chức dựng lên phía sau, thành viên kéo tới */}
    <group position={[TRIO_X[0], 0, 0]}>
      {[["TÊN GỌI", P.ochreSoft], ["TÔN CHỈ", P.blueSoft], ["CƯƠNG LĨNH", P.redSoft]].map(([t, f], i) =>
        <DropIn key={t} on={step >= 0} delay={0.2 + i * 0.35} from={[0, 3.5, 0]} spin={0.4 * (i - 1)}>
          <Card id={`fm1-b${i}`} w={1.7} h={0.85} at={[-1.8 + i * 1.8, 0.2]} delay={0.2 + i * 0.35} trail={false} draw={brick(t, f)} />
        </DropIn>)}
      <Card id="fm1-sign" w={3.2} h={2.3} at={[0, -2.2]} delay={1.4} draw={(g, W, H) => sign(g, W / 2, H - 6, W * 0.96, H * 0.98, "TỔ CHỨC MỚI", "Lần đầu xuất hiện", P.redSoft)} />
      {[[-1.6, 1.6], [0, 1.9], [1.6, 1.6]].map(([x, z], i) => <Card key={i} id={`fm1-p${i}`} w={0.9} h={1.45} at={[x, z]} delay={1.8 + i * 0.12} draw={dPerson({ body: P.red })} />)}
    </group>
    {/* 02 phục hồi: mảnh giấy rách bay tụ lại, rồi tờ tên mới bật lên, đóng dấu */}
    <group position={[TRIO_X[1], 0, 0]}>
      {[[-2.6, -1.4, 0.3], [0.3, 1.4, -0.5], [2.6, -0.6, 0.8]].map(([x, z, r], i) => <Card key={i} id={`fm2-torn${i}`} w={1.5} h={1.8} flat at={fixed ? [-0.6 + i * 0.6, -0.6] : [x, z]} rotY={fixed ? 0 : r} on={!gathered} speed={1.6}
        draw={(g, W, H) => doc(g, 10, 10, W - 20, H - 20, { torn: true, fill: P.cream, lines: 4 })} />)}
      <Card id="fm2-new" w={2.3} h={2.9} at={[0, -1.6]} on={gathered} draw={(g, W, H) => doc(g, 10, 10, W - 20, H - 20, { title: "TÊN MỚI", lines: 5 })} />
      <RubberStamp at={[0, 1.2]} text="ĐƯỜNG HƯỚNG CŨ" on={gathered} delay={0.7} size={0.7} restDx={null} />
      {[[-2.4, 0.9], [2.4, 0.8]].map(([x, z], i) => <Card key={i} id={`fm2-p${i}`} w={0.9} h={1.45} at={gathered ? [x * 0.7, -0.4] : [x, z]} speed={1.6} delay={0.2} draw={dPerson({ body: P.slate2 })} />)}
    </group>
    {/* 03 biến chất: mực đỏ loang từ kẻ đứng sau, biển từ thiện và quản trị viên đổi màu */}
    <group position={[TRIO_X[2], 0, 0]}>
      <Card id="fm3-sign" w={3.2} h={2.5} at={[-0.6, -1.9]}
        draw={(g, W, H) => { sign(g, W / 2, H - 6, W * 0.96, H * 0.98, "NHÓM TỪ THIỆN", "Hội đồng hương · Môi trường", P.greenSoft); heart(g, W * 0.12, H * 0.2, H * 0.14); }}
        back={{ id: "fm3-sign-bad", draw: (g, W, H) => sign(g, W / 2, H - 6, W * 0.96, H * 0.98, "NHÓM ĐÃ BIẾN CHẤT", "Chống phá Đảng, Nhà nước", P.redSoft, P.red) }} flipped={infected} />
      <Card id="fm3-crowd" w={crowdW(4, 1.4)} h={1.4} at={[-1.0, 0.9]} delay={0.2} draw={dCrowd(4, i => ({ body: [P.greenSoft, P.slate, P.sand, P.greenSoft][i] }))}
        back={{ id: "fm3-crowd-bad", draw: dCrowd(4, () => ({ body: P.redSoft, angry: true })) }} flipped={infected} />
      <Card id="fm3-admin" w={1.0} h={1.6} at={[1.6, 0.2]} delay={0.3} ring={bad} draw={dPerson({ body: P.greenSoft, badge: "QTV" })} back={{ id: "fm3-admin-bad", draw: dPerson({ body: P.red, badge: "QTV" }) }} flipped={infected} />
      <Card id="fm3-hood" w={1.2} h={1.8} at={bad ? [2.9, -0.7] : [5.5, 1.0]} on={bad} speed={1.8} draw={dPerson({ hood: true, body: "#3a3d43" })} />
      <Ripple at={[2.5, -0.4]} r={3.4} on={bad} delay={0.6} rings={2} />
    </group>
    {["01 · LẬP TỔ CHỨC MỚI", "02 · PHỤC HỒI TỔ CHỨC CŨ", "03 · CÀI NGƯỜI, LÀM BIẾN CHẤT NHÓM HỢP PHÁP"].map((t, i) => lane(t, TRIO_X[i], true, i === step ? C.red : C.grey, 0.21))}
  </group>;
}
