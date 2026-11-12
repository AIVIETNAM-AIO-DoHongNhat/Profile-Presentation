# Hồ sơ chuyên đề · Tập hợp lực lượng, thành lập tổ chức phản động trên không gian mạng

Bản trình chiếu web (Next.js 15 + React Three Fiber), 15 trang, phong cách **phòng chuyên án ban đêm**.
Toàn bộ 15 trang nằm trong một không gian 3D duy nhất: mỗi trang là một "trạm" trên mặt bàn, camera lướt giữa các trạm, sợi dây đỏ tự vẽ dần nối trạm cũ với trạm mới. Phiếu trích yếu bên trái hiện chữ, mỗi lần bấm sáng đúng dòng ứng với cảnh 3D đang diễn.

## Chạy thử trên máy
```bash
npm install
npm run dev        # mở http://localhost:3000
```

## Đưa lên Vercel
1. Tạo repo mới trên GitHub, đẩy toàn bộ thư mục này lên (`.gitignore` đã loại `node_modules`, `.next`, `out`).
2. Vào vercel.com → Add New → Project → chọn repo → Deploy. Dự án xuất trang tĩnh, không cần cấu hình thêm.

## Điều khiển khi trình chiếu
- Nhấn chuột, phím → hoặc Space: nhịp tiếp / trang tiếp. Phím ←: lùi. Home / End: trang đầu / cuối.
- Toàn màn hình: nút ở góc trên bên phải hoặc phím F (bấm lần nữa để thoát). Phím O: tổng quan 15 trang. Con trỏ chuột tự ẩn sau 2,5 giây.
- Bấm vào một dòng trong phiếu, hoặc chấm trên thanh bước, để nhảy thẳng tới nhịp đó.
- Mở thẳng một nhịp: `/ho-so/10/?s=3` (trang 10, nhịp thứ 4).

## Kịch bản từng trang (mỗi "→" là một lần bấm)
| Trang | Cảnh 3D |
|---|---|
| 1 Bìa | Bìa hồ sơ trên bàn dưới đèn, dấu mộc "10đ" đóng xuống bìa → bìa mở, lộ trang mục lục |
| 2 Thành viên | Ảnh nhóm hiện hình trên bảng → bấm một lần, bút chì màu lần lượt khoanh từng khuôn mặt (nhóm trưởng trước, rồi thuyết trình, slide, tìm tài liệu), kéo nét dẫn ra thẻ tên; nhịp khoanh chỉnh ở `TEAM_STAGGER` |
| 3 Mục lục | Camera lùi ra thấy toàn bộ 15 trạm và sợi dây đỏ |
| 4 Khái niệm | Quân cờ rời rạc, đối tượng phát sóng → bị hút về quanh đối tượng (tập hợp lực lượng) → xếp thành tháp phân cấp, bản cương lĩnh hạ xuống (thành lập tổ chức) |
| 5 Đặc điểm | Địa cầu, tín hiệu nhảy qua 3 máy chủ nước ngoài → biển "Hội Dân sự" mở ra để lộ tổ chức phía sau → màu đỏ lan qua các nhóm nhỏ rồi sáp nhập thành khối lớn |
| 6 Ba dạng | Tầng mạng lơ lửng trên sa bàn thực tế → dạng 01, 02 (cột sáng nối một phần), 03 (trùng khít) |
| 7, 9 Vụ việc | Hồ sơ mở, trích yếu, ảnh thật của vụ việc → từng tình tiết trượt ra (vụ 02: ảnh vật liệu nổ) → dấu đỏ đóng xuống |
| 8 Hình thức | Ba sa bàn: dựng cờ mới → mảnh vỡ ghép lại → quản trị viên bị thay, nhóm đổi màu |
| 10 Đơn tuyến | Quảng trường → đèn rọi chấm chọn → phòng kín có khóa → vách ngăn chia tổ → người điều hành bên kia biên giới giật dây rối |
| 11–13 Ba giai đoạn | Ba bậc thềm cao dần, mỗi thủ đoạn một vật tượng trưng sáng lên → hồ sơ vụ việc mở kèm ảnh thật; trang 13 đi dọc 5 cột mốc MSFJ, ảnh phiên tòa hiện ở mốc 1/2024 |
| 14 Nhận xét | Toàn cảnh, đèn vàng soi lại các trạm minh chứng cho từng nhận xét → mô hình hai tầng có vòng quét |
| 15 Tổng hợp | Bảng ghi nhớ 6 nội dung cốt lõi trên nền toàn bàn → hồ sơ HS-01 khép lại giữa ảnh nhóm và ảnh các vụ việc, dây đỏ buộc, dấu "Hoàn thành" đóng xuống, hiện lời cảm ơn |

## Sửa nội dung và ảnh
- Toàn bộ chữ và dòng thông tin trang bìa (đơn vị): `content/slides.ts` (`COVER`, các `beats`).
- Họ tên và vai trò 10 thành viên: `MEMBERS` trong `content/slides.ts`. Mỗi dòng ứng với một khuôn mặt trên ảnh `team.jpg` (có ghi chú áo để nhận ra), chỉ cần sửa `name` và `role` (0 nhóm trưởng, 1 thuyết trình, 2 thiết kế slide, 3 tìm kiếm tài liệu). Màu và tên vai trò: `ROLES`.
- Ảnh đặt trong `public/images` (xem `public/images/README.txt`). **Chỉ khi có file ảnh thật thì khung ảnh mới hiện**, không có ô trống.
- Góc máy từng nhịp: `components/world/layout.ts`. Từng trạm 3D: `components/world/stations/`.

## Cấu trúc mã
- `components/Deck.tsx`: điều hướng, khung giao diện, một canvas 3D dùng chung cho cả 15 trang.
- `components/Overlay.tsx`: phiếu trích yếu HTML.
- `components/world/World.tsx`: căn phòng, camera, đèn, dây đỏ, bảng tên trạm.
- `components/world/props.tsx`: đạo cụ dùng chung (quân cờ, bìa hồ sơ, giấy, biển, thanh sáng, dây).
- Máy không có WebGL: vẫn trình chiếu được phần chữ trên nền tối.

## Nguồn ảnh vụ việc (đã tải về `public/images`, chú thích trên ảnh ghi rõ nguồn)
- vv01: https://thanhtra.com.vn/an-ninh-trat-tu-D718A18CA/xet-xu-6-bi-cao-ve-toi-hoat-dong-nham-lat-do-chinh-quyen-nhan-dan-CC0004FD.html
- vv02: https://en.bocongan.gov.vn/terrorist-article/images-of-terrorist-acts-by-the-trieu-dai-viet-terrorist-organization-1754317818
- vv03: https://thanhtra.com.vn/an-ninh-trat-tu-D718A18CA/tuyen-truyen-chong-pha-nha-nuoc-pham-chi-dung-bi-tuyen-phat-15-nam-tu-B134A536.html
- vv04: https://tienphong.vn/toa-an-ra-thong-cao-ve-phien-xet-xu-dao-minh-quan-pham-lisa-va-dong-pham-post1843826.tpo
- vv05: https://www.sggp.org.vn/vu-khung-bo-tai-tinh-dak-lak-10-bi-cao-nhan-an-chung-than-post723594.html
- vv05b: https://www.sggp.org.vn/3-ngay-sau-vu-tan-cong-tru-so-ubnd-2-xa-o-dak-lak-binh-yen-da-tro-lai-post693673.html
