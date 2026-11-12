// Toàn bộ nội dung trình chiếu. Sửa chữ tại đây, không cần đụng vào giao diện.
// Mỗi "beat" là một nhịp bấm chuột: chữ trong phiếu bên trái sáng lên đúng lúc cảnh 3D chuyển động.

export type Link = { label: string; to: number };
export type Beat = { k?: string; t: string; d?: string; x?: string };
export type CaseData = {
  num: string; name: string; tag: string; image: string; imageHint: string; stamp: string;
  meta: [string, string][]; findings: string[]; lesson: string; source: string; links: Link[];
  /** ảnh bổ sung gắn với tình tiết cuối: [tên file trong public/images, chú thích] */
  extra?: [string, string];
};
export type Slide =
  | { kind: "cover" }
  | { kind: "team" }
  | { kind: "toc" }
  | { kind: "concept"; beats: Beat[] }
  | { kind: "features"; beats: Beat[] }
  | { kind: "types"; beats: Beat[]; links: Link[] }
  | { kind: "case"; data: CaseData }
  | { kind: "forms"; beats: Beat[]; links: Link[] }
  | { kind: "network"; beats: Beat[] }
  | { kind: "stage"; sec: string; kicker: string; title: string; rows: [string, string, string][]; data: CaseData; timeline?: [string, string][] }
  | { kind: "conclusion"; beats: Beat[]; require: string }
  | { kind: "closing"; recap: RecapItem[]; cases: Link[] };
/** Một ô trong bảng ghi nhớ trang 15. Chữ trong **…** được in đậm. */
export type RecapItem = { n: string; label: string; to: number; head: string; items: string[]; note?: string };

/* ---------- thông tin chung, sửa tại đây ---------- */
export const TOPIC = "Tập hợp lực lượng, thành lập tổ chức phản động trên không gian mạng";
/** Dòng thông tin dưới tên chuyên đề ở trang bìa: [nhãn, nội dung]. Thêm dòng nếu cần, ví dụ ["THỜI GIAN", "15/11/2026"]. */
export const COVER: [string, string][] = [["NHÓM", "Tiểu đội 2"]];
/* ---------- trang 2: ảnh nhóm, khoanh mặt từng người ---------- */
/** Bốn vai trò. Mỗi vai trò một màu bút chì. */
export const ROLES = [
  { label: "Nhóm trưởng", color: "#e2454d" },
  { label: "Thuyết trình", color: "#f2b632" },
  { label: "Thiết kế slide", color: "#45a7f0" },
  { label: "Tìm kiếm tài liệu", color: "#5fd08a" },
] as const;
export type Member = {
  name: string;
  /** chỉ số trong ROLES: 0 nhóm trưởng, 1 thuyết trình, 2 slide, 3 tìm tài liệu */
  role: 0 | 1 | 2 | 3;
  /** vị trí khuôn mặt trên ảnh, tính theo tỉ lệ: x, y (0..1 từ góc trên trái) và bán kính (theo chiều ngang ảnh) */
  face: [number, number, number];
};
export const TEAM_PHOTO = "/images/team.jpg";
/** Sửa họ tên (name) và vai trò (role) từng người ở đây. Để name trống thì thẻ chỉ hiện số. Vị trí mặt đã đo sẵn theo ảnh team.jpg, không cần sửa. */
export const MEMBERS: Member[] = [
  // Số thứ tự (01..10) là số hiện trên thẻ ở trang 2: hàng trên đánh từ trái sang phải, rồi đến hàng trước.
  { name: "Nguyễn Huy Hoàng", role: 3, face: [0.268, 0.160, 0.044] }, // 01 áo len đỏ, đeo kính (hàng sau, trái)
  { name: "Huỳnh Nguyễn Bảo Khương", role: 3, face: [0.375, 0.232, 0.040] }, // 02 áo phông đen
  { name: "Cao Quang Hải", role: 3, face: [0.435, 0.185, 0.038] }, // 03 áo đen, đứng cao
  { name: "Đỗ Hồng Nhất", role: 2, face: [0.540, 0.342, 0.040] }, // 04 áo nỉ xám (đứng giữa)
  { name: "Nguyễn Thế Hùng", role: 3, face: [0.580, 0.240, 0.036] }, // 05 áo be
  { name: "Nguyễn Cửu An Phú", role: 1, face: [0.683, 0.186, 0.036] }, // 06 áo xanh dương
  { name: "Nguyễn Tiến Mạnh", role: 3, face: [0.745, 0.214, 0.040] }, // 07 áo len kẻ ô (hàng sau, phải)
  { name: "Nguyễn Sỹ Long", role: 1, face: [0.400, 0.535, 0.042] }, // 08 áo đấu trắng (hàng trước, trái)
  { name: "Phạm Khánh Linh", role: 0, face: [0.552, 0.560, 0.040] }, // 09 áo khoác đen, tóc dài (hàng trước, giữa)
  { name: "Nguyễn Minh Hiếu", role: 3, face: [0.670, 0.520, 0.042] }, // 10 áo phông xám (hàng trước, phải)
];
/** Thứ tự khoanh: theo vai trò (nhóm trưởng trước), cùng vai trò thì từ trái sang phải. */
export const TEAM_ORDER: number[] = MEMBERS.map((_, i) => i).sort((a, b) => MEMBERS[a].role - MEMBERS[b].role || MEMBERS[a].face[0] - MEMBERS[b].face[0]);
/** Bấm một lần, nét bút khoanh lần lượt từng người, cách nhau bấy nhiêu giây. */
export const TEAM_STAGGER = 0.55;

