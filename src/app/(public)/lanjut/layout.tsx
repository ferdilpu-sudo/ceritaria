import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lanjut Nonton",
  robots: { index: false, follow: true },
};

export default function ContinueLayout({ children }: { children: React.ReactNode }) {
  return children;
}
