"use client";

import { useState } from "react";
import type { Financing, Invoice, PurchaseOrder, Settlement, Vendor } from "@/lib/types";
import { rupiah, shortDate, daysUntil } from "@/lib/format";
import { api } from "@/lib/api";
import { Badge, Card } from "@/components/ui";
import { StageTimeline } from "@/components/StageTimeline";

const financingBadge: Record<Financing["status"], { tone: "accent" | "gas" | "good" | "bad"; label: string }> = {
  diajukan: { tone: "accent", label: "Menunggu verifikasi Mandiri" },
  diverifikasi: { tone: "accent", label: "Terverifikasi — menunggu pencairan" },
  dicairkan: { tone: "gas", label: "Dana KMK cair" },
  lunas: { tone: "good", label: "KMK lunas" },
  ditolak: { tone: "bad", label: "Pengajuan ditolak" },
};

const invoiceBadge: Record<Invoice["status"], { tone: "accent" | "good" | "bad"; label: string }> = {
  diajukan: { tone: "accent", label: "Menunggu approval PGN" },
  disetujui: { tone: "good", label: "Disetujui PGN" },
  ditolak: { tone: "bad", label: "Ditolak PGN" },
};

export function PoCard({
  po,
  vendor,
  financing,
  invoice,
  settlement,
  sisaPlafon,
  onChanged,
}: {
  po: PurchaseOrder;
  vendor: Vendor;
  financing?: Financing;
  invoice?: Invoice;
  settlement?: Settlement;
  sisaPlafon: number;
  onChanged: () => void;
}) {
  const [financingAmount, setFinancingAmount] = useState(String(Math.min(po.value, sisaPlafon) || 0));
  const [invoiceAmount, setInvoiceAmount] = useState(String(po.value));
  const [invoiceNumber, setInvoiceNumber] = useState(`INV/${vendor.name.split(" ")[0].toUpperCase()}/2026/${po.poNumber.slice(-3)}`);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run(fn: () => Promise<unknown>) {
    setErr(null);
    setBusy(true);
    try {
      await fn();
      onChanged();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const due = daysUntil(po.workDueDate);

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-mono text-[12px] text-ink-faint">{po.poNumber}</div>
          <h3 className="mt-0.5 text-[15.5px]">{po.description}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-ink-faint">
            <span>
              Nilai PO: <span className="num font-semibold text-ink-soft">{rupiah(po.value)}</span>
            </span>
            <span>Target selesai: {shortDate(po.workDueDate)}</span>
            {due <= 7 && due >= 0 && <Badge tone="warn">H-{due} target kerja</Badge>}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <StageTimeline
          hasFinancing={!!financing}
          financingStatus={financing?.status}
          hasInvoice={!!invoice}
          invoiceStatus={invoice?.status}
          hasSettlement={!!settlement}
          settlementChoice={settlement?.choice}
          paidByPGN={settlement?.paidByPGN}
        />
      </div>

      {err && (
        <div className="mb-3 rounded border border-bad/30 bg-bad-bg px-3 py-2 text-[13px] text-bad">{err}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* KMK financing block */}
        <div className="rounded-md border border-line bg-paper px-4 py-3.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[12px] font-semibold tracking-wide text-ink-soft uppercase">PO Financing (KMK)</span>
            {financing && <Badge tone={financingBadge[financing.status].tone}>{financingBadge[financing.status].label}</Badge>}
          </div>
          {!financing || financing.status === "ditolak" ? (
            <div className="space-y-2">
              {financing?.status === "ditolak" && (
                <div className="rounded border border-bad/30 bg-bad-bg px-2.5 py-1.5 text-[12px] text-bad">
                  Pengajuan sebelumnya senilai {rupiah(financing.amountRequested)} ditolak
                  {financing.rejectedDate && ` pada ${shortDate(financing.rejectedDate)}`}
                  {financing.rejectionReason ? `: ${financing.rejectionReason}` : "."}
                </div>
              )}
              <div className="flex items-end gap-2">
                <label className="flex-1 text-[12.5px]">
                  <span className="mb-1 block text-ink-faint">Jumlah pengajuan</span>
                  <input
                    type="number"
                    value={financingAmount}
                    onChange={(e) => setFinancingAmount(e.target.value)}
                    className="w-full rounded border border-line-strong bg-paper-raised px-2.5 py-1.5 text-[13.5px] outline-none focus:border-gas"
                  />
                </label>
                <button
                  disabled={busy}
                  onClick={() => run(() => api.createFinancing(po.id, Number(financingAmount)))}
                  className="rounded bg-ink px-3 py-1.5 text-[13px] font-medium text-paper-raised hover:opacity-90 disabled:opacity-50"
                >
                  {financing?.status === "ditolak" ? "Ajukan ulang" : "Ajukan"}
                </button>
              </div>
            </div>
          ) : (
            <div className="num space-y-1 text-[13.5px]">
              <div className="flex justify-between">
                <span className="text-ink-faint">Diajukan</span>
                <span>{rupiah(financing.amountRequested)}</span>
              </div>
              {financing.disbursedDate && (
                <div className="flex justify-between text-ink-faint">
                  <span>Cair</span>
                  <span>{shortDate(financing.disbursedDate)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Invoice block */}
        <div className="rounded-md border border-line bg-paper px-4 py-3.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[12px] font-semibold tracking-wide text-ink-soft uppercase">Invoice</span>
            {invoice && <Badge tone={invoiceBadge[invoice.status].tone}>{invoiceBadge[invoice.status].label}</Badge>}
          </div>
          {!invoice ? (
            <div className="space-y-2">
              <label className="block text-[12.5px]">
                <span className="mb-1 block text-ink-faint">No. invoice</span>
                <input
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full rounded border border-line-strong bg-paper-raised px-2.5 py-1.5 text-[13.5px] outline-none focus:border-gas"
                />
              </label>
              <div className="flex items-end gap-2">
                <label className="flex-1 text-[12.5px]">
                  <span className="mb-1 block text-ink-faint">Nominal</span>
                  <input
                    type="number"
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(e.target.value)}
                    className="w-full rounded border border-line-strong bg-paper-raised px-2.5 py-1.5 text-[13.5px] outline-none focus:border-gas"
                  />
                </label>
                <button
                  disabled={busy}
                  onClick={() =>
                    run(() =>
                      api.submitInvoice({
                        poId: po.id,
                        amount: Number(invoiceAmount),
                        invoiceNumber,
                        dueDate: po.workDueDate,
                        financingId: financing?.status === "dicairkan" ? financing.id : undefined,
                      })
                    )
                  }
                  className="rounded bg-ink px-3 py-1.5 text-[13px] font-medium text-paper-raised hover:opacity-90 disabled:opacity-50"
                >
                  Submit
                </button>
              </div>
            </div>
          ) : (
            <div className="num space-y-1 text-[13.5px]">
              <div className="flex justify-between">
                <span className="text-ink-faint">Nominal</span>
                <span>{rupiah(invoice.amount)}</span>
              </div>
              <div className="flex justify-between text-ink-faint">
                <span>Jatuh tempo</span>
                <span>{shortDate(invoice.dueDate)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {settlement && (
        <div className="mt-4 rounded-md border border-gas/30 bg-gas-soft px-4 py-3.5">
          <div className="mb-2.5 text-[12px] font-semibold tracking-wide text-gas uppercase">Settlement</div>
          <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <div className="text-[11px] text-ink-faint">Offset KMK</div>
              <div className="num text-[13.5px] font-semibold">{rupiah(settlement.kmkOffsetAmount)}</div>
            </div>
            <div>
              <div className="text-[11px] text-ink-faint">Sisa dana</div>
              <div className="num text-[13.5px] font-semibold">{rupiah(settlement.remainingAmount)}</div>
            </div>
            {settlement.feeAmount !== undefined && (
              <div>
                <div className="text-[11px] text-ink-faint">Fee percepatan</div>
                <div className="num text-[13.5px] font-semibold text-warn">{rupiah(settlement.feeAmount)}</div>
              </div>
            )}
            {settlement.finalDisbursedAmount !== undefined && (
              <div>
                <div className="text-[11px] text-ink-faint">Dana diterima</div>
                <div className="num text-[13.5px] font-semibold text-good">{rupiah(settlement.finalDisbursedAmount)}</div>
              </div>
            )}
          </div>

          {settlement.choice === "belum_dipilih" ? (
            <div className="flex flex-wrap gap-2">
              <button
                disabled={busy}
                onClick={() => run(() => api.chooseSettlement(settlement.id, "percepat_pencairan"))}
                className="rounded bg-accent px-3 py-1.5 text-[13px] font-medium text-paper-raised hover:opacity-90 disabled:opacity-50"
              >
                Percepat pencairan (fee 1,5%)
              </button>
              <button
                disabled={busy}
                onClick={() => run(() => api.chooseSettlement(settlement.id, "tunggu_jatuh_tempo"))}
                className="rounded border border-line-strong bg-paper-raised px-3 py-1.5 text-[13px] font-medium text-ink hover:bg-paper disabled:opacity-50"
              >
                Tunggu jatuh tempo
              </button>
            </div>
          ) : (
            <div className="text-[13px] text-ink-soft">
              Pilihan:{" "}
              <span className="font-semibold text-ink">
                {settlement.choice === "percepat_pencairan" ? "Percepat pencairan" : "Tunggu jatuh tempo normal"}
              </span>
              {settlement.choice === "tunggu_jatuh_tempo" && !settlement.paidByPGN && (
                <span className="text-ink-faint"> — menunggu PGN membayar Mandiri</span>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