export const SECTIONS = [
  { n: "I", label: "Khái niệm", to: 4 }, { n: "II", label: "Đặc điểm", to: 5 }, { n: "III", label: "Các dạng", to: 6 },
  { n: "IV", label: "Hình thức", to: 8 }, { n: "V", label: "Thủ đoạn", to: 10 }, { n: "VI", label: "Nhận xét", to: 14 },
];
/** Tên ngắn từng trang, dùng cho mục lục và màn hình tổng quan (phím O) */
export const TITLES = ["Bìa", "Thành viên", "Mục lục", "Khái niệm", "Đặc điểm", "Ba dạng hội nhóm", "Vụ việc 01 · Hội anh em dân chủ", "Ba hình thức thành lập", "Vụ việc 02 · Triều Đại Việt",
  "Sơ đồ đơn tuyến", "GĐ1 · Tập hợp lực lượng", "GĐ2 · Thành lập, điều hành", "GĐ3 · Duy trì, phát triển", "Nhận xét chung", "Tổng hợp · Lời cảm ơn"];
export const SEC_OF = [0, "", "§", "§", "I", "II", "III", "III", "IV", "IV", "V", "V.1", "V.2", "V.3", "VI", "§"];

/** Chữ trong **…** được highlight trên phiếu (chỉ dùng cho khái niệm cốt lõi). */
export const DEFINITION = "Hoạt động của các đối tượng phản động lợi dụng internet, mạng xã hội và nền tảng số để **tuyên truyền, móc nối, lôi kéo** người cùng quan điểm, người bất mãn hoặc nhận thức hạn chế, nhằm **hình thành và phát triển tổ chức phản động**.";
export const PURPOSE = "Chống phá Đảng Cộng sản Việt Nam và Nhà nước Cộng hòa xã hội chủ nghĩa Việt Nam.";

