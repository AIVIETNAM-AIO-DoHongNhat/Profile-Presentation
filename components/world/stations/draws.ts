// Các hàm vẽ tấm bìa dùng lại nhiều lần.
import { P, type PersonOpt, crowd, laptop, person, phone, text, MONO, SERIF } from "../art";
import type { Draw } from "../pop";

type Screen = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => void;
export const dPerson = (o: PersonOpt = {}): Draw => (g, W, H) => person(g, W / 2, H - 10, H * 0.93, o);
export const dCrowd = (n: number, o: (i: number) => PersonOpt = () => ({}), spread = 0.55): Draw => (g, W, H) => crowd(g, W / 2, H - 10, H * 0.9, n, o, spread);
/** bề rộng tấm bìa đủ cho n người cao h */
export const crowdW = (n: number, h: number, spread = 0.55) => h * 0.9 * ((n - 1) * spread + 0.62);
export const dPhone = (screen?: Screen): Draw => (g, W, H) => phone(g, 10, 10, W - 20, H - 20, screen);
export const dLaptop = (screen?: Screen): Draw => (g, W, H) => laptop(g, W * 0.08, 10, W * 0.84, H - 20, screen);
/** biểu tượng có chú thích bên dưới */
export const dIcon = (icon: (g: CanvasRenderingContext2D, cx: number, cy: number, s: number) => void, caption?: string, color = P.ink): Draw => (g, W, H) => {
  const s = Math.min(W, caption ? H * 0.72 : H) * 0.8; icon(g, W / 2, caption ? H * 0.4 : H / 2, s);
  if (caption) text(g, caption, W / 2, H * 0.88, MONO(Math.round(H * 0.11), 800), color, "center", W * 0.95);
};
export const dTitle = (t: string, color = P.ink): Draw => (g, W, H) => text(g, t, W / 2, H / 2, SERIF(Math.round(H * 0.6), 800), color, "center", W * 0.95);
