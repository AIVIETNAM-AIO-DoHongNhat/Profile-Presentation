# Chuyên đề KGM · Tiểu đội 2

Bản trình chiếu web cho chuyên đề *Tập hợp lực lượng, thành lập tổ chức phản động trên không gian mạng*. Nội dung khớp với `docs/noi_dung.docx`, gồm 14 trang.

Ý tưởng trình bày: người xem đang lật **bên trong một cuốn hồ sơ**. Mỗi trang là một tờ giấy kẻ ô trong bìa hồ sơ. Hình minh họa là các tấm bìa cắt rời (người, điện thoại, trang nhóm mạng xã hội, lớp học trực tuyến, ứng dụng chat, biên giới, tiền, trụ sở…) bật dựng lên khỏi trang như sách pop-up theo từng nhịp bấm, nối với nhau bằng chỉ đỏ và mũi tên ghi chú. Ảnh vụ việc là ảnh in kẹp vào hồ sơ, kèm dấu mộc mức án.

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
| Màn hình tổng quan 14 trang | `O`, đóng bằng `O` hoặc `Esc` |
| Nhảy tới một nhịp | Bấm vào dòng trong phiếu chữ hoặc chấm trên thanh bước |

Đường dẫn `/ho-so/10/?s=3` mở thẳng trang 10 ở nhịp thứ tư (nhịp đánh số từ 0). Con trỏ chuột tự ẩn sau 2,5 giây không di chuyển.

## Cấu trúc trình chiếu

| Trang | Nội dung | Số nhịp |
|---|---|---|
| 1–3 | Bìa, thành viên, mục lục | 1, 2, 1 |
| 4 | I. Khái niệm | 4 |
| 5 | II. Đặc điểm | 3 |
| 6 | III. Các dạng hội nhóm | 3 |
| 7 | IV. Hình thức thành lập | 3 |
| 8–12 | V. Năm phương thức, thủ đoạn. Mỗi trang 4 thủ đoạn (a–d) và 1 nhịp vụ việc minh họa | 5 mỗi trang |
| 13 | VI. Giải pháp: 5 nhóm giải pháp và giải pháp chung | 6 |
| 14 | Lời cảm ơn | 1 |

## Sửa nội dung

Toàn bộ chữ nằm trong `content/slides.ts`. Phần giao diện không cần sửa khi thay nội dung.

| Cần sửa | Vị trí |
|---|---|
| Tên nhóm | `GROUP` |
| Họ tên và vai trò thành viên | `MEMBERS`, sửa `name` và `role` (0 nhóm trưởng, 1 thuyết trình, 2 thiết kế slide, 3 tìm kiếm tài liệu) |
| Định nghĩa ở trang 4 | `DEFINITION` (chữ trong `**…**` được tô sáng) |
| Năm phương thức và vụ việc | `METHODS`: `beats` là 4 thủ đoạn, `case` là vụ việc (ảnh, các dòng tình tiết, con số nổi bật `verdict`, nguồn) |
| Các ý của trang khái niệm, đặc điểm, dạng, hình thức, giải pháp | trường `beats` hoặc `groups` trong `SLIDES` |

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
  Overlay.tsx             Bảng chữ HTML của từng loại trang
  world/
    World.tsx             Canvas 3D dùng chung: bìa hồ sơ, các tờ giấy, đèn bàn đổ bóng, chỉ đỏ nối trang, camera
    layout.ts             Vị trí 14 tờ và góc máy của từng nhịp
    art.ts                Thư viện hình vẽ canvas: người, điện thoại, laptop, trang nhóm, chat, biểu tượng
    pop.tsx               Tấm bìa pop-up (Card) và đường chỉ mực tự vẽ (InkPath)
    chibis.ts             Trang phục chibi của từng thành viên (theo ảnh nhóm)
    fx.tsx                Tiện ích chung: ảnh in, chú thích đánh máy, vòng tròn, làm mượt theo nhịp
    stations/             Cảnh của từng trang: Intro (bìa, thành viên, cảm ơn), Theory (mục I–IV), Methods (mục V), Solutions (mục VI)
public/images/            Ảnh nhóm và ảnh vụ việc
```

Canvas 3D chỉ dựng trang đang xem, trang vừa rời và trang kế tiếp (trang kế tiếp được ẩn). Muốn đổi hình minh họa của một nhịp, sửa các thẻ `<Card>` trong `components/world/stations/`; mỗi thẻ nhận một hàm vẽ canvas từ `art.ts`. Trên máy không hỗ trợ WebGL, trang vẫn hiển thị phần chữ trên nền tối.

Thêm `?snap=1` vào đường dẫn (ví dụ `/ho-so/8/?s=4&snap=1`) để mọi chuyển động nhảy thẳng tới trạng thái cuối. Chế độ này chỉ dùng khi chụp ảnh kiểm tra trên máy yếu.
