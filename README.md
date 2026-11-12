# Hồ sơ chuyên đề HS-01/KGM

Bản trình chiếu web cho chuyên đề *Tập hợp lực lượng, thành lập tổ chức phản động trên không gian mạng* của Tiểu đội 2. Bản trình chiếu gồm 15 trang. Mỗi trang ứng với một trạm 3D trên cùng một mặt bàn, mỗi lần bấm chuột chuyển sang một nhịp.

Khi chuyển trang, camera di chuyển sang trạm kế tiếp và sợi dây đỏ kéo dài nối hai trạm. Phiếu chữ bên trái làm sáng đúng ý đang trình bày.

**Công nghệ:** Next.js 15 (xuất trang tĩnh), React 19, React Three Fiber 9, three.js 0.169.

## Chạy trên máy

Yêu cầu Node.js 18 trở lên.

```bash
npm install
npm run dev          # http://localhost:3000
```

Kiểm tra bản xuất tĩnh trước khi triển khai:

```bash
npx next build       # kết quả nằm trong thư mục out/
```

> Tắt dev server trước khi chạy `next build`. Hai tiến trình dùng chung thư mục `.next`, nên chạy song song sẽ làm dev server báo lỗi `ENOENT`. Nếu gặp lỗi này, xoá thư mục `.next` rồi chạy lại `npm run dev`.

## Triển khai lên Vercel

1. Đẩy mã nguồn lên một repo GitHub. Tệp `.gitignore` đã loại `node_modules`, `.next` và `out`.
2. Trên Vercel, chọn **Add New → Project**, chọn repo, bấm **Deploy**. Vercel tự nhận cấu hình Next.js.
3. Mỗi lần `git push` lên nhánh `main`, Vercel tự build và cập nhật đường dẫn.

## Điều khiển khi trình chiếu

| Thao tác | Phím hoặc chuột |
|---|---|
| Nhịp tiếp hoặc trang tiếp | Click, `→`, `Space`, `Enter` |
| Lùi một nhịp | `←`, `Backspace` |
| Trang đầu, trang cuối | `Home`, `End` |
| Bật hoặc tắt toàn màn hình | `F`, hoặc nút ở góc trên bên phải |
| Màn hình tổng quan 15 trang | `O`, đóng bằng `O` hoặc `Esc` |
| Nhảy tới một nhịp | Bấm vào dòng trong phiếu chữ hoặc chấm trên thanh bước |

Đường dẫn `/ho-so/10/?s=3` mở thẳng trang 10 ở nhịp thứ tư (nhịp đánh số từ 0). Con trỏ chuột tự ẩn sau 2,5 giây không di chuyển.

## Cấu trúc trình chiếu

| Trang | Nội dung | Số nhịp |
|---|---|---|
| 1–3 | Bìa, thành viên, mục lục | 2, 2, 1 |
| 4 | I. Khái niệm | 3 |
| 5 | II. Đặc điểm | 3 |
| 6–7 | III. Các dạng, vụ việc 01 | 3, 5 |
| 8–9 | IV. Hình thức, vụ việc 02 | 3, 5 |
| 10–13 | V. Thủ đoạn (sơ đồ đơn tuyến, ba giai đoạn), kèm vụ việc 03–05 | 5, 5, 6, 8 |
| 14 | VI. Nhận xét chung | 4 |
| 15 | Bảng ghi nhớ và lời cảm ơn | 2 |

## Sửa nội dung

Toàn bộ chữ nằm trong `content/slides.ts`. Phần giao diện không cần sửa khi thay nội dung.

| Cần sửa | Vị trí |
|---|---|
| Thông tin trang bìa | `COVER` |
| Họ tên và vai trò thành viên | `MEMBERS`, sửa `name` và `role` (0 nhóm trưởng, 1 thuyết trình, 2 thiết kế slide, 3 tìm kiếm tài liệu) |
| Tên và màu vai trò | `ROLES` |
| Nhịp khoanh mặt ở trang 2 | `TEAM_STAGGER` (giây giữa hai người) |
| Các ý trên phiếu chữ | trường `beats` của từng trang |
| Bảng ghi nhớ trang 15 | trường `recap` |

