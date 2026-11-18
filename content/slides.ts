// Toàn bộ nội dung trình chiếu, khớp với docs/noi_dung.docx. Sửa chữ tại đây, không cần đụng vào giao diện.
// Mỗi "beat" là một nhịp bấm chuột: dòng chữ bên trái sáng lên đúng lúc cảnh 3D chuyển động.

export type Beat = { k: string; t: string; d?: string };
export type CaseData = {
  name: string; period: string; image: string; caption: string;
  facts: [string, string][];
  /** con số nổi bật hiện lớn trong cảnh 3D */
  verdict: [string, string];
  source: string;
};
export type Method = { n: number; title: string; short: string; tools: string; beats: Beat[]; case: CaseData };
export type Solution = { k: string; t: string; items: string[] };
export type Slide =
  | { kind: "cover" }
  | { kind: "team" }
  | { kind: "toc" }
  | { kind: "concept"; beats: Beat[] }
  | { kind: "features"; beats: Beat[] }
  | { kind: "types"; beats: (Beat & { tags: [string, string, string] })[] }
  | { kind: "forms"; beats: Beat[] }
  | { kind: "method"; m: Method }
  | { kind: "solutions"; groups: Solution[] }
  | { kind: "summary" }
  | { kind: "closing" };

/* ---------- thông tin chung ---------- */
export const TOPIC = "Tập hợp lực lượng, thành lập tổ chức phản động trên không gian mạng";
export const GROUP = "Tiểu đội 2";

/* ---------- trang 2: ảnh nhóm ---------- */
export const ROLES = [
  { label: "Nhóm trưởng", color: "#b0261f" },
  { label: "Thuyết trình", color: "#9c7419" },
  { label: "Thiết kế slide", color: "#2a4f7a" },
  { label: "Tìm kiếm tài liệu", color: "#2f6652" },
] as const;
export type Member = {
  name: string;
  /** chỉ số trong ROLES */
  role: 0 | 1 | 2 | 3;
  /** vị trí khuôn mặt trên ảnh: x, y (0..1 từ góc trên trái), bán kính (theo chiều ngang ảnh) */
  face: [number, number, number];
};
export const TEAM_PHOTO = "/images/team.jpg";
export const TEAM_ASPECT = 2048 / 1365;
/**
 * Vị trí khuôn mặt từng người trên ảnh nhóm (x, y theo tỉ lệ 0..1 của ảnh, bán kính theo chiều ngang), cho vùng sáng
 * lướt qua mặt khi chibi người đó hiện ra. Thứ tự theo MEMBERS. Để `null` thì tắt vùng sáng.
 * 11 khuôn mặt đo sẵn trên ảnh hiện tại, từ trái sang phải:
 *   [0.259,0.648] [0.306,0.660] [0.358,0.668] [0.415,0.671] [0.478,0.658] [0.530,0.671]
 *   [0.588,0.660] [0.640,0.660] [0.703,0.649] [0.765,0.641] [0.828,0.641]   (bán kính ≈ 0.03)
 */
export const TEAM_SPOTS: [number, number, number][] | null = null;
export const MEMBERS: Member[] = [
  { name: "Nguyễn Huy Hoàng", role: 3, face: [0.268, 0.160, 0.044] },
  { name: "Huỳnh Nguyễn Bảo Khương", role: 3, face: [0.375, 0.232, 0.040] },
  { name: "Cao Quang Hải", role: 3, face: [0.435, 0.185, 0.038] },
  { name: "Đỗ Hồng Nhất", role: 2, face: [0.540, 0.342, 0.040] },
  { name: "Nguyễn Thế Hùng", role: 3, face: [0.580, 0.240, 0.036] },
  { name: "Nguyễn Cửu An Phú", role: 1, face: [0.683, 0.186, 0.036] },
  { name: "Nguyễn Tiến Mạnh", role: 3, face: [0.745, 0.214, 0.040] },
  { name: "Nguyễn Sỹ Long", role: 1, face: [0.400, 0.535, 0.042] },
  { name: "Phạm Khánh Linh", role: 0, face: [0.552, 0.560, 0.040] },
  { name: "Nguyễn Minh Hiếu", role: 3, face: [0.670, 0.520, 0.042] },
];
/** Thứ tự hiện danh tính: nhóm trưởng trước, cùng vai trò thì từ trái sang phải. */
export const TEAM_ORDER: number[] = MEMBERS.map((_, i) => i).sort((a, b) => MEMBERS[a].role - MEMBERS[b].role || MEMBERS[a].face[0] - MEMBERS[b].face[0]);
export const TEAM_STAGGER = 0.45;

