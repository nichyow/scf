import type { FullState, SettlementChoice } from "./types";

async function call<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Terjadi kesalahan");
  return data as T;
}

export const api = {
  getState: () => call<FullState>("/api/state"),
  reset: () => call<FullState>("/api/reset", {}),
  createFinancing: (poId: string, amountRequested: number) =>
    call("/api/financing", { poId, amountRequested }),
  verifyFinancing: (financingId: string) =>
    call("/api/financing/verify", { financingId }),
  rejectFinancing: (financingId: string, reason?: string) =>
    call("/api/financing/reject", { financingId, reason }),
  submitInvoice: (input: { poId: string; amount: number; invoiceNumber: string; dueDate: string; financingId?: string }) =>
    call("/api/invoice", input),
  approveInvoice: (invoiceId: string) =>
    call("/api/invoice/approve", { invoiceId }),
  chooseSettlement: (settlementId: string, choice: SettlementChoice) =>
    call("/api/settlement/choice", { settlementId, choice }),
  paySettlement: (settlementId: string) =>
    call("/api/settlement/pay", { settlementId }),
};
