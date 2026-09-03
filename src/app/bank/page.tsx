"use client";

import { useCallback, useEffect, useState } from "react";
import type { FullState } from "@/lib/types";
import { api } from "@/lib/api";
import { rupiah, shortDate } from "@/lib/format";
import { Badge, Card, EmptyState, SectionHead, StatTile } from "@/components/ui";
import { NotificationFeed } from "@/components/NotificationFeed";

export default function BankPortal() {
  const [state, setState] = useState<FullState | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  const refresh = useCallback(() => {
    api.getState().then(setState);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!state) {
    return <div className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 sm:py-14 text-ink-faint">Memuat data…</div>;
  }

  async function verify(financingId: string) {
    setBusyId(financingId);
    try {
      await api.verifyFinancing(financingId);
      refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function reject(financingId: string) {
    setBusyId(financingId);
    try {
      await api.rejectFinancing(financingId, rejectReason[financingId]);
      setRejectReason((prev) => {
        const next = { ...prev };
        delete next[financingId];
        return next;
      });
      refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function pay(settlementId: string) {
    setBusyId(settlementId);
    try {
      await api.paySettlement(settlementId);
      refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function reset() {
    setBusyId("reset");
    try {
      await api.reset();
      refresh();
    } finally {
      setBusyId(null);
    }
  }

  const pendingFinancing = state.financings.filter((f) => f.status === "diajukan");
  const feeIncome = state.settlements.reduce((s, x) => s + (x.feeAmount ?? 0), 0);
  const totalDisbursedKMK = state.financings.reduce((s, f) => s + f.amountRequested, 0);
  const outstanding = state.settlements
    .filter((s) => s.choice === "tunggu_jatuh_tempo" && !s.paidByPGN)
    .reduce((s, x) => s + x.remainingAmount, 0);
  const notifications = state.notifications.filter((n) => n.recipientRole === "bank");

  return (
    <main className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <SectionHead
          eyebrow="Ops Bank Mandiri"
          title="Rekonsiliasi Kopra Supplier Financing"
          desc="Pencairan KMK, fee-based income, dan status pelunasan PGN ke Mandiri."
        />
        <button
          onClick={reset}
          disabled={busyId === "reset"}
          className="rounded border border-line-strong bg-paper-raised px-3 py-1.5 text-[12.5px] font-medium text-ink-soft hover:text-ink disabled:opacity-50"
        >
          Reset data demo
        </button>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <StatTile label="Fee income terealisasi" value={rupiah(feeIncome)} sub="dari percepatan pencairan" />
        <StatTile label="Total KMK dicairkan" value={rupiah(totalDisbursedKMK)} />
        <StatTile label="Outstanding ke PGN" value={rupiah(outstanding)} sub="menunggu jatuh tempo" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <div>
            <div className="mb-4 text-[11px] font-semibold tracking-widest text-ink-faint uppercase">
              Pengajuan KMK menunggu verifikasi ({pendingFinancing.length})
            </div>
            <div className="space-y-3">
              {pendingFinancing.length === 0 && <EmptyState>Tidak ada pengajuan KMK yang menunggu.</EmptyState>}
              {pendingFinancing.map((f) => {
                const vendor = state.vendors.find((v) => v.id === f.vendorId)!;
                const po = state.purchaseOrders.find((p) => p.id === f.poId)!;
                return (
                  <Card key={f.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                    <div>
                      <div className="text-[13.5px] font-medium">{vendor.name}</div>
                      <div className="font-mono text-[12px] text-ink-faint">{po.poNumber}</div>
                    </div>
                    <div className="num text-[14px] font-semibold">{rupiah(f.amountRequested)}</div>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        placeholder="Alasan penolakan (opsional)"
                        value={rejectReason[f.id] ?? ""}
                        onChange={(e) => setRejectReason((prev) => ({ ...prev, [f.id]: e.target.value }))}
                        className="w-full min-w-0 flex-1 rounded border border-line-strong bg-paper-raised px-2.5 py-1.5 text-[12.5px] outline-none focus:border-gas sm:w-48 sm:flex-none"
                      />
                      <button
                        disabled={busyId === f.id}
                        onClick={() => reject(f.id)}
                        className="rounded border border-bad/40 bg-bad-bg px-3 py-1.5 text-[13px] font-medium text-bad hover:opacity-90 disabled:opacity-50"
                      >
                        Tolak
                      </button>
                      <button
                        disabled={busyId === f.id}
                        onClick={() => verify(f.id)}
                        className="rounded bg-ink px-3 py-1.5 text-[13px] font-medium text-paper-raised hover:opacity-90 disabled:opacity-50"
                      >
                        Verifikasi &amp; cairkan
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-4 text-[11px] font-semibold tracking-widest text-ink-faint uppercase">
              Settlement &amp; pelunasan PGN
            </div>
            <div className="overflow-x-auto rounded-lg border border-line">
              <table className="w-full min-w-[680px] border-collapse bg-paper-raised text-[13.5px]">
                <thead>
                  <tr className="border-b border-line-strong text-left text-[11px] tracking-wide text-ink-faint uppercase">
                    <th className="px-4 py-2.5">Vendor</th>
                    <th className="px-4 py-2.5">Offset KMK</th>
                    <th className="px-4 py-2.5">Sisa dana</th>
                    <th className="px-4 py-2.5">Fee</th>
                    <th className="px-4 py-2.5">Pilihan vendor</th>
                    <th className="px-4 py-2.5">PGN bayar Mandiri</th>
                  </tr>
                </thead>
                <tbody>
                  {state.settlements.map((s) => {
                    const vendor = state.vendors.find((v) => v.id === s.vendorId)!;
                    return (
                      <tr key={s.id} className="border-b border-line last:border-0">
                        <td className="px-4 py-2.5 font-medium">{vendor.name}</td>
                        <td className="num px-4 py-2.5">{rupiah(s.kmkOffsetAmount)}</td>
                        <td className="num px-4 py-2.5">{rupiah(s.remainingAmount)}</td>
                        <td className="num px-4 py-2.5">{s.feeAmount ? rupiah(s.feeAmount) : "—"}</td>
                        <td className="px-4 py-2.5">
                          {s.choice === "belum_dipilih" ? (
                            <Badge tone="neutral">Belum dipilih</Badge>
                          ) : s.choice === "percepat_pencairan" ? (
                            <Badge tone="accent">Percepat</Badge>
                          ) : (
                            <Badge tone="gas">Tunggu jatuh tempo</Badge>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          {s.paidByPGN ? (
                            <Badge tone="good">Lunas {s.paidByPGNDate && shortDate(s.paidByPGNDate)}</Badge>
                          ) : s.choice === "belum_dipilih" ? (
                            <span className="text-ink-faint">—</span>
                          ) : (
                            <button
                              disabled={busyId === s.id}
                              onClick={() => pay(s.id)}
                              className="rounded border border-line-strong bg-paper px-2.5 py-1 text-[12.5px] font-medium text-ink hover:bg-paper-raised disabled:opacity-50"
                            >
                              Tandai dibayar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {state.settlements.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-ink-faint">
                        Belum ada settlement.
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
            Notifikasi &amp; log rekonsiliasi
          </div>
          <Card className="overflow-hidden">
            <NotificationFeed items={notifications} />
          </Card>
        </div>
      </div>
    </main>
  );
}