/* ---------- mục lục ---------- */
export const SECTIONS = [
  { n: "I", label: "Khái niệm", to: 4 },
  { n: "II", label: "Đặc điểm", to: 5 },
  { n: "III", label: "Các dạng hội nhóm", to: 6 },
  { n: "IV", label: "Hình thức thành lập", to: 7 },
  { n: "V", label: "Phương thức, thủ đoạn", to: 8 },
  { n: "VI", label: "Giải pháp", to: 13 },
];
export const SEC_COLOR: Record<string, string> = { I: "#2c3a4a", II: "#4a4775", III: "#2f6652", IV: "#9c7419", V: "#b0261f", VI: "#2a4f7a" };

/**
 * Video chiếu ở trang Khái niệm (nút "Xem video" hoặc phím V).
 * `url`: link Facebook (video / reel), YouTube, hoặc file trong public/videos (ví dụ "/videos/khai-niem.mp4").
 * `ratio`: tỉ lệ khung hình, "16 / 9" (mặc định), "1 / 1" (vuông), "9 / 16" (dọc).
 * `beat`: nút xem video chỉ hiện khi đang ở nhịp này (đánh số từ 0).
 */
export type Video = { title: string; by: string; url: string; ratio?: string; beat?: number };
export const CONCEPT_VIDEO: Video = {
  title: "Người dân cần cảnh giác để không bị các đối tượng thù địch kích động, lôi kéo",
  by: "ANTV · Lực lượng An ninh nội địa",
  url: "https://www.facebook.com/reel/1305105798290600/",
  ratio: "1 / 1",
  beat: 1, // nhịp 02 "Tuyên truyền, móc nối, lôi kéo"
};

export const DEFINITION ="Tập hợp lực lượng, thành lập tổ chức phản động trên KGM là “hoạt động của các đối tượng phản động lợi dụng Internet, MXH và các nền tảng truyền thông số để **tuyên truyền, móc nối, lôi kéo** những người có cùng quan điểm, tư tưởng chống đối chế độ, hoặc những người bất mãn, nhận thức lạc hậu, hạn chế nhằm **liên kết, hình thành và phát triển tổ chức phản động**. Mục đích cuối cùng của hoạt động này là nhằm **chống phá Đảng Cộng sản Việt Nam và Nhà nước Cộng hòa xã hội chủ nghĩa Việt Nam**”.";

