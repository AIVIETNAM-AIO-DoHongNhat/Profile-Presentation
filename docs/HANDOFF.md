# GÓI BÀN GIAO — Chuyên đề "Tập hợp lực lượng, thành lập tổ chức phản động trên không gian mạng"

Dán nội dung file này vào cuộc trò chuyện mới, kèm các file trong gói, để Claude làm tiếp.

## 1. Bối cảnh
- Người dùng: học viên/cán bộ ngành Công an, làm bài thuyết trình nhóm (10 thành viên).
- Nguồn nội dung: 2 file Word gốc (thuyết trình nhóm 2; phương thức thủ đoạn hoạt động) + 3 dạng hội nhóm do người dùng bổ sung.
- Văn phong: theo skill vietnamese-technical-writing (không dấu chấm phẩy, không hai chấm cắt câu, câu ngắn, khách quan).
- Đã có tài liệu Docs "Tập hợp lực lượng, thành lập tổ chức phản động trên không gian mạng" (6 mục + phụ lục vụ việc + kế hoạch slide).

## 2. Cấu trúc nội dung (15 trang)
1 Bìa · 2 Thành viên (10 người) · 3 Mục lục · 4 Khái niệm · 5 Đặc điểm (3) · 6 Ba dạng hội nhóm · 7 Vụ việc 01 Hội anh em dân chủ · 8 Ba hình thức thành lập · 9 Vụ việc 02 Triều Đại Việt · 10 Quy trình đơn tuyến (sơ đồ 3 cột) · 11 GĐ1 + Vụ việc 03 Hội nhà báo độc lập VN · 12 GĐ2 + Vụ việc 04 CP quốc gia VN lâm thời · 13 GĐ3 + Vụ việc 05 MSFJ · 14 Nhận xét chung · 15 Tình huống thảo luận.
Toàn bộ chữ nằm trong `pptx-source/build.js`.

## 3. Phong cách đã chốt (bản mới nhất: Ho_so_chuyen_de_KGM_v5.pptx)
- Ý tưởng "hồ sơ nghiệp vụ / bảng điều tra ban đêm": nền giấy có đèn rọi (vignette), dải trái xanh lục thẫm, đỏ cờ B3202A, vàng C9A13B, mực 1A1A1A.
- Font: Times New Roman (tiêu đề), Segoe UI (chữ), Courier New (nhãn đánh máy).
- Chi tiết: đinh ghim, dây đỏ, giấy nhớ, thẻ vật chứng, polaroid, con dấu, mã vạch, vân tay mờ, lớp dấu vết số (log/IP che).
- 23 khung ảnh đặt tên ANH_xxx (thay bằng chuột phải > Change Picture). Trang 2 có hiệu ứng lộ danh tính từng người khi bấm (chèn bằng `anim.py`).
- KHÔNG dùng con dấu "MẬT/TUYỆT MẬT".

## 4. Nguồn ảnh vụ việc (trang báo có ảnh)
- VV01: https://thanhtra.com.vn/an-ninh-trat-tu-D718A18CA/xet-xu-6-bi-cao-ve-toi-hoat-dong-nham-lat-do-chinh-quyen-nhan-dan-CC0004FD.html
- VV02: https://en.bocongan.gov.vn/terrorist-article/images-of-terrorist-acts-by-the-trieu-dai-viet-terrorist-organization-1754317818
- VV03: https://thanhtra.com.vn/an-ninh-trat-tu-D718A18CA/tuyen-truyen-chong-pha-nha-nuoc-pham-chi-dung-bi-tuyen-phat-15-nam-tu-B134A536.html
- VV04: https://tienphong.vn/toa-an-ra-thong-cao-ve-phien-xet-xu-dao-minh-quan-pham-lisa-va-dong-pham-post1843826.tpo
- VV05: https://www.sggp.org.vn/vu-khung-bo-tai-tinh-dak-lak-10-bi-cao-nhan-an-chung-than-post723594.html
Lưu ý: một số tổ chức quốc tế có quan điểm khác về các vụ án → luôn dẫn nguồn là cáo trạng/bản án.

## 5. Việc đang làm dở: bản WEB (chưa bắt đầu code)
Kế hoạch đã duyệt hướng: Next.js (App Router, TypeScript) + React Three Fiber + drei + Framer Motion, deploy Vercel (static export).
- Route /ho-so/[n], điều hướng click/←→/Space, bước (step) trong trang, tab I–VI, "dây liên kết" vụ việc ↔ lý thuyết, (tùy chọn) presenter mode phím P.
- Dữ liệu: content/slides.ts. Ảnh: public/images/vv01..05, tv01..10, dd01..03, ht01..03 (thiếu ảnh → khung chờ).
- 3D chỉ ở: Bìa (bảng điều tra, đèn rọi), Thành viên (thẻ xoay lộ danh tính), Trang 10 (đám đông → chấm chọn → nhóm kín → tổ đơn tuyến → biên giới, 5 bước), MSFJ (timeline chiều sâu). Còn lại 2D.
- Tối ưu: dynamic import theo trang, frameloop="demand", instancing, dpr ≤ 1.5, PerformanceMonitor, fallback 2D khi không có WebGL.
- Câu hỏi còn chờ người dùng chốt: (1) làm đủ 4 cảnh 3D hay bìa + trang 10 trước, (2) có presenter mode không, (3) khóa 16:9 hay responsive cho điện thoại.

## 6. Cách dựng lại file PowerPoint
```
npm install pptxgenjs react react-dom react-icons sharp delaunator
node pptx-source/night.mjs   # tạo nền + ảnh phụ (sửa đường dẫn /tmp/v9/img nếu cần)
node pptx-source/build.js    # xuất .pptx
python3 pptx-source/anim.py in.pptx out.pptx   # chèn hiệu ứng lộ danh tính trang 2
```
