import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Kopra Supplier Financing × PGN",
  description: "Prototipe aktivasi PGN sebagai anchor baru di Kopra Supplier Financing.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <Nav />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