/* ---------- 5 phương thức, thủ đoạn ---------- */
export const METHODS: Method[] = [
  {
    n: 1, title: "Tạo nhóm trên mạng xã hội", short: "Tạo nhóm MXH", tools: "Facebook · Zalo · Telegram",
    beats: [
      { k: "a", t: "Lập nhóm, trang cộng đồng", d: "Núp danh nghĩa chia sẻ thông tin, bảo vệ quyền lợi cộng đồng." },
      { k: "b", t: "Thu hút bằng chủ đề nóng", d: "Môi trường, đất đai, dân sinh, giáo dục, khiếu kiện." },
      { k: "c", t: "Tung tin sai lệch, kích động", d: "Xuyên tạc chủ trương, chính sách. Tạo đối lập với chính quyền." },
      { k: "d", t: "Phân hóa, kéo vào nhóm kín", d: "Chọn người đồng tình quan điểm cực đoan để tập hợp lực lượng." },
    ],
    case: {
      name: "“Hội anh em dân chủ”", period: "2013 – 2018", image: "vv01.jpg", caption: "Nguyễn Văn Đài tại phiên tòa 05/4/2018 · Ảnh: TTXVN",
      facts: [["Khởi xướng", "Nguyễn Văn Đài, Phạm Văn Trội, Nguyễn Trung Tôn, Nguyễn Bắc Truyển"], ["Vỏ bọc", "“Bảo vệ quyền con người”, lợi dụng sự cố môi trường biển miền Trung 4/2016"], ["Xét xử", "TAND TP Hà Nội, 05/4/2018 · Tội “Hoạt động nhằm lật đổ chính quyền nhân dân”"]],
      verdict: ["66 năm tù", "6 bị cáo · Nguyễn Văn Đài 15 năm"],
      source: "Nguồn: Cáo trạng VKSND Tối cao, bản án TAND TP Hà Nội",
    },
  },
  {
    n: 2, title: "Lợi dụng danh nghĩa học hỏi, giao lưu", short: "Học hỏi, giao lưu", tools: "Diễn đàn · Hội thảo · CLB trực tuyến",
    beats: [
      { k: "a", t: "Nhắm vào người trẻ", d: "Học sinh, sinh viên, trí thức có nhu cầu học tập, giao lưu." },
      { k: "b", t: "Mở lớp, diễn đàn trực tuyến", d: "Vỏ bọc học thuật, pháp luật, kỹ năng sống, thiện nguyện." },
      { k: "c", t: "Tìm hiểu, chọn người để tác động", d: "Khai thác hạn chế nhận thức, khó khăn cuộc sống." },
      { k: "d", t: "Lồng ghép xuyên tạc, lôi kéo", d: "Từng bước tạo đồng tình, kéo vào hội nhóm chống phá." },
    ],
    case: {
      name: "“Người Thượng vì công lý” (MSFJ)", period: "2022 – 2024", image: "vv05.jpg", caption: "Phiên tòa tại Đắk Lắk, 01/2024 · Ảnh: Báo SGGP",
      facts: [["Cầm đầu", "Y Quynh Bdap, trốn sang Thái Lan"], ["Thủ đoạn", "Lớp “tập huấn nhân quyền” trực tuyến, hứa tiền, phong chức “Nhà nước Đề Ga”"], ["Hậu quả", "Chỉ đạo tấn công trụ sở UBND xã Ea Tiêu, Ea Ktur ngày 11/6/2023"]],
      verdict: ["10 năm tù", "Y Quynh Bdap · Tội “Khủng bố” · xử vắng mặt"],
      source: "Nguồn: Bộ Công an, TAND tỉnh Đắk Lắk (01/2024)",
    },
  },
  {
    n: 3, title: "Truyền thông, tuyên truyền, phát triển lực lượng", short: "Truyền thông", tools: "Facebook · YouTube · TikTok · Blog",
    beats: [
      { k: "a", t: "Dựng hình ảnh, uy tín cho nhóm", d: "Website, blog, kênh video, trang mạng xã hội." },
      { k: "b", t: "Phát tán nội dung xuyên tạc", d: "Bài viết, video, livestream bóp méo sự thật." },
      { k: "c", t: "Bám sự kiện nóng, khuếch đại ảo", d: "Tài khoản giả, tương tác ảo tạo cảm giác số đông." },
      { k: "d", t: "Sàng lọc, lôi kéo người theo", d: "Chọn người bất mãn, thiếu thông tin vào hội nhóm." },
    ],
    case: {
      name: "“Hội nhà báo độc lập Việt Nam”", period: "2014 – 2021", image: "vv03.jpg", caption: "Phiên tòa xét xử ngày 05/01/2021 · Ảnh: TTXVN",
      facts: [["Thành lập", "04/7/2014 · 41 người · đến 2018 có 72 hội viên"], ["Kênh chính", "Trang “Việt Nam Thời báo”, trả nhuận bút cho người viết"], ["Xét xử", "TAND TP.HCM, 05/01/2021 · Phạm Chí Dũng 15 năm, Thụy và Tuấn 11 năm"]],
      verdict: ["1.530 tin, bài", "Phạm Chí Dũng đăng dưới nhiều bút danh"],
      source: "Nguồn: Bản án TAND TP Hồ Chí Minh ngày 05/01/2021",
    },
  },
  {
    n: 4, title: "Dùng ứng dụng để hội họp, phân công nhiệm vụ", short: "Hội họp qua ứng dụng", tools: "Telegram · Signal · WhatsApp · Zoom",
    beats: [
      { k: "a", t: "Liên lạc qua ứng dụng", d: "Nhắn tin, gọi điện, họp trực tuyến." },
      { k: "b", t: "Nhóm kín, tài khoản ẩn danh", d: "Che giấu nội dung, chặn người ngoài." },
      { k: "c", t: "Họp, giao nhiệm vụ", d: "Thống nhất phương hướng, phân công từng người." },
      { k: "d", t: "Chia nhóm nhỏ, chỉ đạo từ xa", d: "Thành viên không biết toàn bộ cơ cấu. Điều hành từ nước ngoài." },
    ],
    case: {
      name: "Nguyễn Đức Thanh · “Chính phủ quốc gia VN lâm thời”", period: "2019 – 2023", image: "vv04.jpg", caption: "Đào Minh Quân (cầm đầu tổ chức) và Phạm Lisa · Ảnh: Báo Tiền Phong",
      facts: [["Liên lạc", "Facebook “Thanh Nguyen”, đổi thành “Trần Nhân”"], ["Hoạt động", "Họp kín qua Free Conference Call, nhận huấn luyện, lôi kéo người khác"], ["Tương tự", "5/2026, CA Đồng Tháp khởi tố 2 thành viên “Việt Tân” họp qua nhóm kín"]],
      verdict: ["16 năm tù", "TAND tỉnh Tiền Giang · 19/6/2024"],
      source: "Nguồn: Bản án TAND tỉnh Tiền Giang, Công an tỉnh Đồng Tháp",
    },
  },
  {
    n: 5, title: "Móc nối, cấu kết với bên ngoài", short: "Móc nối bên ngoài", tools: "MXH · Email · Ứng dụng liên lạc",
    beats: [
      { k: "a", t: "Kết nối xuyên biên giới", d: "Quan hệ với cá nhân, tổ chức chống đối ở nước ngoài." },
      { k: "b", t: "Dùng người quen làm cầu nối", d: "Mở rộng liên kết qua người từng tham gia, cùng quan điểm." },
      { k: "c", t: "Nhận tiền, tài liệu, phương tiện", d: "Hỗ trợ từ bên ngoài phục vụ hoạt động." },
      { k: "d", t: "Dựng mạng lưới trong – ngoài", d: "Phối hợp nhóm nhỏ thành tổ chức thống nhất." },
    ],
    case: {
      name: "“Triều Đại Việt”", period: "2018 – 2020", image: "vv02.jpg", caption: "Hiện trường một vụ gây nổ · Ảnh: Bộ Công an",
      facts: [["Cầm đầu", "Ngô Văn Hoàng Hùng (quốc tịch Canada), tự xưng “Tổng tư lệnh”"], ["Móc nối", "Lôi kéo Nguyễn Khanh, gửi 144 triệu đồng và 600 CAD để chế bom"], ["Hậu quả", "6/2018 gây nổ trụ sở CA phường 12, Tân Bình và CA tỉnh Hậu Giang"]],
      verdict: ["196 năm tù", "20 bị cáo · Nguyễn Khanh 24 năm"],
      source: "Nguồn: TAND TP Hồ Chí Minh (22/9/2020), Bộ Công an",
    },
  },
];

