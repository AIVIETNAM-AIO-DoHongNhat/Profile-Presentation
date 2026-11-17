// Bảng đạo diễn: vị trí 14 trạm trong không gian mạng và góc máy cho từng (trang, bước).
import * as THREE from "three";
import { SLIDES } from "@/content/slides";
import type { V3 } from "./fx";

export const TOTAL = SLIDES.length;
const SX = 34, SZ = 32;

/** Tâm trạm của trang n (1..14). Lưới 5 cột, đi hình rắn lượn. */
export function stationPos(n: number): THREE.Vector3 {
  const i = n - 1, row = Math.floor(i / 5); let col = i % 5; if (row % 2) col = 4 - col;
  return new THREE.Vector3(col * SX, 0, -row * SZ);
}
export const CENTER = new THREE.Vector3(2 * SX, 0, -SZ);
/** Điểm sợi cáp quang đi qua ở mỗi trạm (sát sàn, phía trước). */
export const anchorOf = (n: number) => stationPos(n).add(new THREE.Vector3(0, -1.5, 6.5));
/** Vị trí ba cụm mô hình trong trang Đặc điểm, Các dạng, Hình thức. */
export const TRIO_X = [-9.5, 0, 9.5];
/** Bốn vùng của trang Khái niệm (dây chuyền đọc từ trái sang phải), camera lia sang một vùng mỗi nhịp. */
export const CONCEPT_X = [-4.5, 0, 4.5, 9];
/** Hai hòn đảo của trang Các dạng: "trên mạng" và "thực tế". */
export const TYPES_X = [-1.9, 3.9];
/** Vị trí khu hồ sơ vụ việc trong trang phương thức. */
export const CASE_X = 13;

export type Shot = {
  pos: V3; look: V3;
  /** true: tọa độ tuyệt đối; mặc định tương đối so với tâm trạm */
  abs?: boolean;
  fov?: number;
  /** dịch tâm khung hình sang phải (tỉ lệ chiều ngang) để chừa chỗ cho phiếu chữ bên trái */
  shift?: number;
};

export function shotFor(n: number, step: number): Shot {
  const s = SLIDES[n - 1];
  switch (s.kind) {
    // bìa: nhìn chéo từ trên xuống, bao trọn mạng nhện và kim tự tháp tổ chức ở nửa phải
    case "cover": return { pos: [2.0, 8.2, 12.4], look: [2.3, -0.7, -0.2], shift: 0.22 };
    case "closing": return { pos: [0.8, 7.2, 12.6], look: [0.6, -0.3, -0.4], shift: 0.22 };
    case "team": return step === 0 ? { pos: [0, 3.0, 9.6], look: [0, 1.3, -1.6], shift: 0.2 } : { pos: [0, 7.6, 13.4], look: [0, -0.3, 0.8], shift: 0.145 };
    // mục lục: nhìn chéo từ trên xuống để thấy cả con đường và sáu cột mốc
    case "toc": return { pos: [1.4, 8.4, 12.8], look: [1.4, -0.4, -0.2], shift: 0.2 };
    // Khái niệm: lia ngang theo dây chuyền, mỗi nhịp một vùng (vùng cũ còn thấy ở mép trái)
    case "concept": { const x = CONCEPT_X[Math.max(0, step)] ?? 0; return { pos: [x + 0.5, 7.4, 10.6], look: [x, -0.6, 0.0] }; }
    // Đặc điểm: đẩy máy sát vào cụm đang nói
    case "features": { const x = TRIO_X[Math.max(0, step)] ?? 0; return { pos: [x + 0.3, 6.6, 8.8], look: [x, -0.9, 0.0] }; }
    // Các dạng: một cảnh, đứng yên, mỗi nhịp đẩy máy vào một chút
    case "types": { const k = Math.max(0, step), x = (TYPES_X[0] + TYPES_X[1]) / 2; return { pos: [x + 0.2, 7.6 - k * 0.3, 12.2 - k * 0.5], look: [x, -0.8, -0.1] }; }
    // Hình thức: cần cẩu, nhìn dốc từ trên xuống cụm đang nói
    case "forms": { const x = TRIO_X[Math.max(0, step)] ?? 0; return { pos: [x, 10.2, 8.2], look: [x, -1.2, -0.1] }; }
    case "method": {
      if (step >= s.m.beats.length) return { pos: [CASE_X + 0.4, 3.6, 9.8], look: [CASE_X + 0.3, 0.7, -0.4] }; // bảng điều tra
      const k = Math.max(0, step);
      switch (s.m.n) {
        // PT1 phễu hút người: cận màn hình điện thoại, kéo lùi ra, rồi lia phải sang "nhóm kín"
        case 1: return ([
          { pos: [0.2, 3.6, 5.4], look: [0, 1.0, -2.0] }, { pos: [0.3, 7.6, 10.6], look: [0, -0.6, 0] },
          { pos: [0.3, 7.2, 10.2], look: [0, -0.6, 0.3] }, { pos: [2.6, 7.4, 10.4], look: [2.8, -0.6, -0.2] },
        ] as Shot[])[k];
        // PT2 lớp học: góc thấp, chính diện như ngồi cuối lớp
        case 2: return k < 3 ? { pos: [0, 4.8, 10.6], look: [0, 0.0, -1.0] } : { pos: [1.8, 5.0, 10.6], look: [2.0, -0.1, -1.0] };
        // PT3 sóng phát tán: máy nâng dần lên khi tầm lan rộng ra
        case 3: return { pos: [0, 6.0 + k * 1.5, 9.6 + k * 0.8], look: [0, -0.3 - k * 0.25, -1.2 + k * 0.3] };
        // PT4 hoạt động ngầm: góc thấp sát nhóm, nhịp cuối lùi ra thấy cả biên giới
        case 4: return k < 3 ? { pos: [0, 4.8, 9.6], look: [0, -0.2, -0.6] } : { pos: [0, 7.8, 11.2], look: [0, -0.9, -1.0] };
        // PT5 bản đồ biên giới: nhìn dốc từ trên xuống
        default: return { pos: [0, 11.6, 7.8], look: [0, -1.4, -0.3] };
      }
    }
    case "solutions": {
      if (step >= 5) return { pos: [0, 7.4, 12.4], look: [0, 0.2, -0.4], shift: 0.2 };
      return { pos: [0.5, 12.4, 11.6], look: [0.5, -1.6, -1.4], shift: 0.2 };
    }
  }
}
