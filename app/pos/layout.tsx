import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: { default: "POS", template: "%s | POS" },
  robots: { index: false, follow: false },
};

export default function PosLayout({ children }: { children: ReactNode }) {
  return <div className="flex min-h-full flex-1 flex-col bg-plum-50/60">{children}</div>;
}