const c1: CaseData = {
  num: "01", name: "“Hội anh em dân chủ”", tag: "Minh họa dạng 03 · Nhóm liên kết hoàn toàn với nhóm thực tế",
  image: "vv01.jpg", imageHint: "Bị cáo Nguyễn Văn Đài tại phiên tòa 5/4/2018 · Ảnh: TTXVN", stamp: "Đã xét xử",
  meta: [["Thời gian", "2013 – 2017"], ["Đối tượng", "Nguyễn Văn Đài và đồng bọn"], ["Minh họa", "Dạng 03, liên kết hoàn toàn"], ["Tài trợ", "71.726 USD và 9.161 EUR"], ["Xét xử", "TAND TP Hà Nội, 5/4/2018"]],
  findings: ["Lập nhóm kín, sinh hoạt và họp qua internet, có cương lĩnh, điều lệ, cơ cấu chặt chẽ.", "Lập văn phòng đại diện, website. Lợi dụng sự cố môi trường biển năm 2016 để kích động.", "Tòa xác định sinh hoạt qua mạng chỉ là phương thức, bản chất vẫn là một tổ chức."],
  lesson: "Hình thức sinh hoạt trên mạng không thay đổi bản chất tổ chức.",
  source: "Nguồn: Cáo trạng VKSND Tối cao, phiên tòa TAND TP Hà Nội ngày 5/4/2018", links: [{ label: "Dạng 03 · Liên kết hoàn toàn", to: 6 }],
};
const c2: CaseData = {
  num: "02", name: "“Triều Đại Việt”", tag: "Minh họa · Lập tổ chức mới từ phần tử của tổ chức cũ",
  image: "vv02.jpg", imageHint: "Hiện trường một vụ gây nổ · Ảnh: Bộ Công an", stamp: "Tổ chức khủng bố",
  extra: ["vv02b.jpg", "Vật liệu nổ thu giữ · Ảnh: Bộ Công an"],
  meta: [["Thành lập", "Tháng 1/2018, trụ sở Canada"], ["Nguồn gốc", "Cựu thành viên tổ chức cũ"], ["Minh họa", "Lập tổ chức mới từ tổ chức cũ"], ["Hậu quả", "Gây nổ trụ sở CA, 20/6/2018"], ["Xử lý", "17 đối tượng bị bắt, truy tố"]],
  findings: ["Do cựu thành viên tổ chức khủng bố “Chính phủ quốc gia Việt Nam lâm thời” lập ra.", "Vận hành nhiều website, kênh truyền thông. Gửi hàng chục nghìn USD về nước.", "Chỉ đạo gây nổ trụ sở Công an phường 12, quận Tân Bình, TP.HCM."],
  lesson: "Phần tử của tổ chức đã bị đấu tranh là nguồn hình thành tổ chức mới.",
  source: "Nguồn: Thông báo của Bộ Công an về tổ chức khủng bố “Triều Đại Việt”", links: [{ label: "Hình thức · Thành lập tổ chức mới", to: 8 }],
};
const c3: CaseData = {
  num: "03", name: "“Hội nhà báo độc lập Việt Nam”", tag: "", image: "vv03.jpg", imageHint: "Phiên tòa xét xử ngày 5/1/2021 · Ảnh: TTXVN", stamp: "Đã xét xử",
  meta: [["Thành lập", "2014, 41 người"], ["Kênh", "Việt Nam Thời Báo"], ["Đăng tải", "1.530 tin, bài"], ["Xét xử", "5/1/2021, 15 năm tù"]],
  findings: [], lesson: "", source: "Nguồn vụ việc: Báo Pháp luật Việt Nam, PLO, phiên tòa TAND TP.HCM ngày 5/1/2021", links: [{ label: "Dạng 02 · Liên kết một phần", to: 6 }],
};
const c4: CaseData = {
  num: "04", name: "“Chính phủ quốc gia VN lâm thời”", tag: "", image: "vv04.jpg", imageHint: "Đào Minh Quân, Phạm Lisa · Ảnh: Báo Tiền Phong", stamp: "Tổ chức khủng bố",
  meta: [["Lôi kéo", "225 người qua Facebook"], ["Liên lạc", "Bí danh, bí số, nhóm kín"], ["Cử về nước", "2/2017, 2 người"], ["Xét xử", "14/5/2026, tù chung thân"]],
  findings: [], lesson: "", source: "Nguồn vụ việc: Cáo trạng, bản án các vụ liên quan tổ chức “Chính phủ quốc gia Việt Nam lâm thời”", links: [{ label: "Sơ đồ đơn tuyến", to: 10 }],
};
const c5: CaseData = {
  num: "05", name: "“Người Thượng vì công lý” (MSFJ)", tag: "", image: "vv05.jpg", imageHint: "Phiên tòa tại Đắk Lắk, 1/2024 · Ảnh: Báo SGGP", extra: ["vv05b.jpg", "Trụ sở xã Ea Tiêu sau vụ tấn công 11/6/2023 · Ảnh: Báo SGGP"], stamp: "Tổ chức khủng bố",
  meta: [], findings: [], lesson: "", source: "Nguồn vụ việc: Công an tỉnh Đắk Lắk, TAND tỉnh Đắk Lắk, thông báo của Bộ Công an", links: [{ label: "Đặc điểm · Quốc tế hóa", to: 5 }],
};

