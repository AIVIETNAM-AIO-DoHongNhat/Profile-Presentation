import Deck from "@/components/Deck";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}<Deck /></>;
}
