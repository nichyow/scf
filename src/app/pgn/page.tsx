"use client";

import { useCallback, useEffect, useState } from "react";
import type { FullState, Invoice, PurchaseOrder } from "@/lib/types";
import { api } from "@/lib/api";
import { rupiah, shortDate, daysUntil } from "@/lib/format";
import { Badge, Card, EmptyState, SectionHead, StatTile } from "@/components/ui";
import { NotificationFeed } from "@/components/NotificationFeed";

function MatchRow({ label, po, invoice }: { label: string; po: number; invoice: number }) {
  const match = invoice <= po;
  return (
    <div className="flex items-center justify-between border-b border-line py-2 text-[13px] last:border-0">
      <span className="text-ink-faint">{label}</span>
      <div className="flex items-center gap-3">
        <span className="num text-ink-soft">{rupiah(po)}</span>
        <span className="text-ink-faint">vs</span>
        <span className="num text-ink">{rupiah(invoice)}</span>
        <Badge tone={match ? "good" : "bad"}>{match ? "Sesuai" : "Selisih"}</Badge>
      </div>
    </div>
  );
}

function PendingInvoiceCard({
  invoice,
  po,
  onApprove,
  busy,
}: {
  invoice: Invoice;
  po: PurchaseOrder;
  onApprove: () => void;
  busy: boolean;
}) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-mono text-[12px] text-ink-faint">{invoice.invoiceNumber} · {po.poNumber}</div>
          <h3 className="mt-0.5 text-[15px]">{po.description}</h3>
        </div>
        <Badge tone="accent">Menunggu approval</Badge>
      </div>

      <div className="mb-4 rounded-md border border-line bg-paper px-4 py-1">
        <MatchRow label="Nilai PO vs invoice" po={po.value} invoice={invoice.amount} />
        <MatchRow label="Bukti penerimaan vs invoice (BAST)" po={invoice.amount} invoice={invoice.amount} />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-[12.5px] text-ink-faint">
          Diajukan {shortDate(invoice.submittedDate)} · Jatuh tempo {shortDate(invoice.dueDate)}
        </div>
        <button
          disabled={busy}
          onClick={onApprove}
          className="rounded bg-gas px-4 py-1.5 text-[13px] font-medium text-paper-raised hover:opacity-90 disabled:opacity-50"
        >
          Approve (three-way match)
        </button>
      </div>
    </Card>
  );
}

export default function PgnPortal() {
  const [state, setState] = useState<FullState | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    api.getState().then(setState);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!state) {
    return <div className="mx-auto max-w-[1180px] px-6 py-14 text-ink-faint">Memuat data…</div>;
  }

  async function approve(invoiceId: string) {
    setBusyId(invoiceId);
    try {
      await api.approveInvoice(invoiceId);
      refresh();
    } finally {
      setBusyId(null);
    }
  }

  const pending = state.invoices.filter((i) => i.status === "diajukan");
  const approved = state.invoices.filter((i) => i.status === "disetujui");
  const notifications = state.notifications.filter((n) => n.recipientRole === "pgn");

  const totalDiajukan = pending.reduce((s, i) => s + i.amount, 0);
  const totalDisetujui = approved.reduce((s, i) => s + i.amount, 0);

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-10">
      <SectionHead
        eyebrow="Portal PGN"
        title="Verifikasi & approval invoice vendor"
        desc="Three-way matching PO, bukti penerimaan, dan invoice sebelum settlement otomatis berjalan."
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <StatTile label="Menunggu approval" value={String(pending.length)} sub={rupiah(totalDiajukan)} />
        <StatTile label="Disetujui" value={String(approved.length)} sub={rupiah(totalDisetujui)} />
        <StatTile label="Vendor terdaftar" value={String(state.vendors.length)} sub="Tier 1 & Tier 2" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <div>
            <div className="mb-4 text-[11px] font-semibold tracking-widest text-ink-faint uppercase">
              Menunggu approval ({pending.length})
            </div>
            <div className="space-y-4">
              {pending.length === 0 && <EmptyState>Tidak ada invoice yang menunggu approval.</EmptyState>}
              {pending.map((inv) => {
                const po = state.purchaseOrders.find((p) => p.id === inv.poId)!;
                return (
                  <PendingInvoiceCard
                    key={inv.id}
                    invoice={inv}
                    po={po}
                    busy={busyId === inv.id}
                    onApprove={() => approve(inv.id)}
                  />
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-4 text-[11px] font-semibold tracking-widest text-ink-faint uppercase">
              Sudah disetujui — reminder jatuh tempo
            </div>
            <div className="twrap overflow-x-auto rounded-lg border border-line">
              <table className="w-full min-w-[560px] border-collapse bg-paper-raised text-[13.5px]">
                <thead>
                  <tr className="border-b border-line-strong text-left text-[11px] tracking-wide text-ink-faint uppercase">
                    <th className="px-4 py-2.5">Invoice</th>
                    <th className="px-4 py-2.5">Vendor</th>
                    <th className="px-4 py-2.5">Nominal</th>
                    <th className="px-4 py-2.5">Jatuh tempo</th>
                    <th className="px-4 py-2.5">Reminder</th>
                  </tr>
                </thead>
                <tbody>
                  {approved.map((inv) => {
                    const vendor = state.vendors.find((v) => v.id === inv.vendorId)!;
                    const d = daysUntil(inv.dueDate);
                    return (
                      <tr key={inv.id} className="border-b border-line last:border-0">
                        <td className="px-4 py-2.5 font-medium">{inv.invoiceNumber}</td>
                        <td className="px-4 py-2.5 text-ink-soft">{vendor.name}</td>
                        <td className="num px-4 py-2.5">{rupiah(inv.amount)}</td>
                        <td className="px-4 py-2.5 text-ink-soft">{shortDate(inv.dueDate)}</td>
                        <td className="px-4 py-2.5">
                          {d < 0 ? (
                            <Badge tone="bad">Lewat jatuh tempo</Badge>
                          ) : d <= 3 ? (
                            <Badge tone="bad">H-{d} · siapkan dana</Badge>
                          ) : d <= 7 ? (
                            <Badge tone="warn">H-{d}</Badge>
                          ) : (
                            <Badge tone="neutral">H-{d}</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {approved.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-ink-faint">
                        Belum ada invoice yang disetujui.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-4 text-[11px] font-semibold tracking-widest text-ink-faint uppercase">
            Notifikasi WhatsApp
          </div>
          <Card className="overflow-hidden">
            <NotificationFeed items={notifications} />
          </Card>
        </div>
      </div>
    </main>
  );
}