Chữ đặt trong `**…**` được tô highlight trên phiếu. Quy ước hiện tại chỉ dùng highlight cho hai cụm cốt lõi trong định nghĩa ở trang 4.

Mỗi phần tử của `MEMBERS` gắn với một khuôn mặt trên ảnh `public/images/team.jpg` qua trường `face`. Nếu thay ảnh nhóm, cần đo lại toạ độ `face` theo ảnh mới.

## Ảnh

Ảnh đặt trong `public/images`. Danh sách tệp và trang sử dụng ghi trong `public/images/README.txt`. Khung ảnh trong cảnh 3D chỉ hiện khi tệp tồn tại, nên thiếu ảnh không làm hỏng trang.

Ảnh vụ việc lấy từ các bài báo sau, nguồn ghi trong chú thích dưới mỗi ảnh:

| Tệp | Nguồn |
|---|---|
| `vv01.jpg` | [Báo Thanh Tra, ảnh TTXVN](https://thanhtra.com.vn/an-ninh-trat-tu-D718A18CA/xet-xu-6-bi-cao-ve-toi-hoat-dong-nham-lat-do-chinh-quyen-nhan-dan-CC0004FD.html) |
| `vv02.jpg`, `vv02b.jpg` | [Bộ Công an](https://en.bocongan.gov.vn/terrorist-article/images-of-terrorist-acts-by-the-trieu-dai-viet-terrorist-organization-1754317818) |
| `vv03.jpg` | [Báo Thanh Tra, ảnh TTXVN](https://thanhtra.com.vn/an-ninh-trat-tu-D718A18CA/tuyen-truyen-chong-pha-nha-nuoc-pham-chi-dung-bi-tuyen-phat-15-nam-tu-B134A536.html) |
| `vv04.jpg` | [Báo Tiền Phong](https://tienphong.vn/toa-an-ra-thong-cao-ve-phien-xet-xu-dao-minh-quan-pham-lisa-va-dong-pham-post1843826.tpo) |
| `vv05.jpg` | [Báo SGGP](https://www.sggp.org.vn/vu-khung-bo-tai-tinh-dak-lak-10-bi-cao-nhan-an-chung-than-post723594.html) |
| `vv05b.jpg` | [Báo SGGP](https://www.sggp.org.vn/3-ngay-sau-vu-tan-cong-tru-so-ubnd-2-xa-o-dak-lak-binh-yen-da-tro-lai-post693673.html) |

Ảnh báo chí dùng cho mục đích học tập nội bộ. Nếu công khai đường dẫn Vercel, cần cân nhắc bản quyền ảnh hoặc bật **Deployment Protection** trong phần cài đặt dự án trên Vercel.

## Cấu trúc mã

```
app/                      Route /ho-so/[n], layout giữ Deck không bị dựng lại khi đổi trang
content/slides.ts         Toàn bộ nội dung và số nhịp của từng trang
components/
  Deck.tsx                Điều hướng, phím tắt, khung giao diện, màn hình tổng quan
  Overlay.tsx             Phiếu chữ HTML của từng loại trang
  world/
    World.tsx             Canvas 3D dùng chung: ánh sáng, camera, dây đỏ, bảng tên trạm
    layout.ts             Vị trí 15 trạm và góc máy của từng nhịp
    props.tsx             Đạo cụ dùng chung: quân cờ, bìa hồ sơ, biển, ảnh, thanh nối
    stations/             Cảnh 3D của từng nhóm trang
public/images/            Ảnh nhóm và ảnh vụ việc
```

Canvas 3D chỉ dựng trạm đang xem, trạm vừa rời và trạm kế tiếp (trạm kế tiếp được ẩn) để giới hạn số đối tượng phải vẽ. Ở màn hình nhìn toàn bàn, bản đồ bóng đổ ngừng cập nhật. Trên máy không hỗ trợ WebGL, trang vẫn hiển thị phần chữ trên nền tối.