export const SLIDES: Slide[] = [
  { kind: "cover" },
  { kind: "team" },
  { kind: "toc" },
  { kind: "concept", beats: [
    { k: "Khởi đầu", t: "Cá nhân rời rạc trên mạng", d: "Đối tượng phát tán nội dung để thăm dò, tìm người hưởng ứng." },
    { k: "Quá trình 01", t: "Tập hợp lực lượng", d: "Tìm kiếm, móc nối, lôi kéo, sàng lọc, tuyển chọn người tham gia." },
    { k: "Quá trình 02", t: "Thành lập tổ chức", d: "Xác lập tên gọi, tôn chỉ, cương lĩnh, cơ cấu, kết nạp thành viên." }] },
  { kind: "features", beats: [
    { k: "Đặc điểm 01", t: "Ẩn danh, xuyên biên giới, phi tập trung", d: "Tài khoản ảo, máy chủ đặt ở nước ngoài. Liên kết không giới hạn về địa lý, gắn chặt với tổ chức phản động lưu vong." },
    { k: "Đặc điểm 02", t: "Công khai hóa, hợp pháp hóa, quốc tế hóa", d: "Núp danh nghĩa xã hội dân sự, dân chủ, nhân quyền để che giấu bản chất, gây sức ép đòi công nhận tổ chức đối lập." },
    { k: "Đặc điểm 03", t: "Lan truyền nhanh, mở rộng linh hoạt", d: "Khuếch trương thanh thế nhanh. Nhiều nhóm nhỏ liên kết, sáp nhập thành tổ chức có quy mô lớn hơn." }] },
  { kind: "types", links: [{ label: "Vụ việc 01 · Dạng 03", to: 7 }, { label: "Vụ việc 03 · Dạng 02", to: 11 }], beats: [
    { k: "Dạng 01", t: "Hoàn toàn trên mạng", d: "Không liên hệ với nhóm nào ngoài thực tế. Mọi hoạt động diễn ra trên mạng." },
    { k: "Dạng 02", t: "Liên kết một phần", d: "Làm kênh truyền thông cho nhóm thực tế. Tuyên truyền, khuếch trương, phát triển lực lượng." },
    { k: "Dạng 03", t: "Liên kết hoàn toàn", d: "Thành viên trùng nhau, hoạt động song song. Bị đấu tranh trên thực tế thì chuyển lên mạng." }] },
  { kind: "case", data: c1 },
  { kind: "forms", links: [{ label: "Vụ việc 02 · Lập tổ chức mới", to: 9 }], beats: [
    { k: "Hình thức 01", t: "Thành lập tổ chức mới", d: "Tên gọi, tôn chỉ, cương lĩnh, thành phần lần đầu xuất hiện.", x: "Tuyên bố thành lập, công bố cương lĩnh" },
    { k: "Hình thức 02", t: "Phục hồi tổ chức cũ", d: "Liên kết lại phần tử đảng phái phản động cũ, tổ chức đã bị phá rã.", x: "Tên mới, đường hướng cũ" },
    { k: "Hình thức 03", t: "Làm biến chất nhóm hợp pháp", d: "Cài người, khống chế quản trị viên hội đồng hương, nhóm từ thiện, môi trường.", x: "Đổi quản trị viên, nội dung chuyển hướng" }] },
  { kind: "case", data: c2 },
  { kind: "network", beats: [
    { k: "Giai đoạn 1", t: "Hội nhóm công khai", d: "Hội nhóm công khai, đông người. Tuyên truyền, thăm dò dư luận." },
    { k: "Giai đoạn 1", t: "Chấm chọn", d: "Chấm chọn phần tử bất mãn trong đám đông." },
    { k: "Giai đoạn 2", t: "Nhóm kín, mã hóa", d: "Đưa vào nhóm kín, ứng dụng mã hóa để thẩm tra, kết nạp." },
    { k: "Giai đoạn 3", t: "Chia tổ đơn tuyến", d: "Chia tổ 2–3 người, các tổ không biết nhau." },
    { k: "Giai đoạn 3", t: "Chỉ đạo qua biên giới", d: "Mỗi tổ chỉ liên lạc với người điều hành ở nước ngoài, qua biên giới." }] },
  { kind: "stage", sec: "V.1", kicker: "Giai đoạn 1", title: "Tập hợp lực lượng", data: c3, rows: [
    ["a", "Lập hội nhóm trên mạng xã hội", "Hội, nhóm, câu lạc bộ, diễn đàn, fanpage, YouTube, blog. Phương thức phổ biến nhất."],
    ["b", "Tuyên truyền, khuếch trương thanh thế", "Tạo hiệu ứng đám đông, thăm dò dư luận, chấm chọn phần tử bất mãn."],
    ["c", "Lợi dụng điểm nóng, xuyên tạc", "Khiếu kiện đất đai, môi trường, sai phạm cán bộ bị dùng để kích động."],
    ["d", "Nhắm vào giới trẻ, nhóm yếu thế", "Núp bóng diễn đàn kỹ năng sống, học bổng, việc làm, tôn giáo trái phép."]] },
  { kind: "stage", sec: "V.2", kicker: "Giai đoạn 2", title: "Thành lập, điều hành tổ chức", data: c4, rows: [
    ["a", "Sàng lọc, kết nạp qua nhóm kín", "Telegram, Signal, WhatsApp. Thẩm tra, kết nạp, huấn luyện."],
    ["b", "Hội họp, giao nhiệm vụ qua mạng", "Chỉ đạo trực tiếp từ nước ngoài về trong nước."],
    ["c", "Tổ chức theo đơn tuyến", "Nhóm 2–3 người, chỉ liên lạc với người điều hành qua tài khoản ảo."],
    ["d", "Đe dọa, khống chế thành viên", "Dùng thông tin, hình ảnh của thành viên để không cho rút lui."],
    ["đ", "Kết hợp mạng với móc nối trực tiếp", "Cử người về nước gặp mặt, trao tiền, phương tiện, kết nạp."]] },
  { kind: "stage", sec: "V.3", kicker: "Giai đoạn 3", title: "Duy trì, phát triển tổ chức", data: c5, rows: [
    ["a", "Cấu kết với bên ngoài", "Vận động tài trợ, tranh thủ can thiệp, hậu thuẫn."],
    ["b", "Quốc tế hóa", "Dựng kịch bản bị đàn áp, gửi báo cáo xuyên tạc ra nước ngoài."],
    ["c", "Lợi dụng công nghệ mới", "AI, Deepfake, tài khoản ảo. Tiền mã hóa để chuyển tiền."]],
    timeline: [["2019", "Lập MSFJ ở nước ngoài, 17 đối tượng lưu vong"], ["Mạng xã hội", "Kích động đồng bào dân tộc thiểu số"], ["11/6/2023", "Tấn công 2 trụ sở xã tại Cư Kuin, 9 người chết"], ["1/2024", "Y Quynh Bdap bị tuyên vắng mặt 10 năm tù"], ["3/2024", "Bị liệt kê là tổ chức khủng bố"]] },
  { kind: "conclusion", require: "Theo dõi đồng thời cả hai môi trường, mạng và thực tế, và xác định sớm mối liên hệ giữa nhóm trên mạng với nhóm, tổ chức trên thực tế.", beats: [
    { k: "Nhận xét 01", t: "Quy trình khép kín trên mạng", d: "Từ tuyên truyền, kết nạp đến chỉ đạo, tài trợ đều thực hiện được trên mạng, kể cả khi người chỉ đạo ở nước ngoài." },
    { k: "Nhận xét 02", t: "Kết hợp công khai với bí mật", d: "Nhóm công khai để tuyên truyền, chấm chọn. Nhóm kín, đơn tuyến để kết nạp, điều hành." },
    { k: "Nhận xét 03", t: "Chuyển đổi linh hoạt", d: "Bị đấu tranh trên thực tế thì chuyển lên mạng để duy trì lực lượng." }] },
  { kind: "closing",
    recap: [
      { n: "I", label: "Khái niệm", to: 4, head: "2 quá trình nối tiếp", items: ["**Tập hợp lực lượng**: móc nối, lôi kéo, sàng lọc", "**Thành lập tổ chức**: tên gọi, cương lĩnh, cơ cấu"], note: "Mục đích: chống phá Đảng, Nhà nước" },
      { n: "II", label: "Đặc điểm", to: 5, head: "3 đặc điểm nổi bật", items: ["**Ẩn danh**, xuyên biên giới, phi tập trung", "**Hợp pháp hóa**, công khai hóa, quốc tế hóa", "**Lan truyền nhanh**, mở rộng linh hoạt"] },
      { n: "III", label: "Các dạng", to: 6, head: "3 dạng · theo liên hệ với nhóm thực tế", items: ["**Hoàn toàn trên mạng**", "**Liên kết một phần**: kênh truyền thông", "**Liên kết hoàn toàn**: thành viên trùng nhau"] },
      { n: "IV", label: "Hình thức", to: 8, head: "3 hình thức · theo cơ sở hình thành", items: ["**Lập mới** tổ chức", "**Phục hồi** tổ chức cũ", "**Làm biến chất** nhóm hợp pháp"] },
      { n: "V", label: "Thủ đoạn", to: 10, head: "3 giai đoạn", items: ["**Tập hợp lực lượng**: hội nhóm công khai, chấm chọn", "**Thành lập, điều hành**: nhóm kín, đơn tuyến", "**Duy trì, phát triển**: cấu kết, quốc tế hóa"], note: "Đông → ít · công khai → bí mật · chỉ đạo từ nước ngoài" },
      { n: "VI", label: "Nhận xét", to: 14, head: "3 nhận xét", items: ["**Khép kín** toàn bộ quy trình trên mạng", "Kết hợp **công khai với bí mật**", "**Chuyển đổi linh hoạt** giữa mạng và thực tế"] }],
    cases: [{ label: "01 · Hội anh em dân chủ", to: 7 }, { label: "02 · Triều Đại Việt", to: 9 }, { label: "03 · Hội nhà báo độc lập", to: 11 }, { label: "04 · Chính phủ quốc gia VN lâm thời", to: 12 }, { label: "05 · MSFJ", to: 13 }] },
];

/** Số bước (lần bấm) bên trong mỗi trang trước khi sang trang mới. Bước đánh số từ 0. */
export function stepsOf(s: Slide): number {
  switch (s.kind) {
    case "cover": return 1;                                  // hồ sơ đóng → mở
    case "team": return 1;                                   // một lần bấm: khoanh lần lượt 10 người
    case "concept": case "features": case "types": case "forms": case "network": return s.beats.length - 1;
    case "case": return s.data.findings.length + 1;          // trích yếu → từng tình tiết → kết luận
    case "stage": return s.timeline ? s.rows.length - 1 + s.timeline.length : s.rows.length; // từng thủ đoạn → (mốc thời gian | mở hồ sơ vụ việc)
    case "conclusion": return s.beats.length;                // 3 nhận xét → yêu cầu đặt ra
    case "closing": return 1;                                // tổng hợp toàn bàn → lời cảm ơn
    default: return 0;
  }
}