/* ---------- trang tổng kết (trước lời cảm ơn) ---------- */
/** Mỗi mục một ô: `lead` là câu tóm ý, `items` là các ý chính (ngắn, mỗi ý một dòng). */
export type SummaryItem = { n: string; label: string; lead?: string; items: string[] };
export const SUMMARY: SummaryItem[] = [
  { n: "I", label: "Khái niệm", lead: "Lợi dụng Internet, MXH để tuyên truyền, móc nối, lôi kéo, hình thành tổ chức phản động.",
    items: ["Nhắm vào người bất mãn, nhận thức hạn chế", "Mục đích: chống phá Đảng, Nhà nước"] },
  { n: "II", label: "Đặc điểm", items: ["Ẩn danh, xuyên biên giới, phi tập trung", "Công khai hóa, hợp pháp hóa, quốc tế hóa", "Lan truyền nhanh, mở rộng linh hoạt"] },
  { n: "III", label: "Các dạng hội nhóm", items: ["Hoạt động hoàn toàn trên mạng", "Liên kết một phần với nhóm thực tế", "Liên kết hoàn toàn với nhóm thực tế"] },
  { n: "IV", label: "Hình thức thành lập", items: ["Thành lập tổ chức mới", "Phục hồi tổ chức cũ", "Thao túng, làm biến chất nhóm hợp pháp"] },
  { n: "V", label: "Phương thức, thủ đoạn", items: METHODS.map(m => m.short) },
  { n: "VI", label: "Giải pháp", items: ["Phát hiện sớm, xử lý nghiêm theo pháp luật", "Tuyên truyền, nâng cao nhận thức, cảnh giác", "Hoàn thiện cơ chế, phối hợp trong nước và quốc tế"] },
];
/** Thông điệp chốt ở cuối bảng tổng kết. */
export const TAKEAWAY = ["Nhận diện sớm", "Không chia sẻ, không tham gia", "Kịp thời báo cơ quan chức năng"];

