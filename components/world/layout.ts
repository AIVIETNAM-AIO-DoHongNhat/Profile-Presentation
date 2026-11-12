// Bảng đạo diễn: 15 trạm trên mặt bàn chuyên án, và góc máy cho từng (trang, bước).
import * as THREE from "three";
import { SLIDES } from "@/content/slides";
import type { V3 } from "./props";

export const TOTAL = SLIDES.length;
const SX = 18, SZ = 17;

/** Tâm trạm của trang n (1..15). Bàn chia lưới 5 cột x 3 hàng, đi hình rắn lượn. */
export function stationPos(n: number): THREE.Vector3 {
  const i = n - 1, row = Math.floor(i / 5); let col = i % 5; if (row % 2) col = 4 - col;
  return new THREE.Vector3(col * SX, 0, -row * SZ);
}
export const CENTER = new THREE.Vector3(2 * SX, 0, -SZ);
/** Điểm dây đỏ đi qua ở mỗi trạm (mép trước). */
export const anchorOf = (n: number) => stationPos(n).add(new THREE.Vector3(-6.5, 0.04, 6.2));

export type Shot = {
  pos: V3; look: V3;
  /** true: tọa độ tuyệt đối; mặc định tương đối so với tâm trạm */
  abs?: boolean;
  fov?: number;
  /** dịch tâm khung hình sang phải (tỉ lệ chiều ngang) để chừa chỗ cho phiếu chữ bên trái */
  shift?: number;
  /** cảnh toàn bàn: tắt sương mù, hiện bảng tên các trạm */
  overview?: boolean;
};

const OVERVIEW: Shot = { abs: true, pos: [CENTER.x - 1, 106, CENTER.z + 70], look: [CENTER.x - 1, 0, CENTER.z - 6], fov: 40, shift: 0.19, overview: true };

export function shotFor(n: number, step: number): Shot {
  const s = SLIDES[n - 1];
  switch (s.kind) {
    case "cover": return step === 0 ? { pos: [2.4, 10.4, 9.4], look: [0.6, 0, 0.2], shift: 0.23 } : { pos: [0.6, 6.4, 4.4], look: [0.2, 0, -0.6], shift: 0.15 };
    case "team": return { pos: [0.6, 5.6, 14.6], look: [0.6, 5.75, -1], shift: 0, fov: 40 };
    case "toc": return OVERVIEW;
    case "concept": return step === 2 ? { pos: [0, 7.2, 10.5], look: [0, 1.3, -0.4] } : { pos: [0.4, 9, 10], look: [0, 0.4, 0] };
    case "features": { const x = (FEAT_X[step] ?? 0) + (step === 1 ? 0.6 : 0); return { pos: [x + 0.6, 5.6, 8.6], look: [x, 1.7, 0] }; }
    case "types": return step === 0 ? { pos: [0.4, 8.2, 11.6], look: [0, 1.9, 0] } : { pos: [1.0, 9.6, 13.8], look: [0.6, 1.2, 1.0] };
    case "case": return step === 0 ? { pos: [1.2, 12.6, 9.2], look: [1.0, 0, -0.1], shift: 0.2 } : { pos: [1.4, 13.4, 10.6], look: [1.3, 0, 0.6], shift: 0.2 };
    case "forms": { const x = [-4.4, 0, 4.4][step] ?? 0; return { pos: [x * 0.1 + 0.6, 10.2, 14.2], look: [x * 0.1 + 0.6, 0.7, 0], shift: 0.2 }; }
    case "network": return ([
      { pos: [-5.5, 6.6, 8.4], look: [-5.5, 0.6, 0] },
      { pos: [-5.5, 5.2, 6.8], look: [-5.5, 0.6, 0] },
      { pos: [0.6, 7.2, 7.8], look: [1.8, 0.6, 0] },
      { pos: [1.8, 9.6, 6.2], look: [1.8, 0, 0] },
      { pos: [4.4, 10.5, 14.6], look: [4.4, 1.4, 0], shift: 0.19 },
    ] as Shot[])[step];
    case "stage": {
      const h = STAGE_H[s.sec] ?? 0.6, rowsEnd = s.rows.length - 1;
      if (s.timeline && step > rowsEnd) { const k = step - rowsEnd - 1, x = TL_X(k); return { pos: [x + 0.4, 5.4, 14.2], look: [x + 0.4, 1.6, 4.4] }; }
      if (!s.timeline && step === s.rows.length) return { pos: [0.6, h + 7.4, 11.6], look: [0.6, h * 0.4, 3.0] };
      return { pos: [0, h + 7.8, 12.6], look: [0, h + 0.1, 0.8] };
    }
    case "conclusion": return step < s.beats.length ? OVERVIEW : { pos: [0.4, 8.6, 11.6], look: [0, 1.9, 0] };
    case "closing": return step === 0 ? OVERVIEW : { pos: [2.2, 10.8, 11.4], look: [0.2, 0, -0.6], shift: 0.27 };
  }
}

export const STAGE_H: Record<string, number> = { "V.1": 0.6, "V.2": 1.3, "V.3": 2.0 };
export const TL_X = (k: number) => -6.6 + k * 3.3;
/** Vị trí ba mô hình đặc điểm (trang 5), đủ xa để mô hình bên cạnh không lọt vào khung hình. */
export const FEAT_X = [-8, 0, 9];
