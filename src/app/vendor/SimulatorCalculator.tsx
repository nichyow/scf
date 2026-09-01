"use client";

import { useMemo, useState } from "react";
import { rupiah } from "@/lib/format";
import { Card } from "@/components/ui";

export function SimulatorCalculator() {
  const [amount, setAmount] = useState("1000000000");
  const [feeRate, setFeeRate] = useState("1.5");
  const [daysEarly, setDaysEarly] = useState("18");

  const value = Number(amount) || 0;
  const rate = Number(feeRate) || 0;

  const { fee, netToday, netWait } = useMemo(() => {
    const fee = Math.round(value * (rate / 100));
    return { fee, netToday: value - fee, netWait: value };
  }, [value, rate]);

  return (
    <Card className="p-5">
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <label className="text-[12.5px]">
          <span className="mb-1 block text-ink-faint">Nilai invoice yang disetujui</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded border border-line-strong bg-paper px-2.5 py-1.5 text-[13.5px] outline-none focus:border-gas"
          />
        </label>
        <label className="text-[12.5px]">
          <span className="mb-1 block text-ink-faint">Fee percepatan (%)</span>
          <input
            type="number"
            step="0.1"
            value={feeRate}
            onChange={(e) => setFeeRate(e.target.value)}
            className="w-full rounded border border-line-strong bg-paper px-2.5 py-1.5 text-[13.5px] outline-none focus:border-gas"
          />
        </label>
        <label className="text-[12.5px]">
          <span className="mb-1 block text-ink-faint">Percepatan (hari lebih awal)</span>
          <input
            type="number"
            value={daysEarly}
            onChange={(e) => setDaysEarly(e.target.value)}
            className="w-full rounded border border-line-strong bg-paper px-2.5 py-1.5 text-[13.5px] outline-none focus:border-gas"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-accent/30 bg-accent-soft px-4 py-3.5">
          <div className="mb-1 text-[11px] font-semibold tracking-wide text-accent uppercase">
            Cair hari ini — percepat
          </div>
          <div className="num text-xl font-semibold text-ink">{rupiah(netToday)}</div>
          <div className="mt-1 text-[12px] text-ink-soft">
            Dipotong fee {rate || 0}% ({rupiah(fee)}) · {daysEarly || 0} hari lebih cepat
          </div>
        </div>
        <div className="rounded-md border border-line bg-paper px-4 py-3.5">
          <div className="mb-1 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
            Tunggu jatuh tempo normal
          </div>
          <div className="num text-xl font-semibold text-ink">{rupiah(netWait)}</div>
          <div className="mt-1 text-[12px] text-ink-soft">Nilai penuh, cair saat PGN membayar Mandiri</div>
        </div>
      </div>
    </Card>
  );
}
