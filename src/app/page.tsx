import Link from "next/link";
import { Card } from "@/components/ui";

const portals = [
  {
    href: "/vendor",
    label: "Portal Vendor",
    role: "Vendor Tier 1 & 2 PGN",
    desc: "Ajukan modal kerja berbasis PO, submit invoice, pantau plafon KMK, dan simulasikan opsi pencairan.",
  },
  {
    href: "/pgn",
    label: "Portal PGN",
    role: "Anchor",
    desc: "Verifikasi three-way matching PO – bukti penerimaan – invoice, lalu approve untuk memicu settlement.",
  },
  {
    href: "/bank",
    label: "Ops Bank Mandiri",
    role: "Kopra Supplier Financing",
    desc: "Rekonsiliasi seluruh pencairan KMK, fee income, dan status pelunasan PGN ke Mandiri.",
  },
];

const stages = [
  "Kontrak / PO",
  "Pengajuan KMK",
  "Verifikasi & pencairan",
  "Submit invoice",
  "Approval PGN",
  "Settlement otomatis",
  "PGN bayar Mandiri",
  "Sinkronisasi status",
];

export default function Home() {
  return (
    <main className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-10 max-w-[62ch] border-b border-line pb-8 sm:mb-14 sm:pb-10">
        <div className="mb-3 flex items-center gap-2 font-mono text-[11px] tracking-widest text-gas uppercase">
          <span className="inline-block h-px w-5 bg-gas" />
          Prototipe · ODP 352 Wholesale Business Case
        </div>
        <h1 className="text-[28px] leading-[1.2] sm:text-4xl sm:leading-[1.15]">
          Aktivasi Kopra Supplier Financing dengan PGN sebagai anchor baru
        </h1>
        <p className="mt-4 text-[16.5px] text-ink-soft">
          Simulasi tiga portal — vendor, PGN, dan operasional Bank Mandiri — yang menjalankan alur
          pembiayaan rantai pasok dari pengajuan PO financing hingga pelunasan, sesuai PRD. Data
          bersifat dummy dan tersimpan di memori server untuk keperluan demo.
        </p>
      </div>

      <div className="mb-14 grid gap-4 sm:grid-cols-3">
        {portals.map((p) => (
          <Link key={p.href} href={p.href} className="group block">
            <Card className="h-full px-5 py-5 transition-shadow group-hover:shadow-[0_2px_4px_rgba(20,33,61,0.08),0_14px_28px_rgba(20,33,61,0.08)]">
              <div className="mb-3 text-[11px] font-semibold tracking-wide text-accent uppercase">{p.role}</div>
              <h2 className="mb-2 text-lg">{p.label}</h2>
              <p className="text-[13.5px] text-ink-soft">{p.desc}</p>
              <div className="mt-4 text-[13px] font-medium text-gas group-hover:underline">
                Buka portal →
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div>
        <div className="mb-5 text-[11px] font-semibold tracking-widest text-ink-faint uppercase">
          Alur bisnis end-to-end
        </div>
        <ol className="flex flex-wrap gap-2">
          {stages.map((s, i) => (
            <li key={s} className="flex items-center gap-2">
              <span className="flex items-center gap-2 rounded-full border border-line-strong bg-paper-raised px-3 py-1.5 text-[12.5px]">
                <span className="num font-semibold text-gas">{i}</span>
                <span className="text-ink-soft">{s}</span>
              </span>
              {i < stages.length - 1 && <span className="text-ink-faint">→</span>}
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
