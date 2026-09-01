"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Ringkasan" },
  { href: "/vendor", label: "Portal Vendor" },
  { href: "/pgn", label: "Portal PGN" },
  { href: "/bank", label: "Ops Bank Mandiri" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-6 px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-gas font-mono text-[12px] font-bold text-paper-raised">
            SC
          </span>
          <span className="font-serif text-[15.5px] font-semibold text-ink">Kopra × PGN</span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded px-3 py-1.5 text-[13.5px] font-medium transition-colors ${
                  active ? "bg-gas-soft text-gas" : "text-ink-soft hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
