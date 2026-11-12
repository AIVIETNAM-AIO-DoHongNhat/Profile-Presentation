import type { Metadata } from "next";
import "@fontsource/noto-serif/400.css";
import "@fontsource/noto-serif/400-italic.css";
import "@fontsource/noto-serif/700.css";
import "@fontsource/noto-serif/800.css";
import "@fontsource/noto-serif/700-italic.css";
import "@fontsource/be-vietnam-pro/300.css";
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource/be-vietnam-pro/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/700.css";
import "@fontsource/patrick-hand/400.css";
import "./globals.css";

export const metadata: Metadata = { title: "Hồ sơ chuyên đề · Tập hợp lực lượng, thành lập tổ chức phản động trên không gian mạng" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="vi"><body>{children}</body></html>);
}
