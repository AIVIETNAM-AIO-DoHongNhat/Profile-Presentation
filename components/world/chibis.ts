// Trang phục chibi của từng thành viên, lấy theo ảnh nhóm (cùng thứ tự với MEMBERS trong content/slides.ts).
import type { ChibiOpt } from "./art";

export const CHIBI: ChibiOpt[] = [
  { hair: "wavy", glasses: true, top: "#a8322a", topStyle: "print", bottom: "#3b302a" },           // Nguyễn Huy Hoàng
  { hair: "short", top: "#2a2c30", accent: "#e8d36a", bottom: "#2a2c30" },                           // Huỳnh Nguyễn Bảo Khương
  { hair: "spiky", top: "#26282c", bottom: "#3a3d43" },                                              // Cao Quang Hải
  { hair: "short", top: "#6f6a66", topStyle: "hoodie", bottom: "#3a3d43" },                          // Đỗ Hồng Nhất
  { hair: "short", top: "#d9c7ae", bottom: "#3a3d43" },                                              // Nguyễn Thế Hùng
  { hair: "spiky", top: "#2e6fc4", topStyle: "jersey", accent: "#f4f4f0", bottom: "#2a2c30" },       // Nguyễn Cửu An Phú
  { hair: "short", top: "#e8e2d2", topStyle: "check", accent: "#7d838b", bottom: "#2a2c30" },        // Nguyễn Tiến Mạnh
  { hair: "short", top: "#f2f2ee", topStyle: "stripe", accent: "#2a3b66", bottom: "#2a2c30" },       // Nguyễn Sỹ Long
  { hair: "long", hairC: "#2b211c", top: "#1f2125", topStyle: "cardigan", bottom: "#f1ede4", crown: true },     // Phạm Khánh Linh
  { hair: "spiky", top: "#8f8a86", bottom: "#23262b", shorts: true },                                 // Nguyễn Minh Hiếu
];
