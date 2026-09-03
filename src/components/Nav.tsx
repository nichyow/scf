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
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-6 sm:py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-gas font-mono text-[12px] font-bold text-paper-raised">
            SC
          </span>
          <span className="font-serif text-[15.5px] font-semibold text-ink">Kopra × PGN</span>
        </Link>
        <nav className="-mx-1 flex w-full items-center gap-1 overflow-x-auto sm:w-auto sm:overflow-visible">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`shrink-0 rounded px-2.5 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors sm:px-3 sm:text-[13.5px] ${
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
