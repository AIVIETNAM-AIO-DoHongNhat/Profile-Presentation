import { SLIDES } from "@/content/slides";
export function generateStaticParams() { return SLIDES.map((_, i) => ({ n: String(i + 1) })); }
export default function Page() { return null; }