export const SLIDES: Slide[] = [
  { kind: "cover" },
  { kind: "team" },
  { kind: "toc" },
  { kind: "concept", beats: [
    { k: "01", t: "Lợi dụng không gian mạng", d: "Internet, mạng xã hội, nền tảng truyền thông số." },
    { k: "02", t: "Tuyên truyền, móc nối, lôi kéo", d: "Người cùng quan điểm, người bất mãn, nhận thức hạn chế." },
    { k: "03", t: "Hình thành tổ chức phản động", d: "Liên kết, hình thành và phát triển tổ chức." },
    { k: "04", t: "Mục đích cuối cùng", d: "Chống phá Đảng Cộng sản Việt Nam và Nhà nước CHXHCN Việt Nam." }] },
  { kind: "features", beats: [
    { k: "01", t: "Ẩn danh · xuyên biên giới · phi tập trung", d: "Tài khoản ảo, máy chủ nước ngoài. Gắn với phản động lưu vong." },
    { k: "02", t: "Công khai hóa · hợp pháp hóa · quốc tế hóa", d: "Núp danh nghĩa xã hội dân sự, dân chủ, nhân quyền. Đòi công nhận tổ chức đối lập." },
    { k: "03", t: "Lan truyền nhanh · mở rộng linh hoạt", d: "Nhóm nhỏ liên kết, sáp nhập thành tổ chức quy mô lớn." }] },
  { kind: "types", beats: [
    { k: "01", t: "Hoàn toàn trên mạng", d: "Mọi khâu từ tuyên truyền đến giao nhiệm vụ đều trên mạng.", tags: ["Không liên hệ", "Là chính tổ chức", "Chỉ trên mạng"] },
    { k: "02", t: "Liên kết một phần", d: "Làm kênh truyền thông, phát triển lực lượng cho nhóm thực tế.", tags: ["Một phần", "Kênh truyền thông", "Không nhất thiết trùng"] },
    { k: "03", t: "Liên kết hoàn toàn", d: "Hoạt động song song. Thực tế khó khăn thì chuyển lên mạng.", tags: ["Hoàn toàn", "Phương án chuyển hướng", "Trùng nhóm thực tế"] }] },
  { kind: "forms", beats: [
    { k: "01", t: "Thành lập tổ chức mới", d: "Tên gọi, tôn chỉ, cương lĩnh lần đầu xuất hiện." },
    { k: "02", t: "Phục hồi tổ chức cũ", d: "Gom lại phần tử cũ, hoặc tên mới theo đường hướng cũ." },
    { k: "03", t: "Thao túng, làm biến chất nhóm hợp pháp", d: "Cài người, khống chế quản trị viên hội đồng hương, từ thiện, môi trường, khiếu kiện." }] },
  ...METHODS.map(m => ({ kind: "method" as const, m })),
  { kind: "solutions", groups: [
    { k: "01", t: "Nhóm trên mạng xã hội", items: ["Nắm tình hình, phát hiện sớm hội nhóm có dấu hiệu", "Xử lý vi phạm, định hướng bằng thông tin chính thống"] },
    { k: "02", t: "Học hỏi, giao lưu", items: ["Giáo dục chính trị, pháp luật cho học sinh, sinh viên", "Cảnh giác với học bổng, hội thảo, giao lưu"] },
    { k: "03", t: "Truyền thông, tuyên truyền", items: ["Thông tin chính xác, kịp thời, phản bác sai trái", "Nâng kỹ năng nhận diện tin giả, cắt ghép"] },
    { k: "04", t: "Hội họp qua ứng dụng", items: ["Nâng năng lực nghiệp vụ, kỹ thuật phát hiện", "Phối hợp doanh nghiệp, bảo toàn dữ liệu"] },
    { k: "05", t: "Móc nối bên ngoài", items: ["Phát hiện móc nối có yếu tố nước ngoài", "Tăng cường phối hợp quốc tế"] },
    { k: "★", t: "Giải pháp chung", items: ["Hoàn thiện cơ chế, quản lý nhà nước về an ninh mạng", "Nâng năng lực lực lượng chuyên trách, ứng dụng KHCN", "Phát huy gia đình, nhà trường, cơ quan, người dân", "Phòng ngừa gắn với xử lý nghiêm, đúng pháp luật"] }] },
  { kind: "summary" },
  { kind: "closing" },
];

/** Tên ngắn từng trang, dùng cho mục lục, bảng tên 3D và màn hình tổng quan (phím O) */
export const TITLES = ["Bìa", "Thành viên", "Mục lục", "Khái niệm", "Đặc điểm", "Các dạng hội nhóm", "Hình thức thành lập",
  ...METHODS.map(m => `Phương thức ${m.n} · ${m.short}`), "Giải pháp", "Tổng kết", "Lời cảm ơn"];
/** Mục của từng trang (đánh số từ 1) */
export const SEC_OF: string[] = ["", "", "", "", "I", "II", "III", "IV", "V", "V", "V", "V", "V", "VI", "", ""];

/** Số bước (lần bấm) bên trong mỗi trang. Trả về chỉ số bước cuối, đánh số từ 0. */
export function stepsOf(s: Slide): number {
  switch (s.kind) {
    case "team": return 1;
    case "concept": case "features": case "types": case "forms": return s.beats.length - 1;
    case "method": return s.m.beats.length;           // 4 thủ đoạn → vụ việc
    case "solutions": return s.groups.length - 1;     // 5 nhóm → giải pháp chung
    default: return 0;
  }
}

