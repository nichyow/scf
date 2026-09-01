"use client";

import { useCallback, useEffect, useState } from "react";
import type { FullState } from "@/lib/types";
import { api } from "@/lib/api";
import { rupiah } from "@/lib/format";
import { Card, EmptyState, SectionHead, StatTile } from "@/components/ui";
import { NotificationFeed } from "@/components/NotificationFeed";
import { PoCard } from "./PoCard";
import { SimulatorCalculator } from "./SimulatorCalculator";

export default function VendorPortal() {
  const [state, setState] = useState<FullState | null>(null);
  const [vendorId, setVendorId] = useState<string>("v1");

  const refresh = useCallback(() => {
    api.getState().then(setState);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!state) {
    return <div className="mx-auto max-w-[1180px] px-6 py-14 text-ink-faint">Memuat data…</div>;
  }

  const vendor = state.vendors.find((v) => v.id === vendorId)!;
  const pos = state.purchaseOrders.filter((p) => p.vendorId === vendorId);
  const plafonTerpakai = state.financings
    .filter((f) => f.vendorId === vendorId && f.status !== "lunas" && f.status !== "ditolak")
    .reduce((sum, f) => sum + f.amountRequested, 0);
  const sisaPlafon = vendor.plafonKMK - plafonTerpakai;
  const notifications = state.notifications.filter(
    (n) => n.recipientRole === "vendor" && n.recipientLabel === vendor.name
  );

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <SectionHead
          eyebrow="Portal Vendor"
          title="Modal kerja & pencairan invoice"
          desc="Ajukan pembiayaan berbasis PO, submit invoice, dan pantau status pencairan secara transparan."
        />
        <label className="text-[13px]">
          <span className="mb-1 block text-ink-faint">Login sebagai</span>
          <select
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            className="rounded border border-line-strong bg-paper-raised px-3 py-1.5 text-[13.5px] outline-none focus:border-gas"
          >
            {state.vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <StatTile label="Plafon KMK" value={rupiah(vendor.plafonKMK)} sub={`Tier ${vendor.tier} · ${vendor.category}`} />
        <StatTile label="Terpakai" value={rupiah(plafonTerpakai)} />
        <StatTile label="Sisa tersedia" value={rupiah(sisaPlafon)} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-4 text-[11px] font-semibold tracking-widest text-ink-faint uppercase">
            PO aktif ({pos.length})
          </div>
          <div className="space-y-4">
            {pos.length === 0 && <EmptyState>Belum ada PO untuk vendor ini.</EmptyState>}
            {pos.map((po) => {
              const financingsForPo = state.financings.filter((f) => f.poId === po.id);
              const financing =
                financingsForPo.find((f) => f.status !== "ditolak") ?? financingsForPo[financingsForPo.length - 1];
              const invoice = state.invoices.find((i) => i.poId === po.id);
              const settlement = invoice ? state.settlements.find((s) => s.invoiceId === invoice.id) : undefined;
              return (
                <PoCard
                  key={po.id}
                  po={po}
                  vendor={vendor}
                  financing={financing}
                  invoice={invoice}
                  settlement={settlement}
                  sisaPlafon={sisaPlafon}
                  onChanged={refresh}
                />
              );
            })}
          </div>

          <div className="mt-10">
            <div className="mb-4 text-[11px] font-semibold tracking-widest text-ink-faint uppercase">
              Kalkulator simulasi pencairan
            </div>
            <SimulatorCalculator />
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
