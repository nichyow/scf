import type { FinancingStatus, InvoiceStatus, SettlementChoice } from "@/lib/types";

export interface StageInput {
  hasFinancing: boolean;
  financingStatus?: FinancingStatus;
  hasInvoice: boolean;
  invoiceStatus?: InvoiceStatus;
  hasSettlement: boolean;
  settlementChoice?: SettlementChoice;
  paidByPGN?: boolean;
}

type StageState = "done" | "active" | "pending" | "skipped";

interface Stage {
  n: string;
  title: string;
  state: StageState;
}

export function computeStages(input: StageInput): Stage[] {
  const financingDone = input.financingStatus === "dicairkan" || input.financingStatus === "lunas";
  const financingActive = input.financingStatus === "diajukan" || input.financingStatus === "diverifikasi";
  const invoiceApproved = input.invoiceStatus === "disetujui";
  const settlementResolved = !!input.hasSettlement && input.settlementChoice !== "belum_dipilih";

  return [
    { n: "0", title: "Kontrak / PO", state: "done" },
    {
      n: "1",
      title: "Pengajuan KMK",
      state: !input.hasFinancing ? "skipped" : "done",
    },
    {
      n: "2",
      title: "Verifikasi & pencairan KMK",
      state: !input.hasFinancing ? "skipped" : financingDone ? "done" : financingActive ? "active" : "pending",
    },
    {
      n: "3",
      title: "Submit invoice",
      state: input.hasInvoice ? "done" : "pending",
    },
    {
      n: "4",
      title: "Approval PGN",
      state: invoiceApproved ? "done" : input.hasInvoice ? "active" : "pending",
    },
    {
      n: "5",
      title: "Settlement otomatis",
      state: settlementResolved ? "done" : input.hasSettlement ? "active" : "pending",
    },
    {
      n: "6",
      title: "PGN bayar Mandiri",
      state: input.paidByPGN ? "done" : settlementResolved ? "active" : "pending",
    },
    {
      n: "7",
      title: "Sinkronisasi status",
      state: input.paidByPGN ? "done" : "pending",
    },
  ];
}

const stateStyle: Record<StageState, string> = {
  done: "border-gas bg-gas text-paper-raised",
  active: "border-gas text-gas bg-paper-raised",
  pending: "border-line-strong text-ink-faint bg-paper-raised",
  skipped: "border-dashed border-line-strong text-ink-faint bg-paper-raised",
};

const labelStyle: Record<StageState, string> = {
  done: "text-ink",
  active: "text-ink font-semibold",
  pending: "text-ink-faint",
  skipped: "text-ink-faint line-through decoration-line-strong",
};

export function StageTimeline(props: StageInput) {
  const stages = computeStages(props);
  return (
    <ol className="flex flex-wrap gap-x-1 gap-y-3">
      {stages.map((s, i) => (
        <li key={s.n} className="flex items-center">
          <span
            title={s.state === "skipped" ? `${s.title} — tidak digunakan (opsional)` : s.title}
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[10.5px] font-semibold ${stateStyle[s.state]}`}
          >
            {s.n}
          </span>
          <span className={`ml-1.5 mr-2.5 max-w-[9.5rem] text-[11.5px] leading-tight ${labelStyle[s.state]}`}>
            {s.title}
          </span>
          {i < stages.length - 1 && <span className="mr-2.5 h-px w-3 bg-line-strong" />}
        </li>
      ))}
    </ol>
  );
}
