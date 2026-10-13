import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ALIS | Legal clarity, with context",
  description:
    "Understand everyday legal situations, organise evidence and prepare for informed conversations with qualified South African legal professionals.",
  applicationName: "ALIS",
  keywords: ["South Africa", "legal information", "document preparation", "legal safety"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
